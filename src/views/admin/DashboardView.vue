<template>
  <div class="dashboard-view">
    <a-row :gutter="[24, 24]">
      <!-- 数据统计卡片 -->
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card>
          <template #title>
            <div class="stat-title">
              <user-outlined />
              <span>用户总数</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
            <div class="stat-trend up">
              <rise-outlined /> {{ stats.userGrowth || 0 }}%
            </div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card>
          <template #title>
            <div class="stat-title">
              <picture-outlined />
              <span>素材总数</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalMaterials || 0 }}</div>
            <div class="stat-trend up">
              <rise-outlined /> {{ stats.materialGrowth || 0 }}%
            </div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card>
          <template #title>
            <div class="stat-title">
              <eye-outlined />
              <span>活跃用户</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">{{ stats.activeUsers || 0 }}</div>
            <div class="stat-trend up">
              <rise-outlined /> {{ stats.userGrowth || 0 }}%
            </div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card>
          <template #title>
            <div class="stat-title">
              <like-outlined />
              <span>待审核素材</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pendingMaterials || 0 }}</div>
            <div class="stat-trend up">
              <rise-outlined /> {{ stats.materialGrowth || 0 }}%
            </div>
          </div>
        </a-card>
      </a-col>
      
      <!-- 待审核素材 -->
      <a-col :span="24">
        <a-card title="待审核素材" :extra="{ content: '查看全部', onClick: goToMaterials }">
          <a-table
            :columns="pendingColumns"
            :data-source="pendingMaterials"
            :pagination="false"
            :loading="loading"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'image'">
                <img :src="getImageUrl(record.thumbUrl || record.imageUrl)" :alt="record.title" class="material-thumb" />
              </template>
              
              <template v-else-if="column.key === 'uploader'">
                <a-avatar :size="24" :src="getImageUrl(record.uploaderAvatar)" style="margin-right: 8px" />
                {{ record.uploaderName }}
              </template>
              
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="primary" size="small" @click="() => reviewMaterial(record, 'APPROVED')">
                    通过
                  </a-button>
                  <a-button danger size="small" @click="() => showRejectModal(record)">
                    拒绝
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
      
      <!-- 最近注册用户 -->
      <a-col :span="24" :lg="12">
        <a-card title="最近注册用户" :extra="{ content: '查看全部', onClick: goToUsers }">
          <a-list
            :data-source="recentUsers"
            :loading="loadingUsers"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :src="getImageUrl(item.avatar)" />
                  </template>
                  <template #title>{{ item.username }}</template>
                  <template #description>
                    <span>注册时间: {{ formatDate(item.createdAt) }}</span>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      
      <!-- 系统日志 -->
      <a-col :span="24" :lg="12">
        <a-card title="系统日志">
          <a-timeline>
            <a-timeline-item v-for="log in systemLogs" :key="log.id" :color="log.color">
              <div class="log-item">
                <div class="log-title">{{ log.title }}</div>
                <div class="log-time">{{ log.time }}</div>
              </div>
              <div class="log-content">{{ log.content }}</div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- 拒绝原因模态框 -->
    <a-modal v-model:visible="rejectModalVisible" title="拒绝原因" @ok="confirmReject">
      <a-form :model="rejectForm">
        <a-form-item label="拒绝原因" name="reason" :rules="[{ required: true, message: '请输入拒绝原因' }]">
          <a-textarea v-model:value="rejectForm.reason" :rows="4" placeholder="请输入拒绝原因" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  UserOutlined, 
  PictureOutlined, 
  EyeOutlined, 
  LikeOutlined,
  RiseOutlined,
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { useUserStore } from '../../stores/user';

const userStore = useUserStore();

// 数据统计
const stats = ref({
  totalUsers: 0,
  userGrowth: 0,
  totalMaterials: 0,
  materialGrowth: 0,
  activeUsers: 0,
  pendingMaterials: 0
});

// 待审核素材列表
const pendingColumns = [
  {
    title: '缩略图',
    key: 'image',
    width: 80
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
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
    render: (time) => formatDate(time)
  },
  {
    title: '操作',
    key: 'action',
    width: 180
  }
];

const pendingMaterials = ref([]);
const recentUsers = ref([]);
const systemLogs = ref([]);
const loading = ref(false);
const loadingUsers = ref(false);

// 拒绝模态框相关
const rejectModalVisible = ref(false);
const rejectForm = ref({
  reason: '',
  materialId: null
});
const currentMaterial = ref(null);

// 处理图片路径，确保能正确加载
function getImageUrl(path) {
  if (!path) return '';
  
  // 如果路径是完整的URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // 如果路径不以/开头，添加/
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  // 确保图片从公共目录加载
  if (!path.startsWith('/uploads/')) {
    return '/uploads' + path;
  }
  
  return path;
}

// 显示拒绝模态框
function showRejectModal(material) {
  currentMaterial.value = material;
  rejectForm.value.materialId = material.id;
  rejectForm.value.reason = '';
  rejectModalVisible.value = true;
}

// 确认拒绝
async function confirmReject() {
  if (!rejectForm.value.reason) {
    message.error('请输入拒绝原因');
    return;
  }
  
  try {
    await reviewMaterial(currentMaterial.value, 'REJECTED', rejectForm.value.reason);
    rejectModalVisible.value = false;
  } catch (error) {
    console.error('拒绝素材失败:', error);
    message.error('拒绝素材失败: ' + (error.response?.data?.message || '未知错误'));
  }
}

// 格式化日期
function formatDate(dateString) {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
}

// 审核素材
async function reviewMaterial(record, status, reason = null) {
  try {
    if (status === 'APPROVED') {
      await axios.put(`/api/api/admin/materials/${record.id}/approve`, {}, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      });
      message.success('素材已通过审核');
    } else if (status === 'REJECTED') {
      await axios.put(`/api/api/admin/materials/${record.id}/reject`, {
        reason: reason
      }, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      });
      message.success('素材已拒绝');
    }
    
    // 从待审核列表中移除该素材
    pendingMaterials.value = pendingMaterials.value.filter(item => item.id !== record.id);
    
    // 更新统计数据
    if (stats.value.pendingMaterials > 0) {
      stats.value.pendingMaterials--;
    }
    
    return true;
  } catch (error) {
    console.error('审核素材失败:', error);
    message.error('审核素材失败: ' + (error.response?.data?.message || '未知错误'));
    throw error;
  }
}

// 跳转到素材管理
function goToMaterials() {
  // 改为切换到素材管理Tab
  const event = new CustomEvent('switch-tab', { detail: { tab: 'materials' } });
  window.dispatchEvent(event);
}

// 跳转到用户管理
function goToUsers() {
  // 改为切换到用户管理Tab
  const event = new CustomEvent('switch-tab', { detail: { tab: 'users' } });
  window.dispatchEvent(event);
}

// 获取系统日志（模拟数据，后端暂无此接口）
function loadSystemLogs() {
  systemLogs.value = [
    {
      id: 1,
      title: '系统更新',
      content: '系统已更新至v2.1.0版本',
      time: dayjs().format('YYYY-MM-DD HH:mm'),
      color: 'blue'
    },
    {
      id: 2,
      title: '安全警告',
      content: '检测到3次失败的管理员登录尝试',
      time: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm'),
      color: 'red'
    },
    {
      id: 3,
      title: '数据备份',
      content: '系统数据已成功备份',
      time: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm'),
      color: 'green'
    },
    {
      id: 4,
      title: '用户反馈',
      content: '收到5条新的用户反馈信息',
      time: dayjs().subtract(5, 'hour').format('YYYY-MM-DD HH:mm'),
      color: 'orange'
    }
  ];
}

// 获取统计数据
async function fetchStats() {
  loading.value = true;
  try {
    const response = await axios.get('/api/api/admin/stats', {
      headers: { Authorization: `Bearer ${userStore.token}` }
    });
    stats.value = response.data;
    return response.data;
  } catch (error) {
    console.error('获取统计数据失败:', error);
    message.error('获取统计数据失败: ' + (error.response?.data?.message || '未知错误'));
    return null;
  } finally {
    loading.value = false;
  }
}

// 获取待审核素材
async function fetchPendingMaterials() {
  loading.value = true;
  try {
    const response = await axios.get('/api/api/admin/materials/pending', {
      params: { page: 0, pageSize: 5 },
      headers: { Authorization: `Bearer ${userStore.token}` }
    });
    
    // 根据AdminController的返回结构调整
    pendingMaterials.value = response.data.items || [];
    return response.data;
  } catch (error) {
    console.error('获取待审核素材失败:', error);
    message.error('获取待审核素材失败: ' + (error.response?.data?.message || '未知错误'));
    return [];
  } finally {
    loading.value = false;
  }
}

// 获取最近注册用户
async function fetchRecentUsers() {
  loadingUsers.value = true;
  try {
    const response = await axios.get('/api/api/admin/users', {
      params: { 
        page: 0, 
        pageSize: 4,
        sort: 'createdAt,desc'
      },
      headers: { Authorization: `Bearer ${userStore.token}` }
    });
    
    // 根据AdminController的返回结构调整
    recentUsers.value = response.data.items || [];
    return response.data;
  } catch (error) {
    console.error('获取最近用户失败:', error);
    message.error('获取最近用户失败: ' + (error.response?.data?.message || '未知错误'));
    return [];
  } finally {
    loadingUsers.value = false;
  }
}

// 获取首页数据
onMounted(async () => {
  if (!userStore.isLoggedIn || !userStore.isAdmin) {
    message.error('请先登录管理员账号');
    return;
  }
  
  try {
    // 并行加载数据提高性能
    await Promise.all([
      fetchStats(),
      fetchPendingMaterials(),
      fetchRecentUsers()
    ]);
    
    // 加载系统日志（模拟数据）
    loadSystemLogs();
    
  } catch (error) {
    console.error('获取首页数据失败:', error);
    message.error('获取首页数据失败，请刷新页面重试');
  }
});
</script>

<style scoped>
.dashboard-view {
  width: 100%;
}

.stat-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-trend.up {
  color: #52c41a;
}

.stat-trend.down {
  color: #f5222d;
}

.material-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.log-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.log-title {
  font-weight: 500;
}

.log-time {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

.log-content {
  color: rgba(0, 0, 0, 0.65);
}
</style>