<template>
  <div class="favorites-view">
    <div class="page-container">
      <a-page-header
        title="我的收藏"
        sub-title="查看您收藏的所有素材"
        :back-icon="false"
      >
        <template #extra>
          <router-link to="/">
            <a-button>浏览更多素材</a-button>
          </router-link>
        </template>
      </a-page-header>

      <div class="favorites-stats">
        <a-statistic title="收藏总数" :value="totalFavorites" />
      </div>

      <a-divider />

      <!-- 筛选和搜索 -->
      <div class="filter-section">
        <a-row :gutter="[16, 16]" align="middle">
          <a-col :xs="24" :sm="12" :md="8">
            <a-select
              v-model:value="filters.categoryId"
              placeholder="按分类筛选"
              style="width: 100%"
              @change="handleFilterChange"
              allowClear
            >
              <a-select-option :value="null">全部分类</a-select-option>
              <a-select-option 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </a-select-option>
            </a-select>
          </a-col>
          
          <a-col :xs="24" :sm="12" :md="8">
            <a-input-search
              v-model:value="filters.keyword"
              placeholder="搜索收藏的素材"
              enter-button
              @search="handleSearch"
            />
          </a-col>

          <a-col :xs="24" :sm="24" :md="8">
            <a-select
              v-model:value="sortBy"
              placeholder="排序方式"
              style="width: 100%"
              @change="handleSortChange"
            >
              <a-select-option value="latest">最近收藏</a-select-option>
              <a-select-option value="oldest">最早收藏</a-select-option>
              <a-select-option value="title">按标题</a-select-option>
            </a-select>
          </a-col>
        </a-row>
      </div>

      <!-- 收藏列表 -->
      <a-spin :spinning="loading">
        <div v-if="favorites.length" class="favorites-grid">
          <a-row :gutter="[24, 24]">
            <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="material in favorites" :key="material.id">
              <div class="favorite-item">
                <material-card :material="material" />
                <div class="favorite-actions">
                  <a-button 
                    type="text" 
                    danger 
                    size="small"
                    @click="removeFavorite(material.id)"
                    :loading="removingIds.includes(material.id)"
                  >
                    取消收藏
                  </a-button>
                  <span class="favorite-date">
                    收藏于 {{ formatDate(material.favoriteAt) }}
                  </span>
                </div>
              </div>
            </a-col>
          </a-row>
          
          <!-- 分页 -->
          <div class="pagination-container">
            <a-pagination
              v-model:current="pagination.current"
              :total="pagination.total"
              :pageSize="pagination.pageSize"
              @change="handlePageChange"
              :showSizeChanger="true"
              :pageSizeOptions="['12', '24', '36', '48']"
              @showSizeChange="handleSizeChange"
              :showTotal="(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`"
            />
          </div>
        </div>
        
        <a-empty 
          v-else-if="!loading" 
          description="您还没有收藏任何素材"
          class="empty-placeholder"
        >
          <router-link to="/">
            <a-button type="primary">去发现精美素材</a-button>
          </router-link>
        </a-empty>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import MaterialCard from '@/components/material/MaterialCard.vue';
import { useUserStore } from '@/stores/user';
import { useMaterialStore } from '@/stores/material';
import { useCategoryStore } from '@/stores/category';
import { formatDate } from '@/utils/date';
import axios from 'axios';

const userStore = useUserStore();
const materialStore = useMaterialStore();
const categoryStore = useCategoryStore();

// 状态
const loading = ref(false);
const favorites = ref([]);
const categories = ref([]);
const sortBy = ref('latest');
const removingIds = ref([]);

// 筛选条件
const filters = reactive({
  categoryId: null,
  keyword: ''
});

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 12,
  total: 0
});

// 计算属性
const totalFavorites = computed(() => pagination.total);

// 初始化
onMounted(async () => {
  await loadCategories();
  await fetchFavorites();
});

// 加载分类列表
async function loadCategories() {
  try {
    await categoryStore.fetchCategories();
    categories.value = categoryStore.categories;
  } catch (error) {
    console.error('获取分类失败:', error);
  }
}

// 获取收藏列表
async function fetchFavorites() {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录');
    return;
  }

  loading.value = true;
  
  try {
    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
      sort: sortBy.value
    };
    
    // 添加筛选条件
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.keyword) params.keyword = filters.keyword;
    
    const response = await axios.get('/api/api/user/favorites', {
      params,
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    });
    
    if (response.data) {
      const data = response.data;
      favorites.value = data.content || data.items || data.data || [];
      pagination.total = data.totalElements || data.total || 0;
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    message.error('获取收藏列表失败');
    favorites.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
}

// 取消收藏
async function removeFavorite(materialId) {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录');
    return;
  }

  removingIds.value.push(materialId);
  
  try {
    await axios.delete(`/api/api/user/favorites/${materialId}`, {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    });
    
    message.success('已取消收藏');
    
    // 从列表中移除
    favorites.value = favorites.value.filter(item => item.id !== materialId);
    pagination.total = Math.max(0, pagination.total - 1);
    
    // 如果当前页没有数据了，回到上一页
    if (favorites.value.length === 0 && pagination.current > 1) {
      pagination.current--;
      await fetchFavorites();
    }
  } catch (error) {
    console.error('取消收藏失败:', error);
    message.error('取消收藏失败');
  } finally {
    removingIds.value = removingIds.value.filter(id => id !== materialId);
  }
}

// 处理筛选条件变化
function handleFilterChange() {
  pagination.current = 1;
  fetchFavorites();
}

// 处理搜索
function handleSearch() {
  pagination.current = 1;
  fetchFavorites();
}

// 处理排序变化
function handleSortChange() {
  pagination.current = 1;
  fetchFavorites();
}

// 处理分页变化
function handlePageChange(page) {
  pagination.current = page;
  fetchFavorites();
}

// 处理每页显示数量变化
function handleSizeChange(current, size) {
  pagination.current = 1;
  pagination.pageSize = size;
  fetchFavorites();
}
</script>

<style scoped>
.favorites-view {
  padding: 24px 0 60px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.favorites-stats {
  margin: 16px 0;
}

.filter-section {
  margin-bottom: 24px;
}

.favorites-grid {
  margin-top: 24px;
}

.favorite-item {
  position: relative;
}

.favorite-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #fafafa;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
}

.favorite-date {
  color: #999;
  font-size: 12px;
}

.pagination-container {
  margin-top: 40px;
  text-align: center;
}

.empty-placeholder {
  margin: 100px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .favorites-view {
    padding: 16px 0;
  }
  
  .page-container {
    padding: 0 16px;
  }
  
  .filter-section .ant-col {
    margin-bottom: 8px;
  }
}
</style>