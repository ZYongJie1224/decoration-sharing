import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
  const loading = ref(false)
  
  // 初始化时设置 token 到 axios headers，确保页面刷新后仍能保持 token
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }
  
  // 计算属性（getters）
  const isLoggedIn = computed(() => !!token.value && !!user.value.id)
  const isAdmin = computed(() => user.value.role === 'ADMIN')
  const username = computed(() => user.value.username || '')
  const avatar = computed(() => {
    const url = user.value.avatar
    if (!url) return '/images/default-avatar.png'
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    return url.startsWith('/') ? url : `/uploads/avatars/${url}`
  })
  
  // 登录方法 - 不需要 token
  async function login(credentials) {
    loading.value = true
    try {
      // 直接使用axios调用登录接口
      const response = await axios.post('/api/api/auth/login', credentials)
      const { token: tokenValue, user: userData } = response.data
      
      setAuth(tokenValue, userData)
      
      return { success: true }
    } catch (error) {
      console.error('登录失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '登录失败，请检查用户名和密码' 
      }
    } finally {
      loading.value = false
    }
  }
  
  // 注册方法 - 不需要 token
  async function register(userData) {
    loading.value = true
    try {
      // 直接使用axios调用注册接口
      const response = await axios.post('/api/api/auth/register', userData)
      const { token: tokenValue, user: registeredUser } = response.data
      
      setAuth(tokenValue, registeredUser)
      
      return { success: true }
    } catch (error) {
      console.error('注册失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '注册失败，请稍后再试' 
      }
    } finally {
      loading.value = false
    }
  }
  
  // 获取用户信息 - 需要 token
  async function fetchUserInfo() {
    if (!token.value) return
    console.log("获取用户信息")
    
    loading.value = true
    try {
      // 使用axios获取用户信息，Authorization header已通过默认设置
      const response = await axios.get('/api/api/auth/profile')
      const userData = response.data
      
      setUser(userData)
      return userData
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果401或403错误，则登出用户
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout()
      }
    } finally {
      loading.value = false
    }
  }
  
// 更新个人资料 - 需要 token
async function updateProfile(userData) {
  loading.value = true
  try {
    // 使用axios更新用户资料，Authorization header已通过默认设置
    const response = await axios.put('/api/api/auth/profile', userData)
    const updatedUser = response.data
    
    // 修改这一行，确保只更新用户资料，不丢失现有的认证信息
    // 注意区分我们如何处理合并
    setUser(updatedUser, true) // 添加参数表示这是部分更新
    
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('更新资料失败:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || '更新资料失败，请稍后再试' 
    }
  } finally {
    loading.value = false
  }
}
  
  // 更新密码 - 需要 token
  async function updatePassword(passwordData) {
    loading.value = true
    try {
      // 使用axios更新密码，Authorization header已通过默认设置
      await axios.put('/api/api/user/password', passwordData)
      return { success: true }
    } catch (error) {
      console.error('修改密码失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '修改密码失败，请稍后再试' 
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
    
    // 设置全局axios默认请求头，确保所有后续请求携带token
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`
  }
  // 设置用户信息
// 添加isPartialUpdate参数，指示是完全替换还是部分更新
function setUser(userData, isPartialUpdate = false) {
  if (isPartialUpdate) {
    // 部分更新 - 只更新提供的字段，保留其他字段
    user.value = { ...user.value, ...userData }
  } else {
    // 完全替换
    user.value = userData
  }
  
  // 保存到本地存储
  localStorage.setItem('user', JSON.stringify(user.value))
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
  
  // 返回所有状态和方法
  return {
    // 状态
    token,
    user,
    loading,
    
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
    setAuth,
    setUser,
    logout
  }
})