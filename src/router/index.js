import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

// 精简路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { guest: true }
  },
  {
    path: '/material/:id',
    name: 'MaterialDetail',
    component: () => import('@/views/MaterialDetailView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  },
    {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/DashboardView.vue')
  },
      {
    path: '/upload',
    name: 'Upload',
    component: () => import('@/views/UploadView.vue')
  },
   {
    path: '/admin/materials',
    name: 'MaterialManagementView',
    component: () => import('@/views/admin/MaterialManagementView.vue'),
    props: true
  },
        {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/user/ProfileView.vue')
  },
        {
    path: '/category/:id',
    name: 'CategoryMaterialView',
    component: () => import('@/views/category/CategoryMaterialView.vue')
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

// 全局前置守卫 - 简化版
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  // 需要登录的页面
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!userStore.isLoggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  }
  // 游客专用页面
  else if (to.matched.some(record => record.meta.guest)) {
    if (userStore.isLoggedIn) {
      next({ path: '/' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;