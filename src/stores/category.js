import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useCategoryStore = defineStore('category', () => {
  // 状态
  const categories = ref([])
  const currentCategory = ref(null)
  const loading = ref(false)
  
  // 获取所有分类
  async function fetchCategories() {
    loading.value = true
    try {
      const response = await axios.get('/api/api/categories')
      categories.value = response.data || []
      return categories.value
    } catch (error) {
      console.error('获取分类列表失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }
  
  // 根据ID获取分类
  async function fetchCategoryById(id) {
    if (!id) return null
    
    loading.value = true
    try {
      const response = await axios.get(`/api/api/categories/${id}`)
      currentCategory.value = response.data
      return currentCategory.value
    } catch (error) {
      console.error(`获取分类 ${id} 详情失败:`, error)
      return null
    } finally {
      loading.value = false
    }
  }
  
  // 从本地状态获取分类
  function getCategoryById(id) {
    // 如果id匹配当前分类的id，则返回当前分类
    if (currentCategory.value && currentCategory.value.id === Number(id)) {
      return currentCategory.value
    }
    
    // 否则从缓存的分类列表中查找
    return categories.value.find(c => c.id === Number(id)) || null
  }
  
  // 获取分类名称
  function getCategoryName(id) {
    const category = getCategoryById(id)
    return category ? category.name : ''
  }
  
  return {
    categories,
    currentCategory,
    loading,
    fetchCategories,
    fetchCategoryById,
    getCategoryById,
    getCategoryName
  }
})