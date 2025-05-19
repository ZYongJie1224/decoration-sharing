import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useCategoryStore = defineStore('category', () => {
  // 状态
  const categories = ref([])
  const currentCategory = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 获取所有分类
  async function fetchCategories() {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get('/api/api/categories')
      categories.value = response.data
      return categories.value
    } catch (err) {
      console.error('获取分类列表失败:', err)
      error.value = err.response?.data?.message || '获取分类列表失败'
      return []
    } finally {
      loading.value = false
    }
  }

  // 通过ID获取分类
  async function fetchCategoryById(id) {
    loading.value = true
    error.value = null
    
    try {
      // 如果已经在缓存中，直接返回
      const cached = categories.value.find(cat => cat.id === Number(id))
      if (cached) {
        currentCategory.value = cached
        return cached
      }
      
      // 否则从API获取
      const response = await axios.get(`/api/api/api/api/categories/${id}`)
      currentCategory.value = response.data
      
      // 更新缓存
      const index = categories.value.findIndex(cat => cat.id === Number(id))
      if (index === -1) {
        categories.value.push(response.data)
      } else {
        categories.value[index] = response.data
      }
      
      return currentCategory.value
    } catch (err) {
      console.error(`获取分类 ${id} 失败:`, err)
      error.value = err.response?.data?.message || `获取分类详情失败`
      return null
    } finally {
      loading.value = false
    }
  }

  // 按名称排序分类
  const categoriesByName = computed(() => {
    return [...categories.value].sort((a, b) => a.name.localeCompare(b.name))
  })

  // 按默认排序字段排序分类
  const categoriesBySort = computed(() => {
    return [...categories.value].sort((a, b) => b.sort - a.sort)
  })

  // 获取分类Map，方便通过ID快速查找
  const categoryMap = computed(() => {
    const map = new Map()
    categories.value.forEach(category => {
      map.set(category.id, category)
    })
    return map
  })

  // 通过ID获取分类名称的辅助函数
  function getCategoryNameById(id) {
    const category = categoryMap.value.get(Number(id))
    return category ? category.name : '未知分类'
  }

  // 通过ID获取完整分类对象的辅助函数
  function getCategoryById(id) {
    return categoryMap.value.get(Number(id)) || null
  }

  // 重置当前分类
  function resetCurrentCategory() {
    currentCategory.value = null
  }

  return {
    // 状态
    categories,
    currentCategory,
    loading,
    error,
    
    // 计算属性
    categoriesByName,
    categoriesBySort,
    categoryMap,
    
    // 方法
    fetchCategories,
    fetchCategoryById,
    getCategoryNameById,
    getCategoryById,
    resetCurrentCategory
  }
})