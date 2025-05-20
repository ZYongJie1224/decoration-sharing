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
            <div class="stat-value">{{ stats.userCount }}</div>
            <div class="stat-trend up">
              <rise-outlined /> {{ stats.userGrowth }}%
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
            <div class="stat-value">{{ stats.materialCount }}</div>
            <div class="stat-trend up">
              <rise-outlined /> {{ stats.materialGrowth }}%
            </div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card>
          <template #title>
            <div class="stat-title">
              <eye-outlined />
              <span>今日访问</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">{{ stats.todayVisits }}</div>
            <div class="stat-trend up">
              <rise-outlined /> {{ stats.visitGrowth }}%
            </div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card>
          <template #title>
            <div class="stat-title">
              <like-outlined />
              <span>总收藏数</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalFavorites }}</div>
            <div class="stat-trend up">
              <rise-outlined /> {{ stats.favoriteGrowth }}%
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
                <img :src="record.imageUrl" :alt="record.title" class="material-thumb" />
              </template>
              
              <template v-else-if="column.key === 'uploader'">
                <a-avatar :size="24" :src="record.uploaderAvatar" style="margin-right: 8px" />
                {{ record.uploaderName }}
              </template>
              
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="primary" size="small" @click="() => reviewMaterial(record, 'APPROVED')">
                    通过
                  </a-button>
                  <a-button type="danger" size="small" @click="() => reviewMaterial(record, 'REJECTED')">
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
            :loading="loading"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :src="item.avatar" />
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

// 数据统计
const stats = ref({
  userCount: 1285,
  userGrowth: 4.2,
  materialCount: 4728,
  materialGrowth: 12.5,
  todayVisits: 3214,
  visitGrowth: 8.7,
  totalFavorites: 12653,
  favoriteGrowth: 6.3
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

// 格式化日期
function formatDate(dateString) {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
}

// 审核素材
function reviewMaterial(record, status) {
  // 实现审核逻辑，成功后从待审核列表中移除该素材
  pendingMaterials.value = pendingMaterials.value.filter(item => item.id !== record.id);
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

// 获取首页数据
onMounted(async () => {
  loading.value = true;
  
  try {
    // 这里应该调用API获取首页统计数据
    // 模拟数据加载
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 设置模拟数据
    pendingMaterials.value = [
      {
        id: 1,
        title: '现代简约客厅设计',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100',
        uploaderName: 'design_master',
        uploaderAvatar: 'https://joeschmoe.io/api/v1/2',
        createdAt: '2025-05-19T10:30:00Z'
      },
      {
        id: 2,
        title: '北欧风卧室装修',
        imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=100',
        uploaderName: 'nordic_style',
        uploaderAvatar: 'https://joeschmoe.io/api/v1/3',
        createdAt: '2025-05-19T14:45:00Z'
      },
      {
        id: 3,
        title: '日式厨房布局参考',
        imageUrl: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e8d?w=100',
        uploaderName: 'japan_lover',
        uploaderAvatar: 'https://joeschmoe.io/api/v1/4',
        createdAt: '2025-05-20T09:15:00Z'
      }
    ];
    
    recentUsers.value = [
      {
        id: 1,
        username: 'creative_mind',
        avatar: 'https://joeschmoe.io/api/v1/5',
        createdAt: '2025-05-20T07:30:00Z'
      },
      {
        id: 2,
        username: 'design_pro',
        avatar: 'https://joeschmoe.io/api/v1/6',
        createdAt: '2025-05-19T22:15:00Z'
      },
      {
        id: 3,
        username: 'home_stylist',
        avatar: 'https://joeschmoe.io/api/v1/7',
        createdAt: '2025-05-19T16:40:00Z'
      },
      {
        id: 4,
        username: 'interior_guru',
        avatar: 'https://joeschmoe.io/api/v1/8',
        createdAt: '2025-05-19T12:20:00Z'
      }
    ];
    
    systemLogs.value = [
      {
        id: 1,
        title: '系统更新',
        content: '系统已更新至v2.1.0版本',
        time: '2025-05-20 08:00',
        color: 'blue'
      },
      {
        id: 2,
        title: '安全警告',
        content: '检测到3次失败的管理员登录尝试',
        time: '2025-05-19 23:42',
        color: 'red'
      },
      {
        id: 3,
        title: '数据备份',
        content: '系统数据已成功备份',
        time: '2025-05-19 22:00',
        color: 'green'
      },
      {
        id: 4,
        title: '用户反馈',
        content: '收到5条新的用户反馈信息',
        time: '2025-05-19 16:30',
        color: 'orange'
      }
    ];
    
  } catch (error) {
    console.error('获取首页数据失败:', error);
  } finally {
    loading.value = false;
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