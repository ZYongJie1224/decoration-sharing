<template>
  <div class="category-materials">
    <div class="category-header" v-if="category">
      <h1>{{ category.name }}</h1>
      <p>{{ category.description }}</p>
    </div>
    
    <a-spin :spinning="loading">
      <div class="materials-grid" v-if="materials.length > 0">
        <material-card 
          v-for="material in materials" 
          :key="material.id" 
          :material="material"
        />
      </div>
      <a-empty v-else description="暂无数据" />
    </a-spin>
    
    <a-pagination
      v-if="totalItems > 0"
      v-model:current="currentPage"
      :total="totalItems"
      :pageSize="pageSize"
      @change="handlePageChange"
      showSizeChanger
      :pageSizeOptions="['12', '24', '36', '48']"
      @showSizeChange="handleSizeChange"
      showTotal="共 {{totalItems}} 项"
      class="pagination"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { getMaterials } from '@/api/material';
import { getCategoryById } from '@/api/category';
import MaterialCard from '@/components/material/MaterialCard.vue';

const route = useRoute();
const categoryId = ref(null);
const category = ref(null);
const materials = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(12);
const totalItems = ref(0);

// 获取分类详情
async function fetchCategory() {
  try {
    const data = await getCategoryById(categoryId.value);
    category.value = data;
  } catch (error) {
    console.error('获取分类详情失败:', error);
    message.error('获取分类详情失败');
  }
}

// 获取分类下的素材
async function fetchMaterials() {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value - 1,
      pageSize: pageSize.value,
      categoryId: categoryId.value,
      sort: 'latest'
    };
    
    const response = await getMaterials(params);
    materials.value = response.items;
    totalItems.value = response.total;
  } catch (error) {
    console.error('获取素材失败:', error);
    message.error('获取素材列表失败');
  } finally {
    loading.value = false;
  }
}

// 切换页码
function handlePageChange(page) {
  currentPage.value = page;
  fetchMaterials();
}

// 改变每页数量
function handleSizeChange(current, size) {
  pageSize.value = size;
  fetchMaterials();
}

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    categoryId.value = parseInt(newId);
    currentPage.value = 1;
    fetchCategory();
    fetchMaterials();
  }
});

// 组件挂载时获取数据
onMounted(() => {
  if (route.params.id) {
    categoryId.value = parseInt(route.params.id);
    fetchCategory();
    fetchMaterials();
  }
});
</script>

<style scoped>
.category-materials {
  padding: 24px;
}

.category-header {
  margin-bottom: 24px;
  text-align: center;
}

.category-header h1 {
  font-size: 32px;
  margin-bottom: 8px;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.pagination {
  text-align: center;
  margin-top: 24px;
}
</style>