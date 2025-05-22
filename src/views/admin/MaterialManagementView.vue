<template>
  <div class="material-management-view">
    <a-card class="table-card">
      <template #title>
        <div class="card-title">
          <span>素材管理</span>
          <a-tag v-if="selectedStatus" color="blue" class="status-tag">
            {{ getStatusText(selectedStatus) }}
          </a-tag>
        </div>
      </template>

      <template #extra>
        <a-button type="primary" @click="refreshTable">
          <reload-outlined />刷新
        </a-button>
      </template>

      <div class="table-operations">
        <a-row :gutter="[16, 16]" align="middle">
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-select v-model:value="filters.status" placeholder="状态筛选" style="width: 100%"
              @change="handleStatusChange" allow-clear>
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="PENDING">待审核</a-select-option>
              <a-select-option value="APPROVED">已通过</a-select-option>
              <a-select-option value="REJECTED">已拒绝</a-select-option>
            </a-select>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-select v-model:value="filters.categoryId" placeholder="分类筛选" style="width: 100%"
              @change="handleFilterChange" allow-clear>
              <a-select-option value="">全部分类</a-select-option>
              <a-select-option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </a-select-option>
            </a-select>
          </a-col>

          <a-col :xs="24" :sm="24" :md="8" :lg="12">
            <a-input-search v-model:value="filters.keyword" placeholder="搜索素材标题、上传者等" style="width: 100%"
              @search="handleSearch" enter-button />
          </a-col>
        </a-row>
      </div>

      <a-table :columns="columns" :data-source="materials" :pagination="pagination" :loading="loading"
        :rowKey="record => record.id" @change="handleTableChange">
        <!-- 缩略图列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'image'">
            <img :src="formatImageUrl(record.thumbUrl || record.imageUrl)" :alt="record.title" class="material-thumbnail"
              @click="previewImage(record)" />
          </template>

          <!-- 分类列 -->
          <template v-else-if="column.key === 'category'">
            <a-tag color="blue">{{ record.categoryName }}</a-tag>
          </template>

          <!-- 上传者列 -->
          <template v-else-if="column.key === 'uploader'">
            <a-tooltip :title="record.uploaderEmail">
              <a-avatar :size="24" :src="formatAvatarUrl(record.uploaderAvatar)" class="uploader-avatar" />
              <span class="uploader-name">{{ record.uploaderName }}</span>
            </a-tooltip>
          </template>

          <!-- 状态列 -->
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-tooltip title="查看详情">
                <a-button type="text" size="small" @click="viewMaterial(record)">
                  <eye-outlined />
                </a-button>
              </a-tooltip>

              <a-tooltip title="审核">
                <a-button type="text" size="small" v-if="record.status === 'PENDING'"
                  @click="showReviewModal(record)">
                  <check-circle-outlined />
                </a-button>
              </a-tooltip>

              <a-tooltip title="编辑">
                <a-button type="text" size="small" @click="editMaterial(record)">
                  <edit-outlined />
                </a-button>
              </a-tooltip>

              <a-tooltip title="删除">
                <a-popconfirm title="确定要删除这个素材吗?" ok-text="是" cancel-text="否"
                  @confirm="deleteMaterial(record)">
                  <a-button type="text" size="small" danger>
                    <delete-outlined />
                  </a-button>
                </a-popconfirm>
              </a-tooltip>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 素材预览模态框 -->
    <a-modal v-model:visible="previewVisible" :title="selectedMaterial.title || ''" :footer="null" width="800px">
      <div class="preview-modal-content">
        <div class="preview-image-container">
          <img :src="formatImageUrl(selectedMaterial.imageUrl || '')" alt="预览图" class="preview-image" />
        </div>

        <div class="preview-details">
          <a-descriptions title="素材信息" bordered :column="1">
            <a-descriptions-item label="分类">
              {{ selectedMaterial.categoryName }}
            </a-descriptions-item>
            <a-descriptions-item label="上传者">
              {{ selectedMaterial.uploaderName }}
            </a-descriptions-item>
            <a-descriptions-item label="上传时间">
              {{ formatDate(selectedMaterial.createdAt) }}
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="getStatusColor(selectedMaterial.status)">
                {{ getStatusText(selectedMaterial.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="描述" :span="1">
              {{ selectedMaterial.description }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </div>
    </a-modal>
  
    <!-- 审核模态框 -->
    <a-modal
      v-model:visible="reviewVisible" 
      title="素材审核" 
      :confirmLoading="reviewLoading" 
      @ok="handleReviewSubmit"
      @cancel="cancelReview" 
      width="700px"
    >
      <div class="review-modal-content">
        <div class="review-preview">
          <img :src="formatImageUrl(reviewMaterial.imageUrl || '')" alt="预览图" class="review-image" />

          <div class="review-info">
            <h3>{{ reviewMaterial.title }}</h3>
            <p>分类: {{ reviewMaterial.categoryName }}</p>
            <p>上传者: {{ reviewMaterial.uploaderName }}</p>
            <p>上传时间: {{ formatDate(reviewMaterial.createdAt) }}</p>
          </div>
        </div>

        <a-divider />

        <div class="review-form">
          <a-form :model="reviewForm" layout="vertical">
            <a-form-item label="审核结果">
              <a-radio-group v-model:value="reviewForm.status">
                <a-radio value="APPROVED">
                  <check-circle-outlined style="color: #52c41a" /> 通过
                </a-radio>
                <a-radio value="REJECTED">
                  <close-circle-outlined style="color: #ff4d4f" /> 拒绝
                </a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item label="审核意见" v-if="reviewForm.status === 'REJECTED'">
              <a-textarea 
                v-model:value="reviewForm.rejectReason" 
                :rows="4"
                placeholder="请输入拒绝原因，将通知给上传者" 
              />
            </a-form-item>
          </a-form>
        </div>
      </div>
    </a-modal>

    <!-- 编辑模态框 -->
    <a-modal v-model:visible="editVisible" title="编辑素材" :confirmLoading="editLoading" @ok="handleEditSubmit"
      @cancel="cancelEdit" width="700px">
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="素材标题" name="title">
          <a-input v-model:value="editForm.title" />
        </a-form-item>

        <a-form-item label="所属分类" name="categoryId">
          <a-select v-model:value="editForm.categoryId">
            <a-select-option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="素材描述" name="description">
          <a-textarea v-model:value="editForm.description" :rows="4" />
        </a-form-item>

        <a-form-item label="状态" name="status">
          <a-select v-model:value="editForm.status">
            <a-select-option value="PENDING">待审核</a-select-option>
            <a-select-option value="APPROVED">已通过</a-select-option>
            <a-select-option value="REJECTED">已拒绝</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons-vue';
import { useCategoryStore } from '@/stores/category';

const route = useRoute();
const router = useRouter();
const categoryStore = useCategoryStore();

// 默认图片和头像
const defaultImage = '/images/default-image.png';
const defaultAvatar = '/images/default-avatar.png';

// API基础路径
const API_BASE_URL = '/api/api/';

// 表格列定义
const columns = [
  {
    title: '缩略图',
    key: 'image',
    width: 80
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    ellipsis: true
  },
  {
    title: '分类',
    key: 'category',
    width: 100
  },
  {
    title: '上传者',
    key: 'uploader',
    width: 150
  },
  {
    title: '上传时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
    render: (createdAt) => formatDate(createdAt)
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    width: 150
  }
];

// 状态
const loading = ref(false);
const materials = ref([]);
const categories = ref([]);
const selectedStatus = computed(() => filters.status);

// 筛选条件
const filters = reactive({
  status: route.query.status || '',
  categoryId: '',
  keyword: '',
  uploaderId: route.query.uploaderId || ''
});

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total) => `共 ${total} 条记录`
});

// 预览模态框
const previewVisible = ref(false);
const selectedMaterial = ref({});

// 审核模态框
const reviewVisible = ref(false);
const reviewLoading = ref(false);
const reviewMaterial = ref({});
const reviewForm = reactive({
  status: 'APPROVED',
  rejectReason: ''
});

// 编辑模态框
const editVisible = ref(false);
const editLoading = ref(false);
const editForm = reactive({
  id: null,
  title: '',
  categoryId: '',
  description: '',
  status: ''
});

// 初始化
onMounted(async () => {
  if (route.query.status) {
    filters.status = route.query.status;
  }

  try {
    // 获取分类
    await loadCategories();

    // 加载素材
    await fetchMaterial();
  } catch (error) {
    console.error('初始化数据失败:', error);
    message.error('加载初始数据失败');
  }
});

// 加载分类数据
async function loadCategories() {
  try {
    // 使用store中的方法获取分类列表
    const result = await categoryStore.fetchCategories();
    categories.value = result || [];
  } catch (error) {
    console.error('获取分类列表失败:', error);
    categories.value = [];
  }
}

// 获取素材列表
async function fetchMaterial() {
  loading.value = true;

  try {
    // 构建请求参数
    const params = {
      page: pagination.current - 1, // 后端API接受0基索引
      pageSize: pagination.pageSize
    };
    
    // 添加非空过滤条件
    if (filters.status) params.status = filters.status;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.uploaderId) params.uploaderId = filters.uploaderId;
    
    // 调用后端API
    const response = await axios.get(`${API_BASE_URL}/admin/materials`, { params });
    
    if (response.data) {
      // 处理材料数据
      materials.value = (response.data.items || []).map(item => ({
        ...item,
        categoryName: item.categoryName || getCategoryName(item.categoryId)
      }));
      
      // 更新分页信息
      pagination.total = response.data.totalElements || 0;
      pagination.current = response.data.number + 1; // 后端返回0基索引
      pagination.pageSize = response.data.size || 10;
    } else {
      materials.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('获取素材列表失败:', error);
    message.error('获取素材列表失败');
    materials.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
}

// 根据分类ID获取分类名称
function getCategoryName(categoryId) {
  if (!categoryId) return '未分类';
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : '未知分类';
}

// 处理表格变化（分页、排序、筛选）
function handleTableChange(pag) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchMaterial();
}

// 处理状态筛选变化
function handleStatusChange(value) {
  filters.status = value;
  pagination.current = 1;

  // 更新URL查询参数
  router.push({
    path: route.path,
    query: { ...route.query, status: value || undefined }
  });

  fetchMaterial();
}

// 处理其他筛选条件变化
function handleFilterChange() {
  pagination.current = 1;
  fetchMaterial();
}

// 处理搜索
function handleSearch() {
  pagination.current = 1;
  fetchMaterial();
}

// 刷新表格
function refreshTable() {
  fetchMaterial();
}

// 格式化图片URL
function formatImageUrl(url) {
  if (!url) return defaultImage;
  
  // 如果是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 处理相对路径，确保存放在 /uploads/ 目录
  if (url.startsWith('/uploads/')) {
    return url;
  }
  
  // 否则，加上 /uploads/ 前缀
  return url.startsWith('/') ? `/uploads${url}` : `/uploads/${url}`;
}

// 格式化头像URL
function formatAvatarUrl(url) {
  if (!url) return defaultAvatar;
  
  // 如果是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 处理相对路径
  if (url.startsWith('/uploads/avatars/')) {
    return url;
  }
  
  // 如果已经包含 /uploads 前缀，但不是avatars子目录
  if (url.startsWith('/uploads/')) {
    // 获取文件名并添加到avatars子目录
    const fileName = url.split('/').pop();
    return `/uploads/avatars/${fileName}`;
  }
  
  // 否则，加上 /uploads/avatars/ 前缀
  return url.startsWith('/') ? `/uploads/avatars${url}` : `/uploads/avatars/${url}`;
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '';
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
}

// 获取状态颜色
function getStatusColor(status) {
  switch (status) {
    case 'APPROVED': return 'success';
    case 'PENDING': return 'warning';
    case 'REJECTED': return 'error';
    default: return 'default';
  }
}

// 获取状态文本
function getStatusText(status) {
  switch (status) {
    case 'APPROVED': return '已通过';
    case 'PENDING': return '待审核';
    case 'REJECTED': return '已拒绝';
    default: return '全部';
  }
}

// 预览素材
function previewImage(record) {
  selectedMaterial.value = record;
  previewVisible.value = true;
}

// 查看素材详情
function viewMaterial(record) {
  router.push(`/material/${record.id}`);
}

// 显示审核模态框
function showReviewModal(record) {
  reviewMaterial.value = record;
  reviewForm.status = 'APPROVED';
  reviewForm.rejectReason = '';
  reviewVisible.value = true;
}

// 取消审核
function cancelReview() {
  reviewVisible.value = false;
}

// 提交审核
async function handleReviewSubmit() {
  if (reviewForm.status === 'REJECTED' && !reviewForm.rejectReason.trim()) {
    message.warning('请输入拒绝原因');
    return;
  }

  reviewLoading.value = true;

  try {
    let response;
    const materialId = reviewMaterial.value.id;
    
    if (reviewForm.status === 'APPROVED') {
      // 调用通过API
      response = await axios.put(`${API_BASE_URL}/admin/materials/${materialId}/approve`);
    } else {
      // 调用拒绝API
      response = await axios.put(`${API_BASE_URL}/admin/materials/${materialId}/reject`, {
        reason: reviewForm.rejectReason
      });
    }
    
    // 更新本地状态
    if (response.data) {
      const index = materials.value.findIndex(item => item.id === materialId);
      if (index !== -1) {
        materials.value[index] = {
          ...materials.value[index],
          status: reviewForm.status,
          rejectReason: reviewForm.status === 'REJECTED' ? reviewForm.rejectReason : null
        };
      }

      message.success(
        reviewForm.status === 'APPROVED'
          ? '素材审核已通过'
          : '素材已被拒绝'
      );

      reviewVisible.value = false;
    }
  } catch (error) {
    console.error('审核操作失败:', error);
    message.error('审核操作失败: ' + (error.response?.data?.message || error.message));
  } finally {
    reviewLoading.value = false;
  }
}

// 编辑素材
function editMaterial(record) {
  editForm.id = record.id;
  editForm.title = record.title;
  editForm.categoryId = record.categoryId;
  editForm.description = record.description;
  editForm.status = record.status;

  editVisible.value = true;
}

// 取消编辑
function cancelEdit() {
  editVisible.value = false;
}

// 提交编辑
async function handleEditSubmit() {
  editLoading.value = true;

  try {
    // 构建请求数据
    const editData = {
      title: editForm.title,
      categoryId: editForm.categoryId,
      description: editForm.description,
      status: editForm.status
    };
    
    // 调用后端API
    const response = await axios.put(`${API_BASE_URL}/admin/materials/${editForm.id}`, editData);
    
    if (response.data) {
      // 更新本地状态
      const index = materials.value.findIndex(item => item.id === editForm.id);
      if (index !== -1) {
        materials.value[index] = {
          ...materials.value[index],
          title: editForm.title,
          categoryId: editForm.categoryId,
          categoryName: getCategoryName(editForm.categoryId),
          description: editForm.description,
          status: editForm.status
        };
      }

      message.success('素材编辑成功');
      editVisible.value = false;
    }
  } catch (error) {
    console.error('编辑素材失败:', error);
    message.error('编辑素材失败: ' + (error.response?.data?.message || error.message));
  } finally {
    editLoading.value = false;
  }
}

// 删除素材
async function deleteMaterial(record) {
  try {
    // 调用后端API
    await axios.delete(`${API_BASE_URL}/admin/materials/${record.id}`);
    
    // 更新本地状态
    materials.value = materials.value.filter(item => item.id !== record.id);
    message.success('素材已删除');
    
    // 如果删除后当前页没有数据，且不是第一页，则跳转到上一页
    if (materials.value.length === 0 && pagination.current > 1) {
      pagination.current -= 1;
      fetchMaterial();
    }
  } catch (error) {
    console.error('删除素材失败:', error);
    message.error('删除素材失败: ' + (error.response?.data?.message || error.message));
  }
}
</script>

<style scoped>
.material-management-view {
  padding: 0;
}

.table-card {
  margin-bottom: 24px;
}

.card-title {
  display: flex;
  align-items: center;
}

.status-tag {
  margin-left: 12px;
}

.table-operations {
  margin-bottom: 16px;
}

.material-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s;
}

.material-thumbnail:hover {
  transform: scale(1.1);
}

.uploader-avatar {
  margin-right: 8px;
}

.uploader-name {
  font-size: 14px;
}

.preview-modal-content {
  display: flex;
  flex-direction: column;
}

.preview-image-container {
  text-align: center;
  margin-bottom: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.review-modal-content {
  padding: 0 20px;
}

.review-preview {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.review-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.review-info {
  flex: 1;
}

.review-info h3 {
  margin-top: 0;
  margin-bottom: 16px;
}

.review-info p {
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.65);
}

@media (max-width: 768px) {
  .preview-modal-content {
    flex-direction: column;
  }

  .review-preview {
    flex-direction: column;
  }

  .review-image {
    width: 100%;
    height: auto;
  }
}
</style>