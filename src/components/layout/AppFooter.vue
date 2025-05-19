<template>
  <a-layout-footer class="footer">
    <div class="footer-content">
      <div class="footer-main">
        <div class="footer-section">
          <h3>关于我们</h3>
          <p>装修素材分享是一个面向设计师和业主的高质量装修素材分享平台，致力于为用户提供优质的装修灵感和素材。</p>
        </div>
        
        <div class="footer-section">
          <h3>快速链接</h3>
          <ul class="footer-links">
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="/upload">上传素材</router-link></li>
            <li><a href="#" @click.prevent="scrollToTop">返回顶部</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3>热门分类</h3>
          <ul class="footer-links category-links">
            <li v-for="category in hotCategories" :key="category.id">
              <router-link :to="`/category/${category.id}`">{{ category.name }}</router-link>
            </li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3>联系我们</h3>
          <p>
            <mail-outlined /> Email: contact@decor-sharing.com<br>
            <phone-outlined /> 电话: (123) 456-7890
          </p>
          <div class="social-links">
            <a href="#" target="_blank" title="微信">
              <wechat-outlined />
            </a>
            <a href="#" target="_blank" title="QQ">
              <qq-outlined />
            </a>
            <a href="#" target="_blank" title="微博">
              <weibo-outlined />
            </a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} 装修素材分享平台 - 版权所有</p>
        <p>
          <a href="#">隐私政策</a> | 
          <a href="#">使用条款</a> | 
          <a href="#">帮助中心</a>
        </p>
      </div>
    </div>
  </a-layout-footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCategories } from '@/api/category'

import { 
  MailOutlined, 
  PhoneOutlined, 
  WechatOutlined, 
  QqOutlined, 
  WeiboOutlined 
} from '@ant-design/icons-vue'
import { useMaterialStore } from '@/stores/material'

const materialStore = useMaterialStore()
const hotCategories = ref([])

// 计算当前年份
const currentYear = computed(() => new Date().getFullYear())

onMounted(async () => {
  const categories = await getCategories()
  // 只显示前5个分类
  hotCategories.value = categories.slice(0, 5)
})

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<style scoped>
.footer {
  background-color: #001529;
  color: rgba(255, 255, 255, 0.65);
  padding: 48px 0 24px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  margin-bottom: 48px;
}

.footer-section h3 {
  color: #fff;
  font-size: 18px;
  margin-bottom: 16px;
  font-weight: 500;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 8px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #1890ff;
}

.social-links {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.social-links a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.65);
  transition: all 0.3s;
}

.social-links a:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 24px;
  text-align: center;
}

.footer-bottom p {
  margin: 8px 0;
}

.footer-bottom a {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-bottom a:hover {
  color: #1890ff;
}
</style>