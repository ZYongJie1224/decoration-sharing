import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useMaterialStore } from './material'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const token = ref('')
  const loading = ref(false)
  const error = ref(null)
  
  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => user.value?.username || '')
  const avatar = computed(() => user.value?.avatar || '')
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  
  // 设置用户
  function setUser(userData) {
    user.value = userData
  }
  
  // 设置token
  function setToken(tokenValue) {
    token.value = tokenValue
    // 保存到本地存储
    localStorage.setItem('token', tokenValue)
  }
  
  // 登录
  async function login(credentials) {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.post('/api/api/auth/login', credentials)
      
      const { token: authToken, user: userData } = response.data
      
      setToken(authToken)
      setUser(userData)
      
      // 设置axios默认headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      
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
  
  // 注册
  async function register(userData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.post('/api/api/auth/register', userData)
      return { success: true, data: response.data }
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
  
  // 登出
  function logout() {
    // 清除用户数据和token
    user.value = null
    token.value = ''
    
    // 清除本地存储
    localStorage.removeItem('token')
    
    // 清除axios默认headers
    delete axios.defaults.headers.common['Authorization']
    
    // 清除素材store的数据
    const materialStore = useMaterialStore()
    materialStore.clearData()
    
    return { success: true }
  }
  
  // 获取用户信息
  async function fetchUserInfo() {
    if (!token.value) return null
    
    loading.value = true
    
    try {
      const response = await axios.get('/api/api/auth/profile', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      
      setUser(response.data)
      return response.data
    } catch (err) {
      console.error('获取用户信息失败:', err)
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        // token可能已失效，登出用户
        logout()
      }
      
      return null
    } finally {
      loading.value = false
    }
  }
  
  // 更新个人资料
  async function updateProfile(profileData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.put('/api/api/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      
      // 更新本地用户数据
      setUser({ ...user.value, ...response.data })
      
      return { success: true, user: response.data }
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
  
  // 更新密码
  async function updatePassword(passwordData) {
    loading.value = true
    error.value = null
    
    try {
      await axios.put('/api/api/auth/password', passwordData, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      
      return { success: true }
    } catch (err) {
      console.error('更新密码失败:', err)
      error.value = err.response?.data?.message || '更新密码失败，请稍后再试'
      return { 
        success: false, 
        message: error.value 
      }
    } finally {
      loading.value = false
    }
  }
  
  // 初始化 - 从本地存储加载token
  function init() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
      // 获取用户信息
      fetchUserInfo()
    }
  }
  
  return {
    user,
    token,
    loading,
    error,
    isLoggedIn,
    username,
    avatar,
    isAdmin,
    login,
    register,
    logout,
    fetchUserInfo,
    updateProfile,
    updatePassword,
    init
  }
})