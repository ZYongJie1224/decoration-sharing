<template>
  <div class="dashboard-view">
    <!-- 标题和刷新按钮 -->
    <div class="dashboard-header">
      <h2 class="page-title">管理控制台</h2>
      <a-button type="primary" ghost @click="refreshData">
        <template #icon><reload-outlined /></template>
        刷新数据
      </a-button>
    </div>

    <!-- 统计卡片组 -->
    <a-row :gutter="[24, 24]" class="stat-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card" :bordered="false" hoverable>
          <div class="stat-card-content">
            <div class="stat-icon" :style="{ backgroundColor: 'rgba(24, 144, 255, 0.1)' }">
              <picture-outlined style="color: #1890ff" />
            </div>
            <div class="stat-info">
              <div class="stat-label">总素材数</div>
              <div class="stat-value" style="color: #1890ff">{{ stats.totalMaterials }}</div>
              <div class="stat-footer">
                <span class="stat-trend up">
                  <arrow-up-outlined /> {{stats.materialGrowth}}%
                </span>
                <span class="stat-period">较上月</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card" :bordered="false" hoverable>
          <div class="stat-card-content">
            <div class="stat-icon" :style="{ backgroundColor: 'rgba(82, 196, 26, 0.1)' }">
              <user-outlined style="color: #52c41a" />
            </div>
            <div class="stat-info">
              <div class="stat-label">注册用户</div>
              <div class="stat-value" style="color: #52c41a">{{ stats.totalUsers }}</div>
              <div class="stat-footer">
                <span class="stat-trend up">
                  <arrow-up-outlined /> {{stats.userGrowth}}%
                </span>
                <span class="stat-period">较上月</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card" :bordered="false" hoverable>
          <div class="stat-card-content">
            <div class="stat-icon" :style="{ backgroundColor: 'rgba(250, 173, 20, 0.1)' }">
              <file-search-outlined style="color: #faad14" />
            </div>
            <div class="stat-info">
              <div class="stat-label">待审核素材</div>
              <div class="stat-value" style="color: #faad14">{{ stats.pendingMaterials }}</div>
              <div class="stat-footer">
                <router-link to="/admin/materials?status=pending" class="action-link">
                  查看待审核素材
                  <right-outlined />
                </router-link>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card" :bordered="false" hoverable>
          <div class="stat-card-content">
            <div class="stat-icon" :style="{ backgroundColor: 'rgba(235, 47, 150, 0.1)' }">
              <team-outlined style="color: #eb2f96" />
            </div>
            <div class="stat-info">
              <div class="stat-label">今日活跃用户</div>
              <div class="stat-value" style="color: #eb2f96">{{ stats.activeUsers }}</div>
              <div class="stat-footer">
                <span class="stat-period">截至 {{ formattedCurrentTime }}</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- 图表区域 -->
    <a-row :gutter="[24, 24]" class="data-cards">
      <a-col :xs="24" :lg="16">
        <a-card :bordered="false" class="chart-card" :bodyStyle="{ padding: '24px' }">
          <template #title>
            <div class="card-title-wrapper">
              <span class="card-title">素材上传趋势</span>
              <a-radio-group v-model:value="trendTimeRange" size="small" button-style="solid">
                <a-radio-button value="week">近一周</a-radio-button>
                <a-radio-button value="month">近一月</a-radio-button>
                <a-radio-button value="year">近一年</a-radio-button>
              </a-radio-group>
            </div>
          </template>
          <div id="upload-trend-chart" class="chart-container"></div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :lg="8">
        <a-card :bordered="false" class="chart-card" :bodyStyle="{ padding: '24px' }">
          <template #title>
            <div class="card-title-wrapper">
              <span class="card-title">素材分类分布</span>
            </div>
          </template>
          <div id="category-pie-chart" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- 列表区域 -->
    <a-row :gutter="[24, 24]" class="list-cards">
      <a-col :xs="24" :md="12">
        <a-card :bordered="false" class="list-card">
          <template #title>
            <div class="card-title-wrapper">
              <span class="card-title">最新用户</span>
            </div>
          </template>
          <template #extra>
            <a class="more-link">
              查看全部
              <right-outlined />
            </a>
          </template>
          <a-list
            :data-source="latestUsers"
            :pagination="false"
            item-layout="horizontal"
          >
            <template #renderItem="{ item }">
              <a-list-item class="user-list-item">
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :src="processAvatarUrl(item.avatar)" />
                  </template>
                  <template #title>
                    <div class="user-name">
                      {{ item.username }}
                      <a-tag :color="item.role === 'admin' ? 'red' : 'blue'" class="role-tag">
                        {{ item.role === 'admin' ? '管理员' : '用户' }}
                      </a-tag>
                    </div>
                  </template>
                  <template #description>
                    <div class="user-details">
                      <clock-circle-outlined /> 注册于 {{ formatDate(item.createdAt) }}
                    </div>
                  </template>
                </a-list-item-meta>
                <template #extra>
                  <a-button type="link" size="small">查看</a-button>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :md="12">
        <a-card :bordered="false" class="list-card">
          <template #title>
            <div class="card-title-wrapper">
              <span class="card-title">最新上传素材</span>
            </div>
          </template>
          <template #extra>
            <a class="more-link">
              查看全部
              <right-outlined />
            </a>
          </template>
          <a-list
            :data-source="latestMaterials"
            :pagination="false"
            item-layout="horizontal"
          >
            <template #renderItem="{ item }">
              <a-list-item class="material-list-item">
                <a-list-item-meta>
                  <template #avatar>
                    <div class="material-thumb-wrapper">
                      <img :src="processImageUrl(item.thumbUrl)" alt="素材预览" class="material-thumb" @error="handleImageError" />
                    </div>
                  </template>
                  <template #title>
                    <div class="material-name">
                      {{ item.title }}
                    </div>
                  </template>
                  <template #description>
                    <div class="material-details">
                      <a-tag color="blue">{{ item.categoryName }}</a-tag>
                      <span class="material-uploader">
                        <user-outlined /> {{ item.uploaderName }}
                      </span>
                    </div>
                  </template>
                </a-list-item-meta>
                <template #extra>
                  <div class="material-actions">
                    <a-tag :color="getStatusColor(item.status)" class="status-tag">
                      {{ getStatusText(item.status) }}
                    </a-tag>
                    <a-button type="link" size="small">查看</a-button>
                  </div>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import {
  PictureOutlined,
  UserOutlined,
  FileSearchOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ReloadOutlined,
  RightOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import * as echarts from 'echarts/core';
import { LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
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

const trendTimeRange = ref('week');
const chartInstances = ref({
  uploadTrend: null,
  categoryPie: null
});

const currentTime = ref(new Date());
const defaultImage = '/images/default-image.png';
const defaultAvatar = '/images/default-avatar.png';

// 计算属性
const formattedCurrentTime = computed(() => {
  return dayjs(currentTime.value).format('YYYY-MM-DD HH:mm');
});

// 模拟数据
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

// 处理图片错误
function handleImageError(e) {
  e.target.src = defaultImage;
}

// 处理头像URL
function processAvatarUrl(avatarUrl) {
  if (!avatarUrl) return defaultAvatar;
  
  // 如果是完整URL，直接返回
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // 其他情况返回默认头像
  return defaultAvatar;
}

// 处理图片URL
function processImageUrl(imageUrl) {
  if (!imageUrl) return defaultImage;
  
  // 如果是完整URL，直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // 其他情况使用默认图片
  return defaultImage;
}

// 监听时间范围变化
watch(trendTimeRange, () => {
  initUploadTrendChart();
});

// 创建定时器更新时间
let timer;
onMounted(() => {
  // 初始化图表
  initUploadTrendChart();
  initCategoryPieChart();
  
  // 更新当前时间
  timer = setInterval(() => {
    currentTime.value = new Date();
  }, 60000); // 每分钟更新一次
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  // 清除定时器
  if (timer) clearInterval(timer);
  
  // 移除事件监听
  window.removeEventListener('resize', handleResize);
  
  // 销毁图表
  if (chartInstances.value.uploadTrend) {
    chartInstances.value.uploadTrend.dispose();
  }
  if (chartInstances.value.categoryPie) {
    chartInstances.value.categoryPie.dispose();
  }
});

// 处理窗口大小变化
function handleResize() {
  if (chartInstances.value.uploadTrend) {
    chartInstances.value.uploadTrend.resize();
  }
  if (chartInstances.value.categoryPie) {
    chartInstances.value.categoryPie.resize();
  }
}

// 刷新数据
function refreshData() {
  // 这里可以添加实际的数据刷新逻辑
  // 模拟加载过程
  const hide = message.loading('正在刷新数据...', 0);
  setTimeout(() => {
    hide();
    message.success('数据已更新');
    
    // 重新初始化图表
    initUploadTrendChart();
    initCategoryPieChart();
  }, 1500);
}

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
  
  // 如果实例已存在则销毁
  if (chartInstances.value.uploadTrend) {
    chartInstances.value.uploadTrend.dispose();
  }
  
  const myChart = echarts.init(chartDom);
  chartInstances.value.uploadTrend = myChart;
  
  // 根据选择的时间范围生成数据
  let xAxisData, seriesData;
  
  if (trendTimeRange.value === 'week') {
    xAxisData = ['5/13', '5/14', '5/15', '5/16', '5/17', '5/18', '5/19'];
    seriesData = {
      upload: [15, 12, 18, 22, 16, 24, 20],
      approved: [12, 10, 15, 18, 14, 20, 18],
      favorites: [35, 42, 48, 55, 60, 68, 72]
    };
  } else if (trendTimeRange.value === 'month') {
    xAxisData = Array.from({ length: 30 }, (_, i) => `${4 + Math.floor((i + 20) / 30)}/${(i + 20) % 30 + 1}`);
    seriesData = {
      upload: Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 10),
      approved: Array.from({ length: 30 }, () => Math.floor(Math.random() * 15) + 8),
      favorites: Array.from({ length: 30 }, () => Math.floor(Math.random() * 40) + 30)
    };
  } else {
    // 年度数据
    xAxisData = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    seriesData = {
      upload: [150, 120, 180, 220, 160, 240, 200, 190, 230, 210, 250, 280],
      approved: [120, 100, 150, 180, 140, 200, 180, 160, 190, 180, 220, 240],
      favorites: [350, 420, 480, 550, 600, 680, 720, 700, 750, 800, 840, 900]
    };
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e6e9ed',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      padding: [10, 15],
      formatter: function(params) {
        let result = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].name}</div>`;
        params.forEach(param => {
          result += `<div style="display: flex; justify-content: space-between; align-items: center; margin: 5px 0;">
            <div>
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 5px;"></span>
              <span>${param.seriesName}:</span>
            </div>
            <span style="font-weight: bold;">${param.value}</span>
          </div>`;
        });
        return result;
      }
    },
    legend: {
      data: ['上传素材', '通过审核', '收藏次数'],
      right: 10,
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: '#e6e9ed'
        }
      },
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666'
      },
      splitLine: {
        lineStyle: {
          color: '#e6e9ed'
        }
      }
    },
    series: [
      {
        name: '上传素材',
        type: 'line',
        data: seriesData.upload,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: '#1890ff'
        },
        itemStyle: {
          color: '#1890ff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 144, 255, 0.5)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
          ])
        }
      },
      {
        name: '通过审核',
        type: 'line',
        data: seriesData.approved,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: '#52c41a'
        },
        itemStyle: {
          color: '#52c41a'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(82, 196, 26, 0.5)' },
            { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
          ])
        }
      },
      {
        name: '收藏次数',
        type: 'line',
        data: seriesData.favorites,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: '#faad14'
        },
        itemStyle: {
          color: '#faad14'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(250, 173, 20, 0.5)' },
            { offset: 1, color: 'rgba(250, 173, 20, 0.1)' }
          ])
        }
      }
    ]
  };
  
  myChart.setOption(option);
}

// 初始化分类饼图
function initCategoryPieChart() {
  const chartDom = document.getElementById('category-pie-chart');
  if (!chartDom) return;
  
  // 如果实例已存在则销毁
  if (chartInstances.value.categoryPie) {
    chartInstances.value.categoryPie.dispose();
  }
  
  const myChart = echarts.init(chartDom);
  chartInstances.value.categoryPie = myChart;
  
  const colorPalette = [
    '#1890ff', '#52c41a', '#faad14', '#eb2f96', 
    '#722ed1', '#13c2c2', '#fa8c16', '#a0d911'
  ];
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e6e9ed',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      padding: [10, 15]
    },
    legend: {
      orient: 'vertical',
      left: 10,
      top: 'center',
      data: ['客厅', '卧室', '厨房', '卫生间', '书房', '阳台', '其他'],
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 15,
      textStyle: {
        color: '#666'
      },
      formatter: function(name) {
        const data = option.series[0].data;
        const item = data.find(d => d.name === name);
        const percent = (item.value / data.reduce((sum, cur) => sum + cur.value, 0) * 100).toFixed(1);
        return `${name}  ${percent}%`;
      }
    },
    series: [
      {
        name: '素材分类',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.1)'
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
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
        ],
        color: colorPalette
      }
    ]
  };
  
  myChart.setOption(option);
}
</script>

<style scoped>
.dashboard-view {
  padding: 0;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

/* 统计卡片 */
.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.06),
              0 3px 6px 0 rgba(0, 0, 0, 0.05),
              0 5px 12px 4px rgba(0, 0, 0, 0.04);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.1),
              0 6px 20px 0 rgba(0, 0, 0, 0.08),
              0 8px 16px 8px rgba(0, 0, 0, 0.06);
}

.stat-card-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  font-size: 32px;
  margin-right: 16px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 16px;
}

.stat-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.stat-trend {
  font-weight: 500;
}

.stat-trend.up {
  color: #52c41a;
}

.stat-trend.down {
  color: #ff4d4f;
}

.stat-period {
  color: rgba(0, 0, 0, 0.45);
}

.action-link {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: #1890ff;
}

.action-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 图表卡片 */
.data-cards {
  margin-bottom: 24px;
}

.chart-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.06),
              0 3px 6px 0 rgba(0, 0, 0, 0.05),
              0 5px 12px 4px rgba(0, 0, 0, 0.04);
}

.card-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.chart-container {
  height: 350px;
}

/* 列表卡片 */
.list-cards {
  margin-bottom: 24px;
}

.list-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.06),
              0 3px 6px 0 rgba(0, 0, 0, 0.05),
              0 5px 12px 4px rgba(0, 0, 0, 0.04);
}

.more-link {
  display: flex;
  align-items: center;
  color: #1890ff;
  font-size: 14px;
}

.more-link:hover {
  color: #40a9ff;
}

.user-list-item {
  padding: 12px 0;
  transition: background-color 0.3s;
}

.user-list-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.user-name {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.role-tag {
  margin-left: 8px;
  font-size: 12px;
  line-height: 1;
  padding: 2px 6px;
}

.user-details {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(0, 0, 0, 0.45);
}

.material-list-item {
  padding: 12px 0;
  transition: background-color 0.3s;
}

.material-list-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.material-thumb-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.material-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.material-name {
  font-weight: 500;
}

.material-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.material-uploader {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(0, 0, 0, 0.45);
}

.material-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-tag {
  font-size: 12px;
  line-height: 1;
  padding: 2px 6px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .chart-container {
    height: 280px;
  }
  
  .stat-icon {
    width: 56px;
    height: 56px;
    font-size: 24px;
  }
  
  .stat-value {
    font-size: 24px;
  }
}
</style>