import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useUserStore } from './user'

export const useMaterialStore = defineStore('material', () => {
  // 状态
  const materials = ref([])
  const categories = ref([])
  const loading = ref(false)
  const totalMaterials = ref(0)
  
  // 设置材料列表和总数
  function setMaterials(items, total) {
    materials.value = items || []
    totalMaterials.value = total || 0
  }
  
  // 获取材料列表
  async function fetchMaterials(params = {}) {
    loading.value = true
    try {
      // 调整API请求参数
      const apiParams = { ...params }
      // 可能需要处理页码
      if (typeof apiParams.page !== 'undefined') {
        apiParams.page = Math.max(0, apiParams.page)
      }
      
      // 确保status参数大写
      if (apiParams.status && typeof apiParams.status === 'string') {
        apiParams.status = apiParams.status.toUpperCase()
      } else {
        // 默认只获取已审核的素材
        apiParams.status = 'APPROVED';
      }
      
      const response = await axios.get('/api/api/materials', { params: apiParams })
      
      // 处理可能的不同响应格式
      if (response.data) {
        materials.value = response.data.items || response.data.content || []
        totalMaterials.value = response.data.total || response.data.totalElements || 0
      }
      
      return response.data
    } catch (error) {
      console.error('获取素材列表失败:', error)
      materials.value = []
      totalMaterials.value = 0
      return { items: [], total: 0 }
    } finally {
      loading.value = false
    }
  }
  
  // 获取分类列表
  async function fetchCategories() {
    try {
      const response = await axios.get('/api/api/categories')
      // 处理响应格式
      const categoriesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.content || response.data?.data || [])
      
      categories.value = categoriesData
      return categoriesData
    } catch (error) {
      console.error('获取分类列表失败:', error)
      return []
    }
  }
  
  // 获取素材详情
  async function fetchMaterialById(id) {
    loading.value = true
    try {
      const response = await axios.get(`/api/api/materials/${id}`)
      return response.data
    } catch (error) {
      console.error(`获取素材 ${id} 详情失败:`, error)
      return null
    } finally {
      loading.value = false
    }
  }
  
  // 搜索素材
  async function searchMaterials(keyword, params = {}) {
    loading.value = true
    try {
      // 搜索API可能不同，也可能是同一个API添加keyword参数
      const apiParams = {
        ...params,
        keyword,
        status: 'APPROVED' // 默认只搜索已审核通过的素材
      }
      
      // 处理页码
      if (typeof apiParams.page !== 'undefined') {
        apiParams.page = Math.max(0, apiParams.page)
      }
      
      const response = await axios.get('/api/api/materials/search', { params: apiParams })
      
      // 处理响应
      if (response.data) {
        materials.value = response.data.items || response.data.content || []
        totalMaterials.value = response.data.total || response.data.totalElements || 0
      }
      
      return response.data
    } catch (error) {
      console.error('搜索素材失败:', error)
      materials.value = []
      totalMaterials.value = 0
      return { items: [], total: 0 }
    } finally {
      loading.value = false
    }
  }
  
  // 上传素材
  async function uploadMaterial(formData) {
    const userStore = useUserStore()
    
    try {
      const response = await axios.post('/api/api/materials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userStore.token}`
        }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '上传素材失败'
      }
    }
  }
  
  // 切换收藏状态
  async function toggleFavorite(materialId) {
    const userStore = useUserStore()
    
    try {
      const response = await axios.post(`/api/api/materials/${materialId}/favorite`, {}, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
      
      // 更新本地状态
      const index = materials.value.findIndex(m => m.id === materialId)
      if (index !== -1) {
        const isFavorite = response.data.isFavorite;
        materials.value[index].isFavorite = isFavorite;
        
        // 更新收藏数量
        if (isFavorite) {
          materials.value[index].favorites = (materials.value[index].favorites || 0) + 1;
        } else {
          materials.value[index].favorites = Math.max((materials.value[index].favorites || 0) - 1, 0);
        }
      }
      
      return { success: true, isFavorite: response.data.favorite }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '操作失败'
      }
    }
  }
  
  // 获取用户收藏
  async function getUserFavorites(params = {}) {
    const userStore = useUserStore()
    loading.value = true
    
    try {
      // 处理页码
      const apiParams = { ...params }
      if (typeof apiParams.page !== 'undefined') {
        apiParams.page = Math.max(0, apiParams.page)
      }
      
      const response = await axios.get('/api/api/user/favorites', {
        params: apiParams,
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
      
      // 设置材料列表和总数
      if (response.data) {
        materials.value = response.data.items || response.data.content || []
        totalMaterials.value = response.data.total || response.data.totalElements || 0
      }
      
      return response.data
    } catch (error) {
      console.error('获取用户收藏失败:', error)
      materials.value = []
      totalMaterials.value = 0
      return { items: [], total: 0 }
    } finally {
      loading.value = false
    }
  }
  
  // 获取用户上传
  async function getUserUploads(params = {}) {
    const userStore = useUserStore()
    loading.value = true
    
    try {
      // 处理页码
      const apiParams = { ...params }
      if (typeof apiParams.page !== 'undefined') {
        apiParams.page = Math.max(0, apiParams.page)
      }
      
      const response = await axios.get('/api/api/user/materials', {
        params: apiParams,
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
      
      // 设置材料列表和总数
      if (response.data) {
        materials.value = response.data.items || response.data.content || []
        totalMaterials.value = response.data.total || response.data.totalElements || 0
      }
      
      return response.data
    } catch (error) {
      console.error('获取用户上传失败:', error)
      materials.value = []
      totalMaterials.value = 0
      return { items: [], total: 0 }
    } finally {
      loading.value = false
    }
  }
  
  // 修改素材
  async function updateMaterial(id, data) {
    const userStore = useUserStore()
    
    try {
      const response = await axios.put(`/api/api/materials/${id}`, data, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
      
      // 更新本地状态
      const index = materials.value.findIndex(m => m.id === id)
      if (index !== -1) {
        materials.value[index] = { ...materials.value[index], ...response.data }
      }
      
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '修改素材失败'
      }
    }
  }
  
  // 删除素材
  async function deleteMaterial(id) {
    const userStore = useUserStore()
    
    try {
      await axios.delete(`/api/api/materials/${id}`, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
      
      // 更新本地状态
      materials.value = materials.value.filter(m => m.id !== id)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除素材失败'
      }
    }
  }
  
  // 根据ID获取素材
  function getMaterialById(id) {
    return materials.value.find(m => m.id === id) || null
  }
  
  // 清空数据（登出时调用）
  function clearData() {
    materials.value = []
    totalMaterials.value = 0
  }
  
  return {
    materials,
    categories,
    loading,
    totalMaterials,
    setMaterials,
    fetchMaterials,
    fetchCategories,
    fetchMaterialById,
    searchMaterials,
    uploadMaterial,
    toggleFavorite,
    getUserFavorites,
    getUserUploads,
    updateMaterial,
    deleteMaterial,
    getMaterialById,
    clearData
  }
})