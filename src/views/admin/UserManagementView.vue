<template>
  <div class="user-management-view">
    <a-card class="table-card">
      <template #title>
        <span>用户管理</span>
      </template>
      
      <template #extra>
        <a-button type="primary" @click="refreshTable">
          <reload-outlined />刷新
        </a-button>
      </template>
      
      <div class="table-operations">
        <a-row :gutter="[16, 16]" align="middle">
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-select
              v-model:value="filters.role"
              placeholder="角色筛选"
              style="width: 100%"
              @change="handleFilterChange"
              allow-clear
            >
              <a-select-option value="">全部角色</a-select-option>
              <a-select-option value="ADMIN">管理员</a-select-option>
              <a-select-option value="USER">普通用户</a-select-option>
            </a-select>
          </a-col>
          
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-select
              v-model:value="filters.status"
              placeholder="状态筛选"
              style="width: 100%"
              @change="handleFilterChange"
              allow-clear
            >
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="ACTIVE">正常</a-select-option>
              <a-select-option value="BLOCKED">已禁用</a-select-option>
            </a-select>
          </a-col>
          
          <a-col :xs="24" :sm="24" :md="8" :lg="12">
            <a-input-search
              v-model:value="filters.keyword"
              placeholder="搜索用户名、邮箱等"
              style="width: 100%"
              @search="handleSearch"
              enter-button
            />
          </a-col>
        </a-row>
      </div>
      
      <a-table
        :columns="columns"
        :data-source="users"
        :pagination="pagination"
        :loading="loading"
        :rowKey="record => record.id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 用户头像和用户名 -->
          <template v-if="column.key === 'user'">
            <div class="user-cell">
              <a-avatar :src="formatAvatarUrl(record.avatar)" @error="handleAvatarError" />
              <a-space direction="vertical" size="small">
                <span class="user-name">{{ record.username }}</span>
                <span class="user-email">{{ record.email }}</span>
              </a-space>
            </div>
          </template>
          
          <!-- 角色列 -->
          <template v-else-if="column.key === 'role'">
            <a-tag :color="record.role === 'ADMIN' ? 'red' : 'blue'">
              {{ record.role === 'ADMIN' ? '管理员' : '普通用户' }}
            </a-tag>
          </template>
          
          <!-- 状态列 -->
          <template v-else-if="column.key === 'status'">
            <a-badge 
              :status="record.status === 'ACTIVE' ? 'success' : 'error'" 
              :text="record.status === 'ACTIVE' ? '正常' : '已禁用'" 
            />
          </template>
          
          <!-- 注册时间列 -->
          <template v-else-if="column.key === 'registerDate'">
            {{ formatDate(record.createdAt) }}
          </template>
          
          <!-- 上传素材数 -->
          <template v-else-if="column.key === 'materialCount'">
            <a-button type="link" size="small" @click="viewUserMaterials(record)">
              {{ record.materialCount || 0 }} 个素材
            </a-button>
          </template>
          
          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-tooltip title="查看详情">
                <a-button 
                  type="text" 
                  size="small"
                  @click="viewUserProfile(record)"
                >
                  <eye-outlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="编辑">
                <a-button 
                  type="text" 
                  size="small"
                  @click="editUser(record)"
                >
                  <edit-outlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip :title="record.status === 'ACTIVE' ? '禁用账号' : '启用账号'">
                <a-button 
                  type="text" 
                  size="small"
                  @click="toggleUserStatus(record)"
                >
                  <stop-outlined v-if="record.status === 'ACTIVE'" />
                  <check-circle-outlined v-else />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="删除">
                <a-popconfirm
                  title="确定要删除这个用户吗?"
                  ok-text="是"
                  cancel-text="否"
                  @confirm="deleteUser(record)"
                >
                  <a-button 
                    type="text" 
                    size="small"
                    danger
                    :disabled="record.username === 'ZYongJie1224'"
                  >
                    <delete-outlined />
                  </a-button>
                </a-popconfirm>
              </a-tooltip>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    
    <!-- 编辑用户模态框 -->
    <a-modal
      v-model:visible="editVisible"
      title="编辑用户"
      :confirmLoading="editLoading"
      @ok="handleEditSubmit"
      @cancel="cancelEdit"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="editForm.username" :disabled="editForm.username === 'ZYongJie1224'" />
        </a-form-item>
        
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="editForm.email" />
        </a-form-item>
        
        <a-form-item label="角色" name="role">
          <a-select v-model:value="editForm.role" :disabled="editForm.username === 'ZYongJie1224'">
            <a-select-option value="USER">普通用户</a-select-option>
            <a-select-option value="ADMIN">管理员</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="状态" name="status">
          <a-select v-model:value="editForm.status" :disabled="editForm.username === 'ZYongJie1224'">
            <a-select-option value="ACTIVE">正常</a-select-option>
            <a-select-option value="BLOCKED">禁用</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 用户详情模态框 -->
    <a-modal
      v-model:visible="profileVisible"
      title="用户详情"
      :footer="null"
      width="700px"
    >
      <div class="user-profile-container">
        <div class="user-profile-header">
          <a-avatar :size="80" :src="formatAvatarUrl(selectedUser.avatar)" @error="handleAvatarError" />
          <div class="user-profile-info">
            <h2>{{ selectedUser.username }}</h2>
            <p>{{ selectedUser.email }}</p>
            <div class="user-profile-badges">
              <a-tag :color="selectedUser.role === 'ADMIN' ? 'red' : 'blue'">
                {{ selectedUser.role === 'ADMIN' ? '管理员' : '普通用户' }}
              </a-tag>
              <a-tag :color="selectedUser.status === 'ACTIVE' ? 'green' : 'red'">
                {{ selectedUser.status === 'ACTIVE' ? '正常' : '已禁用' }}
              </a-tag>
            </div>
          </div>
        </div>
        
        <a-divider />
        
        <a-descriptions title="详细信息" bordered>
          <a-descriptions-item label="用户ID" span={3}>{{ selectedUser.id }}</a-descriptions-item>
          <a-descriptions-item label="注册时间">{{ formatDate(selectedUser.createdAt) }}</a-descriptions-item>
          <a-descriptions-item label="最近登录">{{ formatDate(selectedUser.lastLoginAt) }}</a-descriptions-item>
          <a-descriptions-item label="上传素材数">{{ selectedUser.materialCount || 0 }} 个</a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import axios from 'axios';
import {
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

// 路由和状态管理
const router = useRouter();
const userStore = useUserStore();
const defaultAvatar = '/images/default-avatar.png';

// API基础路径
const API_BASE_URL = '/api/api';

// 表格列定义
const columns = [
  {
    title: '用户信息',
    key: 'user',
    width: 250
  },
  {
    title: '角色',
    key: 'role',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '注册时间',
    key: 'registerDate',
    width: 150
  },
  {
    title: '上传素材',
    key: 'materialCount',
    width: 100
  },
  {
    title: '最近登录',
    dataIndex: 'lastLoginAt',
    key: 'lastLoginAt',
    width: 150,
    render: (lastLoginAt) => lastLoginAt ? formatDate(lastLoginAt) : '从未登录'
  },
  {
    title: '操作',
    key: 'action',
    width: 150
  }
];

// 状态
const loading = ref(false);
const users = ref([]);

// 筛选条件
const filters = reactive({
  role: '',
  status: '',
  keyword: ''
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

// 编辑用户模态框
const editVisible = ref(false);
const editLoading = ref(false);
const editForm = reactive({
  id: null,
  username: '',
  email: '',
  role: '',
  status: ''
});

// 用户详情模态框
const profileVisible = ref(false);
const selectedUser = ref({});

// 初始化
onMounted(() => {
  fetchUsers();
});

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '未知';
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
}

// 处理头像URL格式化
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

// 处理头像加载错误
function handleAvatarError(e) {
  e.target.src = defaultAvatar;
}

// 处理表格变化（分页、排序、筛选）
function handleTableChange(pag) {
  pagination.current = Math.max(1, pag.current || 1); // 确保页码是正数
  pagination.pageSize = pag.pageSize;
  fetchUsers();
}

// 获取用户列表
async function fetchUsers() {
  loading.value = true;
  
  try {
    // 构建请求参数
    const params = {
      page: pagination.current - 1, // 后端API使用0基索引
      pageSize: pagination.pageSize
    };
    
    // 添加非空过滤条件
    if (filters.role) params.role = filters.role;
    if (filters.status) params.status = filters.status;
    if (filters.keyword) params.keyword = filters.keyword;
    
    // 调用后端API获取用户列表
    const response = await axios.get(`${API_BASE_URL}/admin/users`, { params });
    
    if (response.data) {
      // 更新用户数据
      users.value = response.data.items || [];
      
      // 更新分页信息
      pagination.total = response.data.totalElements || 0;
      pagination.current = (response.data.number || 0) + 1; // 转换为1基索引
      pagination.pageSize = response.data.size || 10;
    } else {
      users.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    message.error('获取用户列表失败: ' + (error.response?.data?.message || error.message));
    users.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
}

// 处理筛选条件变化
function handleFilterChange() {
  pagination.current = 1; // 重置为第一页
  fetchUsers();
}

// 处理搜索
function handleSearch() {
  pagination.current = 1; // 重置为第一页
  fetchUsers();
}

// 刷新表格
function refreshTable() {
  fetchUsers();
}

// 查看用户资料
function viewUserProfile(record) {
  selectedUser.value = { ...record };
  profileVisible.value = true;
}

// 查看用户上传的素材
function viewUserMaterials(record) {
  // 跳转到素材管理页面，并带上用户ID参数
  router.push({
    path: '/admin/materials',
    query: { uploaderId: record.id, uploaderName: record.username }
  });
}

// 编辑用户
function editUser(record) {
  editForm.id = record.id;
  editForm.username = record.username;
  editForm.email = record.email;
  editForm.role = record.role;
  editForm.status = record.status;
  
  editVisible.value = true;
}

// 取消编辑
function cancelEdit() {
  editVisible.value = false;
}

// 提交编辑
async function handleEditSubmit() {
  // 检查用户名是否是管理员自身
  // const currentUser = await userStore.getCurrentUser();
  if (editForm.username === userStore.username) {
    
      message.warning('不能修改自己的账号信息，请到个人资料修改');
      return;
    
  }
  
  editLoading.value = true;
  
  try {
    // 构建请求数据
    const updateData = {
      username: editForm.username,
      email: editForm.email,
      role: editForm.role,
      status: editForm.status
    };
    
    // 调用后端API更新用户信息
    const response = await axios.put(`${API_BASE_URL}/admin/users/${editForm.id}`, updateData);
    
    if (response.data) {
      // 更新本地状态
      const index = users.value.findIndex(user => user.id === editForm.id);
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          ...response.data
        };
      }
      
      message.success('用户信息更新成功');
      editVisible.value = false;
    }
  } catch (error) {
    console.error('更新用户信息失败:', error);
    message.error('更新用户信息失败: ' + (error.response?.data?.message || error.message));
  } finally {
    editLoading.value = false;
  }
}

// 切换用户状态
async function toggleUserStatus(record) {
    // const currentUser = await userStore.getCurrentUser();
      console.log(userStore.username)
  // if (record.username === currentUser.username) {
    if (record.username === userStore.username) {
      console.log(userStore.username)

    message.warning('无法修改当前登录管理员的状态');
    return;
  }
  
  const newStatus = record.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
  const statusText = newStatus === 'ACTIVE' ? '启用' : '禁用';
  
  try {
    // 构建请求数据
    const updateData = {
      status: newStatus
    };
    
    // 调用后端API更新用户状态
    const response = await axios.put(`${API_BASE_URL}/admin/users/${record.id}`, updateData);
    
    if (response.data) {
      // 更新本地状态
      const index = users.value.findIndex(user => user.id === record.id);
      if (index !== -1) {
        users.value[index].status = newStatus;
      }
      
      message.success(`已${statusText}用户 ${record.username}`);
    }
  } catch (error) {
    console.error(`${statusText}用户失败:`, error);
    message.error(`${statusText}用户失败: ` + (error.response?.data?.message || error.message));
  }
}

// 删除用户
async function deleteUser(record) {
  if (record.username === userStore.username) {
    message.warning('无法删除当前登录管理员');
    return;
  }
  
  try {
    // 调用后端API删除用户
    await axios.delete(`${API_BASE_URL}/admin/users/${record.id}`);
    
    // 更新本地状态
    users.value = users.value.filter(user => user.id !== record.id);
    
    message.success(`已删除用户 ${record.username}`);
    
    // 如果删除后当前页没有数据，且不是第一页，则跳转到上一页
    if (users.value.length === 0 && pagination.current > 1) {
      pagination.current -= 1;
      fetchUsers();
    }
  } catch (error) {
    console.error('删除用户失败:', error);
    message.error('删除用户失败: ' + (error.response?.data?.message || error.message));
  }
}
</script>

<style scoped>
.user-management-view {
  padding: 0;
}

.table-card {
  margin-bottom: 24px;
}

.table-operations {
  margin-bottom: 16px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-weight: 500;
}

.user-email {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.user-profile-container {
  padding: 0 16px;
}

.user-profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.user-profile-info {
  flex: 1;
}

.user-profile-info h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.user-profile-info p {
  margin: 0 0 12px 0;
  color: rgba(0, 0, 0, 0.65);
}

.user-profile-badges {
  display: flex;
  gap: 8px;
}
</style>