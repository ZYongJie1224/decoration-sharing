<template>
  <div class="category-view">
    <div class="category-hero" :style="heroStyle">
      <div class="category-hero-overlay">
        <div class="category-hero-content">
          <h1>{{ categoryInfo.name || '分类浏览' }}</h1>
          <p>{{ categoryInfo.description || '探索精选装修灵感' }}</p>
        </div>
      </div>
    </div>
    
    <div class="page-container">
      <a-row :gutter="[16, 16]" class="filter-row">
        <a-col :span="24">
          <a-space>
            <a-select
              v-model:value="filters.sort"
              style="width: 150px"
              @change="handleFilterChange"
            >
              <a-select-option value="latest">最新上传</a-select-option>
              <a-select-option value="popular">最受欢迎</a-select-option>
              <a-select-option value="recommend">推荐素材</a-select-option>
            </a-select>
            
            <a-input-search
              v-model:value="filters.keyword"
              placeholder="搜索当前分类"
              style="width: 250px"
              @search="handleSearch"
              enter-button
            />
          </a-space>
        </a-col>
      </a-row>
      
      <a-spin :spinning="loading">
        <div v-if="materials.length" class="materials-grid">
          <a-row :gutter="[24, 24]">
            <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="material in materials" :key="material.id">
              <material-card :material="material" />
            </a-col>
          </a-row>
          
          <div class="pagination-container">
            <a-pagination
              v-model:current="pagination.current"
              :pageSize="pagination.pageSize"
              :total="pagination.total"
              @change="handlePageChange"
              :showSizeChanger="true"
              :pageSizeOptions="['12', '24', '36', '48']"
              @showSizeChange="handleSizeChange"
            />
          </div>
        </div>
        
        <a-empty 
          v-else 
          description="暂无素材" 
          class="empty-placeholder"
        >
          <template #description>
            <span>该分类下暂无素材</span>
          </template>
          <router-link to="/">
            <a-button type="primary">浏览其他分类</a-button>
          </router-link>
        </a-empty>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import MaterialCard from '@/components/material/MaterialCard.vue';
import { useMaterialStore } from '@/stores/material';

const route = useRoute();
const materialStore = useMaterialStore();

// 状态
const loading = ref(false);
const materials = ref([]);
const categoryInfo = ref({});
const categoryBackgrounds = {
  1: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115',  // 客厅
  2: 'https://images.unsplash.com/photo-1501876725168-00c445821c9e',  // 卧室
  3: 'https://images.unsplash.com/photo-1556911220-bff31c812dba',     // 厨房
  4: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a',  // 卫生间
  5: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be',  // 书房
  6: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da',  // 阳台
  7: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6',  // 其他
  default: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6'
};

// 筛选条件
const filters = reactive({
  sort: 'latest',
  keyword: ''
});

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 12,
  total: 0
});

// 计算属性
const heroStyle = computed(() => {
  const bgUrl = categoryBackgrounds[categoryInfo.value?.id] || categoryBackgrounds.default;
  return {
    backgroundImage: `url(${bgUrl})`
  };
});

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadCategory(newId);
      resetFilters();
      fetchCategoryMaterials();
    }
  }
);

// 初始化
onMounted(async () => {
  // 获取分类列表
  await materialStore.fetchCategories();
  
  // 获取当前分类信息
  if (route.params.id) {
    loadCategory(route.params.id);
    fetchCategoryMaterials();
  }
});

// 加载分类信息
function loadCategory(categoryId) {
  const categories = materialStore.categories;
  const category = categories.find(c => c.id === categoryId || c.id === parseInt(categoryId));
  
  if (category) {
    categoryInfo.value = category;
    document.title = `${category.name} - 装修素材分享`;
  } else {
    categoryInfo.value = { name: '未知分类', description: '该分类不存在或已被删除' };
    document.title = '分类浏览 - 装修素材分享';
  }
}

// 重置筛选条件
function resetFilters() {
  filters.sort = 'latest';
  filters.keyword = '';
  pagination.current = 1;
}

// 获取分类素材
async function fetchCategoryMaterials() {
  loading.value = true;
  
  try {
    const params = {
      categoryId: route.params.id,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sort: filters.sort,
      keyword: filters.keyword
    };
    
    const result = await materialStore.fetchMaterials(params);
    
    materials.value = result.items;
    pagination.total = result.total;
  } catch (error) {
    console.error('获取分类素材失败:', error);
  } finally {
    loading.value = false;
  }
}

// 处理筛选条件变化
function handleFilterChange() {
  pagination.current = 1;
  fetchCategoryMaterials();
}

// 处理搜索
function handleSearch() {
  pagination.current = 1;
  fetchCategoryMaterials();
}

// 处理分页变化
function handlePageChange(page) {
  pagination.current = page;
  fetchCategoryMaterials();
  
  // 滚动到内容顶部
  window.scrollTo({
    top: document.querySelector('.filter-row').offsetTop - 80,
    behavior: 'smooth'
  });
}

// 处理每页显示数量变化
function handleSizeChange(current, size) {
  pagination.current = 1;
  pagination.pageSize = size;
  fetchCategoryMaterials();
}
</script>

<style scoped>
.category-view {
  padding-bottom: 60px;
}

.category-hero {
  height: 300px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.category-hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-hero-content {
  text-align: center;
  color: white;
  padding: 0 24px;
}

.category-hero-content h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
}

.category-hero-content p {
  font-size: 18px;
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.9;
}

.filter-row {
  margin: 24px 0;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pagination-container {
  margin-top: 40px;
  text-align: center;
}

.empty-placeholder {
  margin: 100px 0;
}
</style>