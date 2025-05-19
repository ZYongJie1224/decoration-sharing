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
              <a-select-option value="user">普通用户</a-select-option>
              <a-select-option value="admin">管理员</a-select-option>
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
              <a-select-option value="active">正常</a-select-option>
              <a-select-option value="blocked">已禁用</a-select-option>
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
              <a-avatar :src="record.avatar" />
              <a-space direction="vertical" size="small">
                <span class="user-name">{{ record.username }}</span>
                <span class="user-email">{{ record.email }}</span>
              </a-space>
            </div>
          </template>
          
          <!-- 角色列 -->
          <template v-else-if="column.key === 'role'">
            <a-tag :color="record.role === 'admin' ? 'red' : 'blue'">
              {{ record.role === 'admin' ? '管理员' : '普通用户' }}
            </a-tag>
          </template>
          
          <!-- 状态列 -->
          <template v-else-if="column.key === 'status'">
            <a-badge 
              :status="record.status === 'active' ? 'success' : 'error'" 
              :text="record.status === 'active' ? '正常' : '已禁用'" 
            />
          </template>
          
          <!-- 注册时间列 -->
          <template v-else-if="column.key === 'registerDate'">
            {{ formatDate(record.createdAt) }}
          </template>
          
          <!-- 上传素材数 -->
          <template v-else-if="column.key === 'materialCount'">
            <a-button type="link" size="small" @click="viewUserMaterials(record)">
              {{ record.materialCount }} 个素材
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
              
              <a-tooltip :title="record.status === 'active' ? '禁用账号' : '启用账号'">
                <a-button 
                  type="text" 
                  size="small"
                  @click="toggleUserStatus(record)"
                >
                  <stop-outlined v-if="record.status === 'active'" />
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
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="状态" name="status">
          <a-select v-model:value="editForm.status" :disabled="editForm.username === 'ZYongJie1224'">
            <a-select-option value="active">正常</a-select-option>
            <a-select-option value="blocked">禁用</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';

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

// 模拟用户数据
users.value = [
  {
    id: 1,
    username: 'ZYongJie1224',
    email: 'admin@example.com',
    avatar: 'https://joeschmoe.io/api/v1/1',
    role: 'admin',
    status: 'active',
    materialCount: 15,
    createdAt: '2025-01-10T08:30:00Z',
    lastLoginAt: '2025-05-16T10:45:00Z'
  },
  {
    id: 2,
    username: 'design_master',
    email: 'design@example.com',
    avatar: 'https://joeschmoe.io/api/v1/2',
    role: 'user',
    status: 'active',
    materialCount: 28,
    createdAt: '2025-02-15T14:20:00Z',
    lastLoginAt: '2025-05-15T18:30:00Z'
  },
  {
    id: 3,
    username: 'creative_home',
    email: 'creative@example.com',
    avatar: 'https://joeschmoe.io/api/v1/3',
    role: 'user',
    status: 'active',
    materialCount: 42,
    createdAt: '2025-03-05T09:15:00Z',
    lastLoginAt: '2025-05-14T11:20:00Z'
  },
  {
    id: 4,
    username: 'blockeduser',
    email: 'blocked@example.com',
    avatar: 'https://joeschmoe.io/api/v1/4',
    role: 'user',
    status: 'blocked',
    materialCount: 5,
    createdAt: '2025-04-18T16:40:00Z',
    lastLoginAt: '2025-04-20T12:10:00Z'
  }
];

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
  total: users.value.length,
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

// 初始化
onMounted(() => {
  // 实际应用中这里应该调用API获取用户列表
});

// 格式化日期
function formatDate(dateString) {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
}

// 处理表格变化（分页、排序、筛选）
function handleTableChange(pag) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchUsers();
}

// 模拟获取用户列表
function fetchUsers() {
  loading.value = true;
  
  setTimeout(() => {
    let filteredUsers = [...users.value];
    
    // 应用筛选
    if (filters.role) {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }
    
    if (filters.status) {
      filteredUsers = filteredUsers.filter(user => user.status === filters.status);
    }
    
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(keyword) || 
        user.email.toLowerCase().includes(keyword)
      );
    }
    
    pagination.total = filteredUsers.length;
    
    // 模拟分页
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    users.value = filteredUsers.slice(start, end);
    
    loading.value = false;
  }, 500);
}

// 处理筛选条件变化
function handleFilterChange() {
  pagination.current = 1;
  fetchUsers();
}

// 处理搜索
function handleSearch() {
  pagination.current = 1;
  fetchUsers();
}

// 刷新表格
function refreshTable() {
  fetchUsers();
}

// 查看用户资料
function viewUserProfile(record) {
  message.info(`查看用户 ${record.username} 的资料`);
}

// 查看用户上传的素材
function viewUserMaterials(record) {
  message.info(`查看用户 ${record.username} 上传的素材`);
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
  editLoading.value = true;
  
  try {
    // 这里应该调用管理员编辑用户API
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 更新本地状态
    const allUsers = [...users.value];
    const index = allUsers.findIndex(user => user.id === editForm.id);
    
    if (index !== -1) {
      allUsers[index] = {
        ...allUsers[index],
        username: editForm.username,
        email: editForm.email,
        role: editForm.role,
        status: editForm.status
      };
      
      users.value = allUsers;
    }
    
    message.success('用户信息更新成功');
    editVisible.value = false;
  } catch (error) {
    message.error('更新用户信息失败');
  } finally {
    editLoading.value = false;
  }
}

// 切换用户状态
async function toggleUserStatus(record) {
  if (record.username === 'ZYongJie1224') {
    message.warning('无法修改当前登录管理员的状态');
    return;
  }
  
  const newStatus = record.status === 'active' ? 'blocked' : 'active';
  const statusText = newStatus === 'active' ? '启用' : '禁用';
  
  try {
    // 这里应该调用管理员切换用户状态API
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 更新本地状态
    const index = users.value.findIndex(user => user.id === record.id);
    if (index !== -1) {
      users.value[index].status = newStatus;
    }
    
    message.success(`已${statusText}用户 ${record.username}`);
  } catch (error) {
    message.error(`${statusText}用户失败`);
  }
}

// 删除用户
async function deleteUser(record) {
  if (record.username === 'ZYongJie1224') {
    message.warning('无法删除当前登录管理员');
    return;
  }
  
  try {
    // 这里应该调用管理员删除用户API
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 更新本地状态
    users.value = users.value.filter(user => user.id !== record.id);
    
    message.success(`已删除用户 ${record.username}`);
  } catch (error) {
    message.error('删除用户失败');
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
</style>