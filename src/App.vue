<template>
  <a-config-provider :locale="zhCN">
    <div id="app">
      <app-header v-if="showNavigation" />
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      <app-footer v-if="showNavigation" />
    </div>
  </a-config-provider>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';

const route = useRoute();

// 在管理员页面不显示常规导航
const showNavigation = computed(() => !route.path.startsWith('/admin'));
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 64px; /* Header height */
}

/* Admin pages don't need the top padding */
.admin-page .main-content {
  padding-top: 0;
}
</style>