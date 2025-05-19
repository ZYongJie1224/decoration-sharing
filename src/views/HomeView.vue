<template>
  <div class="home-view">
    <!-- 首页横幅 -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">发现精美装修灵感</h1>
        <p class="hero-subtitle">分享与发现高质量的装修素材，激发你的创意灵感</p>
        <div class="hero-search">
          <a-input-search v-model:value="searchKeyword" placeholder="搜索你感兴趣的装修素材..." enter-button="搜索" size="large"
            @search="handleSearch" />
        </div>
        <div class="hero-tags">
          <span>热门搜索：</span>
          <a-tag color="blue" v-for="tag in popularTags" :key="tag" @click="quickSearch(tag)">{{ tag }}</a-tag>
        </div>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="category-section">
      <div class="page-container">
        <div class="section-header">
          <h2>热门分类</h2>
          <router-link to="/categories" class="view-all">查看全部</router-link>
        </div>

        <a-row :gutter="[16, 16]">
          <a-col :xs="12" :sm="8" :md="6" :lg="4" v-for="category in topCategories" :key="category.id">
            <router-link :to="`/category/${category.id}`" class="category-card">
              <div class="category-icon">
                <!-- 使用动态组件渲染Ant Design图标 -->
                <component :is="category.iconComponent" class="category-icon-component" />
              </div>
              <div class="category-name">{{ category.name }}</div>
            </router-link>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- 推荐素材 -->
    <div class="featured-section">
      <div class="page-container">
        <div class="section-header">
          <h2>推荐素材</h2>
          <a-radio-group v-model:value="currentFilter" button-style="solid">
            <a-radio-button value="latest">最新上传</a-radio-button>
            <a-radio-button value="popular">最受欢迎</a-radio-button>
            <a-radio-button value="picked">精选推荐</a-radio-button>
          </a-radio-group>
        </div>

        <a-spin :spinning="loading">
          <div v-if="materials.length" class="materials-grid">
            <a-row :gutter="[24, 24]">
              <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="material in materials" :key="material.id">
                <material-card :material="material" />
              </a-col>
            </a-row>

            <div class="pagination-container">
              <a-pagination v-model:current="currentPage" :pageSize="pageSize" :total="totalItems"
                @change="handlePageChange" :showSizeChanger="false" />
            </div>
          </div>

          <a-empty v-else description="暂无素材" />
        </a-spin>
      </div>
    </div>

    <!-- 上传引导 -->
    <div class="upload-cta-section">
      <div class="page-container">
        <div class="upload-cta-content">
          <h2>分享你的创意，成为设计达人</h2>
          <p>上传你的装修素材，与全球设计爱好者一起交流灵感和创意</p>
          <router-link to="/upload">
            <a-button type="primary" size="large">立即上传</a-button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MaterialCard from '@/components/material/MaterialCard.vue'
import { useMaterialStore } from '@/stores/material'
import { useCategoryStore } from '@/stores/category'
// 导入常用的Ant Design图标
import {
  HomeOutlined,
  ShopOutlined,
  BulbOutlined,
  BgColorsOutlined,
  AppstoreOutlined,
  ToolOutlined
} from '@ant-design/icons-vue'
// 创建图标映射数组
const categoryIcons = [
  HomeOutlined,
  ShopOutlined,
  BulbOutlined,
  BgColorsOutlined,
  ToolOutlined,
  AppstoreOutlined
];

const route = useRoute()
const router = useRouter()
const materialStore = useMaterialStore()
const categoryStore = useCategoryStore()

// 状态
const searchKeyword = ref('')
const currentFilter = ref('latest')
const currentPage = ref(1)
const pageSize = ref(12)

// 模拟数据
const popularTags = ref(['北欧风', '简约', '现代', '中式', '地中海', '美式', '工业风'])
const topCategories = ref([])

// 计算属性
const loading = computed(() => materialStore.loading || categoryStore.loading)
const materials = computed(() => materialStore.materials)
const totalItems = computed(() => materialStore.totalMaterials)

// 初始化
onMounted(async () => {
  try {
    // 使用 categoryStore 获取分类列表
    await categoryStore.fetchCategories()
    
    // 使用 categoryStore 的 categories 数据
    if (categoryStore.categories.length) {
      topCategories.value = categoryStore.categories.slice(0, 6).map((cat, index) => ({
        ...cat,
        // 使用对应索引的图标，如果索引超出范围则使用最后一个图标
        iconComponent: categoryIcons[index % categoryIcons.length],
      }))
    }

    // 检查URL中是否有搜索参数
    if (route.query.search) {
      searchKeyword.value = route.query.search
      await searchMaterials(searchKeyword.value)
    } else {
      // 加载素材列表
      await loadMaterials()
    }
  } catch (error) {
    console.error('初始化数据失败:', error)
  }
})

// 监听过滤器变化
watch(currentFilter, () => {
  currentPage.value = 1
  loadMaterials()
})

// 处理分页
function handlePageChange(page) {
  currentPage.value = page

  if (searchKeyword.value) {
    searchMaterials(searchKeyword.value)
  } else {
    loadMaterials()
  }

  // 滚动到内容区域顶部
  const featuredSection = document.querySelector('.featured-section')
  if (featuredSection) {
    featuredSection.scrollIntoView({ behavior: 'smooth' })
  }
}

// 加载素材
async function loadMaterials() {
  try {
    const params = {
      page: currentPage.value - 1, // 后端是0基索引
      pageSize: pageSize.value,
      sort: currentFilter.value,
      status: "APPROVED"
    }
    
    // 使用 materialStore 的 fetchMaterials 方法
    await materialStore.fetchMaterials(params)
  } catch (error) {
    console.error('加载材料失败:', error)
  }
}

// 搜索素材
async function searchMaterials(keyword) {
  if (!keyword.trim()) return
  
  try {
    // 使用 materialStore 的 searchMaterials 方法
    await materialStore.searchMaterials(keyword, {
      page: currentPage.value - 1, // 后端是0基索引
      pageSize: pageSize.value
    })
  } catch (error) {
    console.error('搜索材料失败:', error)
  }
}

// 处理搜索
function handleSearch() {
  if (!searchKeyword.value.trim()) return

  currentPage.value = 1

  // 更新URL查询参数，方便分享
  router.push({
    path: '/',
    query: { search: searchKeyword.value }
  })

  searchMaterials(searchKeyword.value)
}

// 快速搜索
function quickSearch(tag) {
  searchKeyword.value = tag
  handleSearch()
}
</script>

<style scoped>
/* CSS 保持不变 */
.home-view {
  width: 100%;
}

/* 首页横幅 */
.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 100px 0;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

.hero-title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 16px;
  color: white;
}

.hero-subtitle {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.hero-search {
  max-width: 600px;
  margin: 0 auto 24px;
}

.hero-tags {
  font-size: 14px;
}

.hero-tags .ant-tag {
  cursor: pointer;
  margin-bottom: 8px;
}

/* 分类导航 */
.category-section {
  padding: 60px 0;
  background-color: #fff;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 24px;
  margin: 0;
}

.view-all {
  color: var(--primary-color);
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  border-radius: 8px;
  background-color: #f5f5f5;
  transition: all 0.3s;
  text-decoration: none;
  color: var(--text-color);
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.category-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e6f7ff;
  margin-bottom: 12px;
}

.category-icon-component {
  font-size: 24px;
  color: #1890ff;
}

.category-name {
  font-weight: 500;
}

/* 推荐素材 */
.featured-section {
  padding: 60px 0;
  background-color: #f9f9f9;
}

.materials-grid {
  margin-top: 24px;
}

.pagination-container {
  margin-top: 40px;
  text-align: center;
}

/* 上传引导 */
.upload-cta-section {
  padding: 80px 0;
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;
}

.upload-cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.upload-cta-content h2 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
  color: white;
}

.upload-cta-content p {
  font-size: 16px;
  margin-bottom: 32px;
  opacity: 0.9;
}

/* 响应式容器 */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .view-all {
    margin-top: 8px;
  }
}
</style>