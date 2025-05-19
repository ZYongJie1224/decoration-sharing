<template>
  <div class="admin-page">
    <a-layout style="min-height: 100vh;">
      <a-layout-sider
        v-model:collapsed="collapsed"
        collapsible
        :trigger="null"
        theme="dark"
        class="admin-sider"
      >
        <div class="logo">
          <router-link to="/admin">
            <img src="@/assets/logo.png" alt="Logo" class="logo-img" />
            <span v-if="!collapsed" class="logo-text">管理后台</span>
          </router-link>
        </div>
        
        <a-menu
          theme="dark"
          mode="inline"
          v-model:selectedKeys="selectedKeys"
        >
          <a-menu-item key="dashboard">
            <dashboard-outlined />
            <span>控制面板</span>
            <router-link to="/admin"></router-link>
          </a-menu-item>
          
          <a-menu-item key="users">
            <user-outlined />
            <span>用户管理</span>
            <router-link to="/admin/users"></router-link>
          </a-menu-item>
          
          <a-menu-item key="materials">
            <appstore-outlined />
            <span>素材管理</span>
            <router-link to="/admin/materials"></router-link>
          </a-menu-item>
          
          <a-menu-item key="categories">
            <folder-outlined />
            <span>分类管理</span>
            <router-link to="/admin/categories"></router-link>
          </a-menu-item>
          
          <a-menu-item key="frontend">
            <home-outlined />
            <span>返回前台</span>
            <router-link to="/"></router-link>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      
      <a-layout>
        <a-layout-header class="admin-header" style="background: #fff; padding: 0;">
          <menu-unfold-outlined
            v-if="collapsed"
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          <menu-fold-outlined
            v-else
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          
          <div class="header-actions">
            <a-space size="large">
              <a-badge :count="5" dot>
                <a-popover
                  placement="bottomRight"
                  trigger="click"
                  :overlay-style="{ width: '300px' }"
                >
                  <template #content>
                    <div class="notification-list">
                      <a-list
                        size="small"
                        :data-source="notifications"
                      >
                        <template #renderItem="{ item }">
                          <a-list-item>
                            <a-list-item-meta>
                              <template #title>
                                {{ item.title }}
                              </template>
                              <template #description>
                                {{ item.description }}
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
                  <a class="action-item">
                    <bell-outlined />
                  </a>
                </a-popover>
              </a-badge>
              
              <a-dropdown>
                <a class="action-item user-dropdown">
                  <a-avatar :src="userAvatar" />
                  <span v-if="!collapsed" class="username">{{ username }}</span>
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="profile">
                      <user-outlined />
                      个人资料
                    </a-menu-item>
                    <a-menu-item key="settings">
                      <setting-outlined />
                      系统设置
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="logout" @click="handleLogout">
                      <logout-outlined />
                      退出登录
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </div>
        </a-layout-header>
        
        <a-layout-content style="margin: 24px 16px;">
          <router-view></router-view>
        </a-layout-content>
        
        <a-layout-footer style="text-align: center">
          装修素材分享网站 ©2025 Created by ZYongJie1224
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
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
  LogoutOutlined
} from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 状态
const collapsed = ref(false);
const selectedKeys = ref(['dashboard']);

// 模拟通知数据
const notifications = ref([
  {
    id: 1,
    title: '新素材待审核',
    description: '有10个新素材等待审核',
    time: '5分钟前'
  },
  {
    id: 2,
    title: '新用户注册',
    description: '今日新增5位注册用户',
    time: '2小时前'
  },
  {
    id: 3,
    title: '系统更新',
    description: '系统将于今晚22:00进行维护更新',
    time: '1天前'
  }
]);

// 计算属性
const username = computed(() => userStore.username);
const userAvatar = computed(() => userStore.avatar);

// 监听路由变化，更新选中的菜单项
watch(
  () => route.path,
  (path) => {
    if (path === '/admin') {
      selectedKeys.value = ['dashboard'];
    } else if (path === '/admin/users') {
      selectedKeys.value = ['users'];
    } else if (path === '/admin/materials') {
      selectedKeys.value = ['materials'];
    } else if (path === '/admin/categories') {
      selectedKeys.value = ['categories'];
    } else if (path === '/') {
      selectedKeys.value = ['frontend'];
    }
  },
  { immediate: true }
);

// 处理退出登录
function handleLogout() {
  userStore.logout();
  message.success('已成功退出登录');
  router.push('/login');
}
</script>

<style scoped>
.admin-page .main-content {
  padding-top: 0;
}

.admin-sider {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s;
}

.logo a {
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
}

.logo-img {
  height: 32px;
  margin-right: 8px;
}

.logo-text {
  color: white;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  z-index: 9;
}

.trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
    color: #1890ff;
}

.header-actions {
  display: flex;
  align-items: center;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.3s;
  color: rgba(0, 0, 0, 0.65);
}

.action-item:hover {
  color: #1890ff;
}

.user-dropdown {
  padding: 0 12px;
}

.username {
  margin-left: 8px;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.view-all {
  text-align: center;
  padding: 8px 0;
  border-top: 1px solid #e8e8e8;
}
</style>