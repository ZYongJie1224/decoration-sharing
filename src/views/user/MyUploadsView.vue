<template>
  <div class="my-uploads-view">
    <div class="page-container">
      <a-page-header
        title="我的上传"
        sub-title="管理您上传的素材"
        :back-icon="false"
      >
        <template #extra>
          <router-link to="/upload">
            <a-button type="primary">上传新素材</a-button>
          </router-link>
        </template>
      </a-page-header>
      
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
                <a-card hoverable>
                  <template #cover>
                    <img 
                      :src="formatImageUrl(material.imageUrl)" 
                      :alt="material.title"
                      style="height: 200px; object-fit: cover;"
                      @error="handleImageError"
                    />
                  </template>
                  
                  <template #actions>
                    <a-tooltip title="查看详情">
                      <eye-outlined @click="viewMaterial(material)" />
                    </a-tooltip>
                    <a-tooltip title="编辑">
                      <edit-outlined @click="editMaterial(material)" />
                    </a-tooltip>
                    <a-tooltip title="删除">
                      <a-popconfirm
                        title="确定要删除这个素材吗？"
                        ok-text="确定"
                        cancel-text="取消"
                        @confirm="() => deleteMaterial(material)"
                      >
                        <delete-outlined style="color: #ff4d4f;" />
                      </a-popconfirm>
                    </a-tooltip>
                  </template>
                  
                  <a-card-meta :title="material.title">
                    <template #description>
                      <p>{{ material.description }}</p>
                      <div style="margin-top: 8px;">
                        <a-tag :color="getStatusColor(material.status)">
                          {{ getStatusText(material.status) }}
                        </a-tag>
                        <span style="float: right; color: #999;">
                          {{ formatDate(material.createdAt) }}
                        </span>
                      </div>
                    </template>
                  </a-card-meta>
                </a-card>
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
              :showTotal="(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`"
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
    
    <!-- 编辑素材弹窗 -->
    <a-modal
      v-model:visible="editModalVisible"
      title="编辑素材"
      width="600px"
      :confirmLoading="editLoading"
      @ok="handleUpdateMaterial"
      @cancel="cancelEdit"
    >
      <a-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        layout="vertical"
      >
        <a-form-item label="素材标题" name="title">
          <a-input v-model:value="editForm.title" placeholder="请输入素材标题" />
        </a-form-item>
        
        <a-form-item label="素材描述" name="description">
          <a-textarea 
            v-model:value="editForm.description" 
            :rows="4" 
            placeholder="请输入素材描述"
          />
        </a-form-item>
        
        <a-form-item label="分类" name="categoryId">
          <a-select v-model:value="editForm.categoryId" placeholder="请选择分类">
            <a-select-option 
              v-for="category in categories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="标签" name="tags">
          <a-select
            v-model:value="editForm.tags"
            mode="tags"
            placeholder="请输入标签，按回车添加"
            :options="tagOptions"
          />
        </a-form-item>
        
        <a-form-item label="当前图片">
          <div class="current-image">
            <img 
              :src="formatImageUrl(editForm.imageUrl)" 
              alt="当前图片"
              @error="handleImageError"
            />
          </div>
        </a-form-item>
        
        <a-form-item label="更换图片">
          <a-upload
            v-model:file-list="newImageList"
            :before-upload="beforeUpload"
            :custom-request="customUpload"
            list-type="picture-card"
            :max-count="1"
            accept=".jpg,.jpeg,.png"
          >
            <div v-if="newImageList.length < 1">
              <plus-outlined />
              <div style="margin-top: 8px">上传新图片</div>
            </div>
          </a-upload>
          <div style="margin-top: 8px; color: #999; font-size: 12px;">
            支持 JPG、PNG 格式，大小不超过 10MB
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  PlusOutlined 
} from '@ant-design/icons-vue';
import axios from 'axios';
import { useUserStore } from '@/stores/user';
import dayjs from 'dayjs';

const router = useRouter();
const userStore = useUserStore();

// 基础状态
const loading = ref(false);
const materials = ref([]);
const categories = ref([]);
const activeTab = ref('all');

// 编辑相关状态
const editModalVisible = ref(false);
const editLoading = ref(false);
const editFormRef = ref();
const editForm = reactive({
  id: null,
  title: '',
  description: '',
  categoryId: null,
  tags: [],
  imageUrl: ''
});
const newImageList = ref([]);
const tagOptions = ref([
  { label: '现代', value: '现代' },
  { label: '简约', value: '简约' },
  { label: '欧式', value: '欧式' },
  { label: '中式', value: '中式' },
  { label: '美式', value: '美式' },
  { label: '北欧', value: '北欧' },
  { label: '工业风', value: '工业风' },
  { label: '田园', value: '田园' },
  { label: '地中海', value: '地中海' },
  { label: '日式', value: '日式' }
]);

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

// 编辑表单验证规则
const editRules = {
  title: [
    { required: true, message: '请输入素材标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度应在5-100个字符之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入素材描述', trigger: 'blur' },
    { min: 10, max: 1000, message: '描述长度应在10-1000个字符之间', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
};

// 监听标签页变化
watch(activeTab, (newValue) => {
  const statusMap = {
    'all': '',
    'pending': 'PENDING',
    'approved': 'APPROVED', 
    'rejected': 'REJECTED'
  };
  filter.status = statusMap[newValue];
  pagination.current = 1;
  fetchUserUploads();
});

// 初始化
onMounted(async () => {
  await fetchCategories();
  await fetchUserUploads();
});

// 获取分类列表
async function fetchCategories() {
  try {
    const response = await axios.get('/api/api/categories');
    categories.value = response.data || [];
  } catch (error) {
    console.error('获取分类失败:', error);
    // 提供默认分类
    categories.value = [
      { id: 1, name: '客厅' },
      { id: 2, name: '卧室' },
      { id: 3, name: '厨房' },
      { id: 4, name: '卫生间' },
      { id: 5, name: '书房' }
    ];
  }
}

// 获取用户上传列表 - 修复API路径
async function fetchUserUploads() {
  loading.value = true;
  
  try {
    console.log('开始获取用户上传素材...');
    
    // 构建请求参数
    const params = {
      page: pagination.current - 1, // 后端从0开始
      size: pagination.pageSize
    };
    
    // 添加筛选条件
    if (filter.status) params.status = filter.status;
    if (filter.categoryId) params.categoryId = filter.categoryId;
    if (filter.keyword) params.keyword = filter.keyword;
    
    console.log('请求参数:', params);
    
    // ⭐ 修复：使用正确的API路径
    const response = await axios.get('/api/api/user/materials', {
      params,
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    });
    
    console.log('API响应:', response.data);
    
    // 处理响应数据
    if (response.data) {
      const data = response.data;
      materials.value = data.content || data.items || data.data || [];
      pagination.total = data.totalElements || data.total || 0;
      
      console.log('处理后的素材列表:', materials.value);
      console.log('总数:', pagination.total);
    }
  } catch (error) {
    console.error('获取上传列表失败:', error);
    
    // 详细错误信息
    if (error.response) {
      console.error('错误状态:', error.response.status);
      console.error('错误数据:', error.response.data);
      
      const status = error.response.status;
      const errorMessage = error.response.data?.message || error.response.data?.error || '获取数据失败';
      
      switch (status) {
        case 401:
          message.error('请先登录');
          router.push('/login');
          break;
        case 403:
          message.error('没有权限访问');
          break;
        case 404:
          message.error('接口不存在，请检查后端服务');
          break;
        case 500:
          message.error('服务器内部错误');
          break;
        default:
          message.error(`获取数据失败: ${errorMessage}`);
      }
    } else {
      message.error('网络请求失败，请检查网络连接');
    }
  } finally {
    loading.value = false;
  }
}

// 格式化图片URL - 修复路径
function formatImageUrl(url) {
  if (!url) return getDefaultImageSrc();
  
  console.log('原始图片URL:', url);
  
  // 如果是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // ⭐ 修复：根据实际图片存储路径
  let result;
  if (url.startsWith('/uploads/')) {
    result = url; // 前端代理会处理
  } else if (url.startsWith('/')) {
    result = `/uploads${url}`;
  } else {
    result = `/uploads/${url}`;
  }
  
  console.log('处理后的图片URL:', result);
  return result;
}

// 获取默认图片 - 防止无限循环
function getDefaultImageSrc() {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuM2VtIj7lm77niYfkuI3lrZjlnKg8L3RleHQ+Cjwvc3ZnPgo=';
}

// 获取状态颜色
function getStatusColor(status) {
  const colorMap = {
    'PENDING': 'orange',
    'APPROVED': 'green',
    'REJECTED': 'red'
  };
  return colorMap[status] || 'default';
}

// 获取状态文本
function getStatusText(status) {
  const textMap = {
    'PENDING': '待审核',
    'APPROVED': '已通过', 
    'REJECTED': '已拒绝'
  };
  return textMap[status] || '未知';
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '';
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
}

// 图片加载错误处理 - 防止无限循环
function handleImageError(e) {
  // 防止无限循环：如果已经处理过错误，就不再处理
  if (e.target.dataset.errorHandled) {
    console.log('避免图片错误处理无限循环');
    return;
  }
  
  console.log('图片加载失败，切换到默认图片:', e.target.src);
  
  // 标记已处理错误
  e.target.dataset.errorHandled = 'true';
  
  // 使用内联SVG占位图，确保不会再次失败
  e.target.src = getDefaultImageSrc();
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

// 编辑素材 - 实现编辑功能
function editMaterial(material) {
  console.log('编辑素材:', material);
  
  // 填充编辑表单
  editForm.id = material.id;
  editForm.title = material.title;
  editForm.description = material.description;
  editForm.categoryId = material.categoryId;
  editForm.tags = material.tags || [];
  editForm.imageUrl = material.imageUrl;
  
  // 清空新图片
  newImageList.value = [];
  
  // 显示编辑弹窗
  editModalVisible.value = true;
}

// 处理更新素材
async function handleUpdateMaterial() {
  try {
    // 验证表单
    await editFormRef.value.validateFields();
    
    editLoading.value = true;
    
    const updateData = {
      title: editForm.title,
      description: editForm.description,
      categoryId: editForm.categoryId,
      tags: editForm.tags
    };
    
    // 如果有新图片，先上传新图片
    if (newImageList.value.length > 0) {
      const formData = new FormData();
      formData.append('file', newImageList.value[0].originFileObj);
      
      const uploadResponse = await axios.post('/api/api/upload', formData, {
        headers: {
          'Authorization': `Bearer ${userStore.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      updateData.imageUrl = uploadResponse.data.url || uploadResponse.data.data?.url;
    }
    
    // 更新素材
    const response = await axios.put(`/api/api/materials/${editForm.id}`, updateData, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      message.success('素材更新成功');
      editModalVisible.value = false;
      
      // 更新本地数据
      const index = materials.value.findIndex(item => item.id === editForm.id);
      if (index !== -1) {
        materials.value[index] = { ...materials.value[index], ...updateData };
      }
    }
    
  } catch (error) {
    console.error('更新素材失败:', error);
    
    if (error.response) {
      const status = error.response.status;
      const message_text = error.response.data?.message || '更新失败';
      
      switch (status) {
        case 401:
          message.error('请先登录');
          router.push('/login');
          break;
        case 403:
          message.error('没有权限编辑此素材');
          break;
        case 404:
          message.error('素材不存在');
          break;
        default:
          message.error(`更新失败: ${message_text}`);
      }
    } else {
      message.error('网络错误，请稍后重试');
    }
  } finally {
    editLoading.value = false;
  }
}

// 取消编辑
function cancelEdit() {
  editModalVisible.value = false;
  newImageList.value = [];
}

// 图片上传前验证
function beforeUpload(file) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片');
    return false;
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    message.error('图片大小不能超过 10MB');
    return false;
  }
  
  return false; // 阻止自动上传
}

// 自定义上传
function customUpload({ file, onSuccess, onError }) {
  // 这里只是添加到列表，实际上传在提交时进行
  onSuccess();
}

// 删除素材 - 修复删除功能
async function deleteMaterial(material) {
  try {
    console.log('开始删除素材:', material.id);
    
    // 确保用户已登录
    if (!userStore.token) {
      message.error('请先登录');
      router.push('/login');
      return;
    }
    
    // ⭐ 修复：使用正确的删除API路径
    const response = await axios.delete(`/api/api/materials/${material.id}`, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('删除响应:', response);
    
    if (response.status === 200) {
      message.success('素材删除成功');
      // 从本地列表中移除，避免重新请求
      materials.value = materials.value.filter(item => item.id !== material.id);
      pagination.total = Math.max(0, pagination.total - 1);
    }
    
  } catch (error) {
    console.error('删除素材失败:', error);
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      const message_text = errorData?.message || errorData?.error || '删除失败';
      
      console.error('错误详情:', errorData);
      
      switch (status) {
        case 401:
          message.error('请先登录');
          router.push('/login');
          break;
        case 403:
          message.error('没有权限删除此素材');
          break;
        case 404:
          message.error('素材不存在');
          break;
        case 500:
          message.error(`服务器错误: ${message_text}`);
          break;
        default:
          message.error(`删除失败: ${message_text}`);
      }
    } else {
      message.error('网络错误，请稍后重试');
    }
  }
}
</script>

<style scoped>
.my-uploads-view {
  padding: 24px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.filter-row {
  margin: 16px 0 24px;
}

.material-upload-card {
  height: 100%;
}

.materials-grid .ant-col {
  margin-bottom: 24px;
}

.pagination-container {
  margin-top: 40px;
  text-align: center;
}

.empty-placeholder {
  margin: 100px 0;
}

.current-image {
  text-align: center;
  margin-bottom: 16px;
}

.current-image img {
  max-width: 200px;
  max-height: 150px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .my-uploads-view {
    padding: 16px;
  }
  
  .filter-row .ant-col {
    margin-bottom: 8px;
  }
}
</style>