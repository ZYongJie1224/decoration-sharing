<template>
  <div class="admin-page">
    <a-layout style="min-height: 100vh;">
      <a-layout-sider
        v-model:collapsed="collapsed"
        collapsible
        :trigger="null"
        theme="dark"
        class="admin-sider"
        :width="240"
      >
        <div class="logo">
          <div class="logo-link">
            <img src="@/assets/logo.png" alt="Logo" class="logo-img" />
            <span v-if="!collapsed" class="logo-text">管理控制台</span>
          </div>
        </div>
        
        <a-menu
          theme="dark"
          mode="inline"
          v-model:selectedKeys="selectedKeys"
          class="side-menu"
          @select="handleMenuSelect"
        >
          <a-menu-item key="dashboard" class="menu-item">
            <template #icon><dashboard-outlined /></template>
            <span>控制面板</span>
          </a-menu-item>
          
          <a-menu-item key="users" class="menu-item">
            <template #icon><user-outlined /></template>
            <span>用户管理</span>
          </a-menu-item>
          
          <a-menu-item key="materials" class="menu-item">
            <template #icon><appstore-outlined /></template>
            <span>素材管理</span>
          </a-menu-item>
          
          <a-menu-item key="categories" class="menu-item">
            <template #icon><folder-outlined /></template>
            <span>分类管理</span>
          </a-menu-item>
          
          <a-divider style="background-color: #303030; margin: 16px 0" />
          
          <a-menu-item key="frontend" class="menu-item" @click="goToFrontend">
            <template #icon><home-outlined /></template>
            <span>返回前台</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      
      <a-layout>
        <a-layout-header class="admin-header">
          <div class="header-left">
            <button class="trigger-btn" @click="() => (collapsed = !collapsed)">
              <menu-unfold-outlined v-if="collapsed" />
              <menu-fold-outlined v-else />
            </button>
            <div class="breadcrumb-container">
              <a-breadcrumb>
                <a-breadcrumb-item>管理后台</a-breadcrumb-item>
                <a-breadcrumb-item>{{ getPageTitle() }}</a-breadcrumb-item>
              </a-breadcrumb>
            </div>
          </div>
          
          <div class="header-actions">
            <a-space size="large">
              <a-badge :count="3" dot class="notification-badge">
                <a-popover
                  placement="bottomRight"
                  trigger="click"
                  :overlay-style="{ width: '360px' }"
                  overlay-class-name="notification-popover"
                >
                  <template #content>
                    <div class="notification-header">
                      <h3>通知中心</h3>
                      <a-button type="link" size="small">标记全部为已读</a-button>
                    </div>
                    <div class="notification-list">
                      <a-list
                        size="small"
                        :data-source="notifications"
                      >
                        <template #renderItem="{ item }">
                          <a-list-item class="notification-item">
                            <a-list-item-meta>
                              <template #avatar>
                                <a-avatar :style="{ backgroundColor: item.color || '#1890ff' }">
                                  <template #icon><bell-outlined /></template>
                                </a-avatar>
                              </template>
                              <template #title>
                                <div class="notification-title">
                                  {{ item.title }}
                                  <span class="notification-time">{{ item.time }}</span>
                                </div>
                              </template>
                              <template #description>
                                <div class="notification-desc">{{ item.description }}</div>
                              </template>
                            </a-list-item-meta>
                          </a-list-item>
                        </template>
                      </a-list>
                      <div class="view-all">
                        <a>查看全部通知</a>
                      </div>
                    </div>
                  </template>
                  <a class="action-item notification-icon">
                    <bell-outlined />
                  </a>
                </a-popover>
              </a-badge>
              
              <a-dropdown trigger="click">
                <div class="user-dropdown">
                  <a-avatar :src="processedAvatar" class="user-avatar" @error="handleAvatarError" />
                  <span class="username">{{ username }}</span>
                  <down-outlined class="dropdown-icon" />
                </div>
                <template #overlay>
                  <a-menu class="user-menu">
                    <div class="user-info">
                      <a-avatar :src="processedAvatar" size="large" />
                      <div class="user-details">
                        <div class="user-name">{{ username }}</div>
                        <div class="user-role">管理员</div>
                      </div>
                    </div>
                    <a-menu-divider />
                    <a-menu-item key="profile">
                      <template #icon><user-outlined /></template>
                      个人资料
                    </a-menu-item>
                    <a-menu-item key="settings">
                      <template #icon><setting-outlined /></template>
                      系统设置
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="logout" @click="handleLogout">
                      <template #icon><logout-outlined /></template>
                      退出登录
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </div>
        </a-layout-header>
        
        <a-layout-content class="admin-content">
          <div class="content-container">
            <!-- 使用Tab组件替代router-view -->
            <a-tabs 
              v-model:activeKey="activeTab" 
              :tabBarStyle="{ display: 'none' }"
              :animated="{ tabPane: true }"
            >
              <a-tab-pane key="dashboard" forceRender>
                <admin-dashboard />
              </a-tab-pane>
              
              <a-tab-pane key="users" forceRender>
                <user-management-view />
              </a-tab-pane>
              
              <a-tab-pane key="materials" forceRender>
                <material-management-view />
              </a-tab-pane>
              
              <a-tab-pane key="categories" forceRender>
                <category-management-view />
              </a-tab-pane>
            </a-tabs>
          </div>
        </a-layout-content>
        
        <a-layout-footer class="admin-footer">
          装修素材分享网站 © 2025 Created by ZYongJie1224
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  UserOutlined,
  AppstoreOutlined,
  FolderOutlined,
  HomeOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined
} from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/user';

// 导入各个管理页面组件
import AdminDashboard from './DashboardView.vue';
import UserManagementView from './UserManagementView.vue';
import MaterialManagementView from './MaterialManagementView.vue';
import CategoryManagementView from './CategoryManagementView.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 状态
const collapsed = ref(false);
const selectedKeys = ref(['dashboard']);
const defaultAvatar = '/images/default-avatar.png';
const activeTab = ref('dashboard'); // 当前激活的Tab

// 模拟通知数据
const notifications = ref([
  {
    id: 1,
    title: '新素材待审核',
    description: '有10个新素材等待审核',
    time: '5分钟前',
    color: '#1890ff'
  },
  {
    id: 2,
    title: '新用户注册',
    description: '今日新增5位注册用户',
    time: '2小时前',
    color: '#52c41a'
  },
  {
    id: 3,
    title: '系统更新',
    description: '系统将于今晚22:00进行维护更新',
    time: '1天前',
    color: '#faad14'
  }
]);

// 计算属性
const username = computed(() => userStore.username || 'admin');

// 处理头像URL
const processedAvatar = computed(() => {
  const avatarUrl = userStore.avatar;
  if (!avatarUrl) return defaultAvatar;
  
  // 如果是完整URL，直接返回
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // 如果已经包含 /uploads/avatars 前缀，则直接使用
  if (avatarUrl.startsWith('/uploads/avatars/')) {
    return avatarUrl;
  }
  
  // 如果已经包含 /uploads 前缀，但不是avatars子目录
  if (avatarUrl.startsWith('/uploads/')) {
    // 获取文件名并添加到avatars子目录
    const fileName = avatarUrl.split('/').pop();
    return `/uploads/avatars/${fileName}`;
  }
  
  // 否则，加上 /uploads/avatars/ 前缀
  return avatarUrl.startsWith('/') ? `/uploads/avatars${avatarUrl}` : `/uploads/avatars/${avatarUrl}`;
});

// 处理头像加载错误
function handleAvatarError(e) {
  e.target.src = defaultAvatar;
}

// 组件挂载时，根据当前路由设置初始选中的Tab
onMounted(() => {
  const path = route.path;
  if (path.includes('/admin/users')) {
    activeTab.value = 'users';
    selectedKeys.value = ['users'];
  } else if (path.includes('/admin/materials')) {
    activeTab.value = 'materials';
    selectedKeys.value = ['materials'];
  } else if (path.includes('/admin/categories')) {
    activeTab.value = 'categories';
    selectedKeys.value = ['categories'];
  } else {
    activeTab.value = 'dashboard';
    selectedKeys.value = ['dashboard'];
  }
  
  // 监听自定义事件以在组件间切换Tab
  window.addEventListener('switch-tab', (event) => {
    if (event.detail && event.detail.tab) {
      activeTab.value = event.detail.tab;
      selectedKeys.value = [event.detail.tab];
    }
  });
});

// 处理菜单选择，切换Tab而不是路由
function handleMenuSelect({ key }) {
  if (key === 'frontend') {
    goToFrontend();
    return;
  }
  
  activeTab.value = key;
  selectedKeys.value = [key];
}

// 返回前台
function goToFrontend() {
  router.push('/');
}

// 根据当前Tab获取页面标题
function getPageTitle() {
  switch (activeTab.value) {
    case 'dashboard': return '控制面板';
    case 'users': return '用户管理';
    case 'materials': return '素材管理';
    case 'categories': return '分类管理';
    default: return '控制面板';
  }
}

// 处理退出登录
function handleLogout() {
  userStore.logout();
  message.success('已成功退出登录');
  router.push('/login');
}
</script>

<style scoped>
/* 管理页面整体样式 */
.admin-content {
  margin: 0; /* 原来是 margin: 24px; - 修改为0以减少空白 */
  background-color: #f0f2f5;
}
.admin-page {
  background-color: #f0f2f5;
}

/* 侧边栏样式 */
.admin-sider {
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  overflow: hidden;
  transition: all 0.3s;
  background-color: #001529;
}

.logo-link {
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
}

.logo-img {
  height: 32px;
  margin-right: 12px;
}

.logo-text {
  color: white;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.side-menu {
  border-right: 0;
}

.menu-item {
  margin-top: 4px;
  margin-bottom: 4px;
}

/* 顶部导航栏样式 */
.admin-header {
  background: #fff;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  z-index: 9;
}

.header-left {
  display: flex;
  align-items: center;
}

.trigger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
  border: none;
  background: transparent;
  color: rgba(0, 0, 0, 0.65);
}

.trigger-btn:hover {
  color: #1890ff;
  background-color: rgba(0, 0, 0, 0.025);
}

.breadcrumb-container {
  margin-left: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  padding-right: 24px;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 16px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  color: rgba(0, 0, 0, 0.65);
}

.action-item:hover {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
}

.notification-icon {
  font-size: 18px;
}

.notification-badge {
  margin-right: 8px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 48px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.user-dropdown:hover {
  background-color: rgba(0, 0, 0, 0.025);
}

.user-avatar {
  margin-right: 8px;
}

.username {
  font-weight: 500;
  margin-right: 8px;
  color: rgba(0, 0, 0, 0.85);
}

.dropdown-icon {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}

/* 内容区域样式 - 修改这些值以减少空白区域 */
.admin-content {
  margin: 0; /* 原来是 margin: 24px; - 修改为0以减少空白 */
  background-color: #f0f2f5;
}

.content-container {
  padding: 0; /* 原来是 padding: 24px; - 修改为0以减少空白 */
  background: #fff;
  border-radius: 0; /* 原来是 border-radius: 4px; - 移除圆角使内容区域贴合边缘 */
  box-shadow: none; /* 移除阴影效果增加内容空间 */
  min-height: calc(100vh - 128px); /* 调整最小高度，减少底部空白 */
}

/* 确保Tab内容不会有多余的空白 */
:deep(.ant-tabs-tabpane) {
  padding: 0 !important;
}

/* 通知样式 */
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;
}

.notification-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.notification-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.notification-time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.notification-desc {
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
}

.view-all {
  text-align: center;
  padding: 12px;
  border-top: 1px solid #f0f0f0;
}

.view-all a {
  color: #1890ff;
  text-decoration: none;
  font-size: 14px;
}

/* 用户下拉菜单样式 */
:deep(.user-menu) {
  width: 240px;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 16px;
}

.user-details {
  margin-left: 12px;
}

.user-name {
  font-weight: 600;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
}

.user-role {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

/* 页脚样式 */
.admin-footer {
  text-align: center;
  padding: 16px 0; /* 减小页脚上下内边距 */
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  background: #fff;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.03);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .admin-content {
    margin: 0;
  }
  
  .content-container {
    padding: 0;
  }
  
  .username {
    display: none;
  }
}
</style>

<style>
/* 全局样式 - 通知弹窗 */
.notification-popover .ant-popover-inner-content {
  padding: 0;
}

/* 确保tab组件没有额外的间距 */
.ant-tabs {
  margin: 0 !important;
}

.ant-tabs-content {
  height: 100%;
}

/* 修复子页面的内边距问题 */
.dashboard-view,
.user-management-view,
.material-management-view,
.category-management-view {
  padding: 20px;
}
</style>
<style>
/* 全局样式覆盖 */
/* 通知弹窗样式 */
.notification-popover .ant-popover-inner-content {
  padding: 0;
}

/* 覆盖Ant Design布局组件的默认内边距 */
.ant-layout-content {
  padding: 0 !important;
}

/* 直接覆盖main-content类的padding */
.main-content {
  padding: 0 !important;
}

/* 确保tab组件没有额外的间距 */
.ant-tabs {
  margin: 0 !important;
}

.ant-tabs-content {
  height: 100%;
  padding: 0 !important;
}

/* 确保内容区域没有额外间距 */
.content-container {
  padding: 0 !important;
}

/* 修复子页面的内边距问题 */
.dashboard-view,
.user-management-view,
.material-management-view,
.category-management-view {
  padding: 20px;
}

/* 确保Ant Design的布局组件中的内容不受默认样式影响 */
.ant-layout .ant-layout-content > div {
  padding: 0 !important;
}
</style>