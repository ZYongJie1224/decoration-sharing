import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useMaterialStore = defineStore('material', () => {
  // 状态
  const materials = ref([])
  const loading = ref(false)
  const totalMaterials = ref(0)
  const totalPages = ref(0)
  
  // 设置材料列表和分页信息
  function setMaterialsData(data) {
    materials.value = data.items || data.content || []
    totalMaterials.value = data.total || data.totalElements || 0
    totalPages.value = data.totalPages || 0
  }
  
  // 获取素材列表
  async function fetchMaterials(params = {}) {
    loading.value = true
    try {
      // 后端Controller期望的参数
      const apiParams = { 
        page: params.page || 0,
        pageSize: params.pageSize || 12,
        categoryId: params.categoryId || null,
        sort: params.sort || null,
        status: params.status || null,
        keyword: params.keyword || null
      }
      
      const response = await axios.get('/api/api/materials', { params: apiParams })
      
      setMaterialsData(response.data)
      return response.data
    } catch (error) {
      console.error('获取素材列表失败:', error)
      return { items: [], total: 0, totalPages: 0 }
    } finally {
      loading.value = false
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
      const apiParams = { 
        keyword,
        page: params.page || 0,
        pageSize: params.pageSize || 12,
        categoryId: params.categoryId || null
      }
      
      const response = await axios.get('/api/api/materials/search', { params: apiParams })
      
      setMaterialsData(response.data)
      return response.data
    } catch (error) {
      console.error('搜索素材失败:', error)
      return { items: [], total: 0, totalPages: 0 }
    } finally {
      loading.value = false
    }
  }
  
  // 上传素材
  async function uploadMaterial(formData) {
    loading.value = true
    try {
      const response = await axios.post('/api/api/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '上传素材失败'
      }
    } finally {
      loading.value = false
    }
  }
  
  // 收藏/取消收藏素材
  async function toggleFavorite(materialId) {
    try {
      const response = await axios.post(`/api/api/materials/${materialId}/favorite`)
      
      // 更新本地状态
      const index = materials.value.findIndex(m => m.id === materialId)
      if (index !== -1) {
        materials.value[index].isFavorite = response.data.isFavorite
        if (response.data.isFavorite) {
          materials.value[index].favorites++
        } else {
          materials.value[index].favorites--
        }
      }
      
      return { success: true, isFavorite: response.data.isFavorite }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '操作失败'
      }
    }
  }
  
  // 获取用户收藏的素材
  async function getUserFavorites(params = {}) {
    loading.value = true
    try {
      const apiParams = { 
        page: params.page || 0,
        pageSize: params.pageSize || 12,
        categoryId: params.categoryId || null,
        keyword: params.keyword || null
      }
      
      const response = await axios.get('/api/api/user/favorites', { params: apiParams })
      
      setMaterialsData(response.data)
      return response.data
    } catch (error) {
      console.error('获取用户收藏失败:', error)
      return { items: [], total: 0, totalPages: 0 }
    } finally {
      loading.value = false
    }
  }
  
  // 获取用户上传的素材
  async function getUserMaterials(params = {}) {
    loading.value = true
    try {
      const apiParams = { 
        page: params.page || 0,
        pageSize: params.pageSize || 12,
        status: params.status || null,
        categoryId: params.categoryId || null,
        keyword: params.keyword || null
      }
      
      const response = await axios.get('/api/api/user/materials', { params: apiParams })
      
      setMaterialsData(response.data)
      return response.data
    } catch (error) {
      console.error('获取用户上传素材失败:', error)
      return { items: [], total: 0, totalPages: 0 }
    } finally {
      loading.value = false
    }
  }
  
  return {
    // 状态
    materials,
    loading,
    totalMaterials,
    totalPages,
    
    // 方法
    fetchMaterials,
    fetchMaterialById,
    searchMaterials,
    uploadMaterial,
    toggleFavorite,
    getUserFavorites,
    getUserMaterials
  }
})