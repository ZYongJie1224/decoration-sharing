import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
  const loading = ref(false)
  const error = ref(null)
  
  // 初始化时设置 token 到 axios headers
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }
  
  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!user.value.id)
  const isAdmin = computed(() => user.value.role === 'ADMIN')
  const username = computed(() => user.value.username || '')
  const avatar = computed(() => {
    const url = user.value.avatar
    if (!url) return '/images/default-avatar.png'
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    return url.startsWith('/') ? url : `/uploads/${url}`
  })
  
  // 登录方法
  async function login(credentials) {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.post('/api/api/auth/login', credentials)
      const { token: tokenValue, user: userData } = response.data
      
      setAuth(tokenValue, userData)
      
      return { success: true }
    } catch (err) {
      console.error('登录失败:', err)
      error.value = err.response?.data?.message || '登录失败，请检查用户名和密码'
      return { 
        success: false, 
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }
  
  // 注册方法
  async function register(userData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.post('/api/api/auth/register', userData)
      const { token: tokenValue, user: registeredUser } = response.data
      
      setAuth(tokenValue, registeredUser)
      
      return { success: true }
    } catch (err) {
      console.error('注册失败:', err)
      error.value = err.response?.data?.message || '注册失败，请稍后再试'
      return { 
        success: false, 
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }
  
  // 获取用户详细信息，包含统计数据
  async function fetchUserInfo() {
    if (!token.value) return null
    
    loading.value = true
    error.value = null
    
    try {
      // 优先从 /profile 获取包含统计信息的详细数据
      const response = await axios.get('/api/api/profile')
      const userData = response.data
      
      setUser(userData)
      return userData
    } catch (profileError) {
      console.error('获取详细信息失败，尝试获取基本信息:', profileError)
      
      try {
        // 如果获取详细信息失败，尝试获取基本信息
        const basicResponse = await axios.get('/api/api/auth/profile')
        const basicUserData = basicResponse.data
        
        setUser(basicUserData)
        return basicUserData
      } catch (err) {
        console.error('获取用户信息失败:', err)
        error.value = err.response?.data?.message || '获取用户信息失败'
        
        // 如果401或403错误，则登出用户
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          logout()
        }
        
        return null
      }
    } finally {
      loading.value = false
    }
  }
  
  // 更新个人资料
  async function updateProfile(profileData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.put('/api/api/auth/profile', profileData)
      const updatedUser = response.data
      
      // 合并用户数据
      setUser({ ...user.value, ...updatedUser })
      
      return { success: true, user: updatedUser }
    } catch (err) {
      console.error('更新资料失败:', err)
      error.value = err.response?.data?.message || '更新资料失败，请稍后再试'
      return { 
        success: false, 
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }
  
  // 更新用户密码
  async function updatePassword(passwordData) {
    loading.value = true
    error.value = null
    
    try {
      await axios.put('/api/api/profile/password', passwordData)
      return { success: true }
    } catch (err) {
      console.error('修改密码失败:', err)
      error.value = err.response?.data?.message || '修改密码失败，请稍后再试'
      return { 
        success: false, 
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }
  
  // 上传头像(单独方法，便于直接调用)
  async function uploadAvatar(file) {
    loading.value = true
    error.value = null
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await axios.post('/api/api/profile/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return { 
        success: true, 
        data: response.data.data || response.data.url || response.data
      }
    } catch (err) {
      console.error('上传头像失败:', err)
      error.value = err.response?.data?.message || '上传头像失败'
      return { 
        success: false, 
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }
  
  // 设置认证信息
  function setAuth(tokenValue, userData) {
    token.value = tokenValue
    user.value = userData
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userData))
    
    // 设置全局axios默认请求头
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`
  }
  
  // 设置用户信息
  function setUser(userData) {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }
  
  // 退出登录
  function logout() {
    token.value = ''
    user.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // 清除全局axios默认请求头
    delete axios.defaults.headers.common['Authorization']
  }
  
  return {
    // 状态
    token,
    user,
    loading,
    error,
    
    // 计算属性
    isLoggedIn,
    isAdmin,
    username,
    avatar,
    
    // 方法
    login,
    register,
    fetchUserInfo,
    updateProfile,
    updatePassword,
    uploadAvatar,
    setAuth,
    setUser,
    logout
  }
})