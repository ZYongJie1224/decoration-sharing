<template>
  <div class="not-found-view">
    <a-result
      status="404"
      title="404"
      sub-title="抱歉，您访问的页面不存在"
    >
      <template #extra>
        <a-space>
          <router-link to="/">
            <a-button type="primary">返回首页</a-button>
          </router-link>
          <a-button @click="goBack">返回上一页</a-button>
        </a-space>
      </template>
    </a-result>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goBack() {
  router.go(-1);
}
</script>

<style scoped>
.not-found-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px - 200px);
  padding: 40px 0;
}
</style>