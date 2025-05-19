<template>
  <div class="dashboard-view">
    <a-row :gutter="[16, 16]" class="stat-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <statistic
            title="总素材数"
            :value="stats.totalMaterials"
            :valueStyle="{ color: '#1890ff' }"
          >
            <template #prefix>
              <picture-outlined />
            </template>
          </statistic>
          <div class="stat-footer">
            <span class="stat-trend up">
              <arrow-up-outlined /> {{stats.materialGrowth}}%
            </span>
            <span class="stat-period">较上月</span>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <statistic
            title="注册用户"
            :value="stats.totalUsers"
            :valueStyle="{ color: '#52c41a' }"
          >
            <template #prefix>
              <user-outlined />
            </template>
          </statistic>
          <div class="stat-footer">
            <span class="stat-trend up">
              <arrow-up-outlined /> {{stats.userGrowth}}%
            </span>
            <span class="stat-period">较上月</span>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <statistic
            title="待审核素材"
            :value="stats.pendingMaterials"
            :valueStyle="{ color: '#faad14' }"
          >
            <template #prefix>
              <file-search-outlined />
            </template>
          </statistic>
          <div class="stat-footer">
            <router-link to="/admin/materials?status=pending">
              查看待审核素材
            </router-link>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <statistic
            title="今日活跃用户"
            :value="stats.activeUsers"
            :valueStyle="{ color: '#eb2f96' }"
          >
            <template #prefix>
              <team-outlined />
            </template>
          </statistic>
          <div class="stat-footer">
            <span class="stat-period">今日数据</span>
          </div>
        </a-card>
      </a-col>
    </a-row>
    
    <a-row :gutter="[16, 16]" class="data-cards">
      <a-col :xs="24" :lg="16">
        <a-card title="素材上传趋势" class="chart-card">
          <div id="upload-trend-chart" class="chart-container"></div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :lg="8">
        <a-card title="素材分类分布" class="chart-card">
          <div id="category-pie-chart" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>
    
    <a-row :gutter="[16, 16]" class="list-cards">
      <a-col :xs="24" :md="12">
        <a-card title="最新用户">
          <template #extra>
            <a href="#">查看全部</a>
          </template>
          <a-list
            :data-source="latestUsers"
            :pagination="false"
            item-layout="horizontal"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :src="item.avatar" />
                  </template>
                  <template #title>
                    <a>{{ item.username }}</a>
                  </template>
                  <template #description>
                    注册于 {{ formatDate(item.createdAt) }}
                  </template>
                </a-list-item-meta>
                <template #extra>
                  <a-tag :color="item.role === 'admin' ? 'red' : 'blue'">
                    {{ item.role === 'admin' ? '管理员' : '用户' }}
                  </a-tag>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
        <a-card title="最新上传素材">
          <template #extra>
            <a href="#">查看全部</a>
          </template>
          <a-list
            :data-source="latestMaterials"
            :pagination="false"
            item-layout="horizontal"
          >
            :pagination="false"
            item-layout="horizontal"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <img :src="item.thumbUrl" alt="素材预览" class="material-thumb" />
                  </template>
                  <template #title>
                    <a>{{ item.title }}</a>
                  </template>
                  <template #description>
                    <div>
                      <a-tag color="blue">{{ item.categoryName }}</a-tag>
                      <span>上传者: {{ item.uploaderName }}</span>
                    </div>
                  </template>
                </a-list-item-meta>
                <template #extra>
                  <a-tag :color="getStatusColor(item.status)">
                    {{ getStatusText(item.status) }}
                  </a-tag>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  PictureOutlined,
  UserOutlined,
  FileSearchOutlined,
  TeamOutlined,
  ArrowUpOutlined
} from '@ant-design/icons-vue';
import { Statistic } from 'ant-design-vue';
import dayjs from 'dayjs';
import * as echarts from 'echarts/core';
import { LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  LineChart,
  PieChart,
  CanvasRenderer
]);

// 状态
const stats = ref({
  totalMaterials: 1248,
  materialGrowth: 15.2,
  totalUsers: 865,
  userGrowth: 7.5,
  pendingMaterials: 18,
  activeUsers: 142
});

const latestUsers = ref([
  {
    id: 1,
    username: 'design_master',
    avatar: 'https://joeschmoe.io/api/v1/1',
    role: 'user',
    createdAt: '2025-05-15T08:30:00Z'
  },
  {
    id: 2,
    username: 'creative_home',
    avatar: 'https://joeschmoe.io/api/v1/2',
    role: 'user',
    createdAt: '2025-05-14T14:15:00Z'
  },
  {
    id: 3,
    username: 'ZYongJie1224',
    avatar: 'https://joeschmoe.io/api/v1/3',
    role: 'admin',
    createdAt: '2025-05-13T09:45:00Z'
  },
  {
    id: 4,
    username: 'homedesigner88',
    avatar: 'https://joeschmoe.io/api/v1/4',
    role: 'user',
    createdAt: '2025-05-12T11:20:00Z'
  }
]);

const latestMaterials = ref([
  {
    id: 1,
    title: '北欧风格客厅装饰案例',
    thumbUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop',
    categoryName: '客厅',
    uploaderName: 'design_master',
    status: 'approved',
    createdAt: '2025-05-15T10:30:00Z'
  },
  {
    id: 2,
    title: '现代简约厨房设计',
    thumbUrl: 'https://images.unsplash.com/photo-1556909114-44e3466b2052?w=100&h=100&fit=crop',
    categoryName: '厨房',
    uploaderName: 'creative_home',
    status: 'pending',
    createdAt: '2025-05-14T15:45:00Z'
  },
  {
    id: 3,
    title: '美式卧室装饰元素',
    thumbUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=100&h=100&fit=crop',
    categoryName: '卧室',
    uploaderName: 'homedesigner88',
    status: 'approved',
    createdAt: '2025-05-13T08:15:00Z'
  },
  {
    id: 4,
    title: '日式风格书房',
    thumbUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=100&h=100&fit=crop',
    categoryName: '书房',
    uploaderName: 'ZYongJie1224',
    status: 'rejected',
    createdAt: '2025-05-12T16:20:00Z'
  }
]);

// 初始化
onMounted(() => {
  initUploadTrendChart();
  initCategoryPieChart();
});

// 格式化日期
function formatDate(dateString) {
  return dayjs(dateString).format('YYYY-MM-DD');
}

// 获取状态颜色
function getStatusColor(status) {
  switch (status) {
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'error';
    default: return 'default';
  }
}

// 获取状态文本
function getStatusText(status) {
  switch (status) {
    case 'approved': return '已通过';
    case 'pending': return '待审核';
    case 'rejected': return '已拒绝';
    default: return '未知';
  }
}

// 初始化上传趋势图表
function initUploadTrendChart() {
  const chartDom = document.getElementById('upload-trend-chart');
  if (!chartDom) return;
  
  const myChart = echarts.init(chartDom);
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['上传素材', '通过审核', '收藏次数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['5/10', '5/11', '5/12', '5/13', '5/14', '5/15', '5/16']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '上传素材',
        type: 'line',
        data: [15, 12, 18, 22, 16, 24, 20],
        smooth: true,
        lineStyle: {
          width: 3,
        }
      },
      {
        name: '通过审核',
        type: 'line',
        data: [12, 10, 15, 18, 14, 20, 18],
        smooth: true,
        lineStyle: {
          width: 3,
        }
      },
      {
        name: '收藏次数',
        type: 'line',
        data: [35, 42, 48, 55, 60, 68, 72],
        smooth: true,
        lineStyle: {
          width: 3,
        }
      }
    ]
  };
  
  myChart.setOption(option);
  
  // 响应式调整
  window.addEventListener('resize', () => {
    myChart.resize();
  });
}

// 初始化分类饼图
function initCategoryPieChart() {
  const chartDom = document.getElementById('category-pie-chart');
  if (!chartDom) return;
  
  const myChart = echarts.init(chartDom);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: ['客厅', '卧室', '厨房', '卫生间', '书房', '阳台', '其他']
    },
    series: [
      {
        name: '素材分类',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 320, name: '客厅' },
          { value: 240, name: '卧室' },
          { value: 180, name: '厨房' },
          { value: 150, name: '卫生间' },
          { value: 120, name: '书房' },
          { value: 100, name: '阳台' },
          { value: 80, name: '其他' }
        ]
      }
    ]
  };
  
  myChart.setOption(option);
  
  // 响应式调整
  window.addEventListener('resize', () => {
    myChart.resize();
  });
}
</script>

<style scoped>
.dashboard-view {
  padding: 24px 0;
}

.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  height: 100%;
}

.stat-footer {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-trend {
  font-size: 14px;
}

.stat-trend.up {
  color: #52c41a;
}

.stat-trend.down {
  color: #ff4d4f;
}

.stat-period {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.data-cards {
  margin-bottom: 24px;
}

.chart-card {
  margin-bottom: 24px;
}

.chart-container {
  height: 400px;
}

.list-cards {
  margin-bottom: 24px;
}

.material-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}
</style>