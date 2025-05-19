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
      :showTotal="(total) => `共 ${total} 项`"
      class="pagination"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import MaterialCard from '@/components/material/MaterialCard.vue';
import { useCategoryStore } from '@/stores/category';
import { useMaterialStore } from '@/stores/material';

const route = useRoute();
const categoryStore = useCategoryStore();
const materialStore = useMaterialStore();

const categoryId = ref(null);
const currentPage = ref(1);
const pageSize = ref(12);

// 从store获取数据
const category = computed(() => categoryStore.getCategoryById(categoryId.value));
const materials = computed(() => materialStore.materials);
const totalItems = computed(() => materialStore.totalMaterials);
const loading = computed(() => materialStore.loading || categoryStore.loading);

// 获取分类详情
async function fetchCategory() {
  try {
    await categoryStore.fetchCategoryById(categoryId.value);
  } catch (error) {
    console.error('获取分类详情失败:', error);
    message.error('获取分类详情失败');
  }
}

// 获取分类下的素材
async function fetchMaterials() {
  try {
    const params = {
      page: currentPage.value - 1,
      pageSize: pageSize.value,
      categoryId: categoryId.value,
      sort: 'latest',
      status: 'APPROVED' // 只显示已审核的素材
    };
    
    await materialStore.fetchMaterials(params);
  } catch (error) {
    console.error('获取素材失败:', error);
    message.error('获取素材列表失败');
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
  currentPage.value = 1; // 更改每页大小时通常重置到第一页
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