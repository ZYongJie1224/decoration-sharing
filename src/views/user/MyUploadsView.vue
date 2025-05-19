<template>
  <div class="my-uploads-view">
    <div class="page-container">
      <a-page-header
        title="我的上传"
        sub-title="管理您上传的素材"
        :back-icon="false"
      />
      
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="all" tab="全部素材"></a-tab-pane>
        <a-tab-pane key="pending" tab="审核中"></a-tab-pane>
        <a-tab-pane key="approved" tab="已通过"></a-tab-pane>
        <a-tab-pane key="rejected" tab="已拒绝"></a-tab-pane>
      </a-tabs>
      
      <a-row :gutter="[16, 16]" class="filter-row">
        <a-col :span="12">
          <a-select
            v-model:value="filter.categoryId"
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
        
        <a-col :span="12">
          <a-input-search
            v-model:value="filter.keyword"
            placeholder="搜索我的上传"
            enter-button
            @search="handleSearch"
          />
        </a-col>
      </a-row>
      
      <a-spin :spinning="loading">
        <div v-if="materials.length" class="materials-grid">
          <a-row :gutter="[24, 24]">
            <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="material in materials" :key="material.id">
              <div class="material-upload-card">
                <material-card :material="material" />
                
                <div class="material-actions">
                  <a-space>
                    <a-button 
                      type="primary" 
                      size="small"
                      @click="viewMaterial(material)"
                    >
                      查看
                    </a-button>
                    
                    <a-button 
                      v-if="material.status === 'rejected'"
                      type="default" 
                      size="small"
                      @click="showRejectedReason(material)"
                    >
                      查看原因
                    </a-button>
                    
                    <a-button 
                      v-if="material.status === 'rejected'"
                      type="primary" 
                      size="small"
                      @click="resubmitMaterial(material)"
                    >
                      重新提交
                    </a-button>
                    
                    <a-popconfirm
                      title="确定要删除这个素材吗?"
                      ok-text="是"
                      cancel-text="否"
                      @confirm="deleteMaterial(material)"
                    >
                      <a-button 
                        type="danger" 
                        size="small"
                      >
                        删除
                      </a-button>
                    </a-popconfirm>
                  </a-space>
                </div>
              </div>
            </a-col>
          </a-row>
          
          <div class="pagination-container">
            <a-pagination
              v-model:current="pagination.current"
              :total="pagination.total"
              :pageSize="pagination.pageSize"
              @change="handlePageChange"
              :showSizeChanger="true"
              :pageSizeOptions="['12', '24', '36', '48']"
              @showSizeChange="handleSizeChange"
            />
          </div>
        </div>
        
        <a-empty 
          v-else 
          description="暂无上传素材" 
          class="empty-placeholder"
        >
          <template #description>
            <span>您还没有上传素材或没有符合筛选条件的素材</span>
          </template>
          <router-link to="/upload">
            <a-button type="primary">立即上传</a-button>
          </router-link>
        </a-empty>
      </a-spin>
    </div>
    
    <!-- 拒绝原因模态框 -->
    <a-modal
      v-model:visible="reasonModalVisible"
      title="拒绝原因"
      :footer="null"
    >
      <a-alert
        message="素材审核未通过"
        :description="selectedMaterial.rejectReason"
        type="error"
        show-icon
      />
      
      <div class="reason-actions">
        <a-button type="primary" @click="resubmitMaterial(selectedMaterial)">
          修改后重新提交
        </a-button>
      </div>
    </a-modal>
    
    <!-- 重新提交模态框 -->
    <a-modal
      v-model:visible="resubmitModalVisible"
      title="重新提交素材"
      :confirmLoading="submitLoading"
      @ok="handleResubmit"
    >
      <a-form
        :model="resubmitForm"
        layout="vertical"
      >
        <a-form-item label="素材标题" name="title">
          <a-input v-model:value="resubmitForm.title" />
        </a-form-item>
        
        <a-form-item label="所属分类" name="categoryId">
          <a-select v-model:value="resubmitForm.categoryId">
            <a-select-option 
              v-for="category in categories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="素材描述" name="description">
          <a-textarea v-model:value="resubmitForm.description" :rows="4" />
        </a-form-item>
        
        <a-form-item label="标签" name="tags">
          <a-select
            v-model:value="resubmitForm.tags"
            mode="tags"
            placeholder="输入标签，按回车键添加"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import MaterialCard from '@/components/material/MaterialCard.vue';
import { useMaterialStore } from '@/stores/material';

const router = useRouter();
const materialStore = useMaterialStore();

// 状态
const loading = ref(false);
const materials = ref([]);
const categories = ref([]);
const activeTab = ref('all');
const selectedMaterial = ref({});

// 模态框状态
const reasonModalVisible = ref(false);
const resubmitModalVisible = ref(false);
const submitLoading = ref(false);

// 筛选条件
const filter = reactive({
  status: '',
  categoryId: null,
  keyword: ''
});

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 12,
  total: 0
});

// 重新提交表单
const resubmitForm = reactive({
  id: null,
  title: '',
  categoryId: '',
  description: '',
  tags: []
});

// 监听标签页变化
watch(activeTab, (newValue) => {
  if (newValue === 'all') {
    filter.status = '';
  } else {
    filter.status = newValue;
  }
  
  pagination.current = 1;
  fetchUserUploads();
});

// 初始化
onMounted(async () => {
  // 获取分类
  const categoryList = await materialStore.fetchCategories();
  categories.value = categoryList;
  
  // 获取上传列表
  fetchUserUploads();
});

// 获取用户上传列表
async function fetchUserUploads() {
  loading.value = true;
  
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...filter
    };
    
    const result = await materialStore.getUserUploads(params);
    materials.value = result.items;
    pagination.total = result.total;
  } catch (error) {
    console.error('获取上传列表失败:', error);
  } finally {
    loading.value = false;
  }
}

// 处理标签页变化
function handleTabChange(key) {
  activeTab.value = key;
}

// 处理筛选条件变化
function handleFilterChange() {
  pagination.current = 1;
  fetchUserUploads();
}

// 处理搜索
function handleSearch() {
  pagination.current = 1;
  fetchUserUploads();
}

// 处理分页变化
function handlePageChange(page) {
  pagination.current = page;
  fetchUserUploads();
}

// 处理每页显示数量变化
function handleSizeChange(current, size) {
  pagination.current = 1;
  pagination.pageSize = size;
  fetchUserUploads();
}

// 查看素材
function viewMaterial(material) {
  router.push(`/material/${material.id}`);
}

// 显示拒绝原因
function showRejectedReason(material) {
  selectedMaterial.value = material;
  reasonModalVisible.value = true;
}

// 重新提交素材
function resubmitMaterial(material) {
  selectedMaterial.value = material;
  
  // 填充表单
  resubmitForm.id = material.id;
  resubmitForm.title = material.title;
  resubmitForm.categoryId = material.categoryId;
  resubmitForm.description = material.description;
  resubmitForm.tags = material.tags || [];
  
  reasonModalVisible.value = false;
  resubmitModalVisible.value = true;
}

// 提交重新上传
async function handleResubmit() {
  submitLoading.value = true;
  
  try {
    // 这里应该调用API重新提交素材
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 更新本地状态
    const index = materials.value.findIndex(item => item.id === resubmitForm.id);
    if (index !== -1) {
      materials.value[index] = {
        ...materials.value[index],
        title: resubmitForm.title,
        categoryId: resubmitForm.categoryId,
        categoryName: categories.value.find(c => c.id === resubmitForm.categoryId)?.name,
        description: resubmitForm.description,
        tags: resubmitForm.tags,
        status: 'pending',
        rejectReason: ''
      };
    }
    
    message.success('素材已重新提交，等待审核');
    resubmitModalVisible.value = false;
    
    // 如果当前在"已拒绝"标签页，可能需要刷新列表
    if (activeTab.value === 'rejected') {
      fetchUserUploads();
    }
  } catch (error) {
    message.error('重新提交失败');
  } finally {
    submitLoading.value = false;
  }
}

// 删除素材
async function deleteMaterial(material) {
  try {
    // 这里应该调用API删除素材
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 更新本地状态
    materials.value = materials.value.filter(item => item.id !== material.id);
    pagination.total -= 1;
    
    message.success('素材已删除');
  } catch (error) {
    message.error('删除素材失败');
  }
}
</script>

<style scoped>
.my-uploads-view {
  padding: 24px 0 60px;
}

.filter-row {
  margin: 16px 0 24px;
}

.material-upload-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.material-actions {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.pagination-container {
  margin-top: 40px;
  text-align: center;
}

.empty-placeholder {
  margin: 100px 0;
}

.reason-actions {
  margin-top: 24px;
  text-align: center;
}

@media (max-width: 576px) {
  .material-actions a-space {
    display: flex;
    flex-direction: column;
  }
}
</style>