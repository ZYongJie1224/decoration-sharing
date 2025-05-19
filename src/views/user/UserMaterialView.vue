<template>
  <div class="user-materials">
    <h1>我的上传</h1>
    
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="all" tab="全部素材">
        <a-spin :spinning="loading">
          <div class="materials-grid" v-if="materials.length > 0">
            <material-card 
              v-for="material in materials" 
              :key="material.id" 
              :material="material"
            />
          </div>
          <a-empty v-else description="暂无上传的素材" />
        </a-spin>
      </a-tab-pane>
      <a-tab-pane key="pending" tab="审核中">
        <a-spin :spinning="loading">
          <div class="materials-grid" v-if="pendingMaterials.length > 0">
            <material-card 
              v-for="material in pendingMaterials" 
              :key="material.id" 
              :material="material"
            />
          </div>
          <a-empty v-else description="暂无审核中的素材" />
        </a-spin>
      </a-tab-pane>
      <a-tab-pane key="rejected" tab="未通过">
        <a-spin :spinning="loading">
          <div class="materials-grid" v-if="rejectedMaterials.length > 0">
            <material-card 
              v-for="material in rejectedMaterials" 
              :key="material.id" 
              :material="material"
            />
          </div>
          <a-empty v-else description="暂无被拒绝的素材" />
        </a-spin>
      </a-tab-pane>
    </a-tabs>
    
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
import { ref, computed, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import { getUserMaterials } from '@/api/user';
import MaterialCard from '@/components/material/MaterialCard.vue';

const activeTab = ref('all');
const materials = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(12);
const totalItems = ref(0);

// 计算属性：审核中的素材
const pendingMaterials = computed(() => {
  return materials.value.filter(item => item.status === 'PENDING');
});

// 计算属性：被拒绝的素材
const rejectedMaterials = computed(() => {
  return materials.value.filter(item => item.status === 'REJECTED');
});

// 获取用户上传的素材
async function fetchMaterials() {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value - 1,
      pageSize: pageSize.value,
      status: activeTab.value === 'all' ? '' : activeTab.value.toUpperCase()
    };
    
    const response = await getUserMaterials(params);
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

// 监听标签页变化
watch(() => activeTab.value, () => {
  currentPage.value = 1;
  fetchMaterials();
});

// 组件挂载时获取数据
onMounted(() => {
  fetchMaterials();
});
</script>

<style scoped>
.user-materials {
  padding: 24px;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin: 24px 0;
}

.pagination {
  text-align: center;
  margin-top: 24px;
}
</style>