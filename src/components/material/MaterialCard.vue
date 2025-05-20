<template>
  <div class="material-card" @click="navigateToDetail">
    <div class="material-image-container">
      <img :src="imageUrl" :alt="material.title" class="material-image" 
           @error="handleImageError" ref="imageRef" />
      
      <div class="material-info-overlay">
        <div class="material-top-info">
          <a-tag color="blue">{{ material.categoryName || '未分类' }}</a-tag>
          <a-button 
            :type="isFavorite ? 'primary' : 'default'" 
            shape="circle" 
            size="small"
            @click.stop="toggleLike"
          >
            <template #icon><heart-outlined v-if="!isFavorite" /><heart-filled v-else /></template>
          </a-button>
        </div>
        
        <div class="material-bottom-info">
          <div class="uploader-info">
            <a-avatar :size="24" :src="uploaderAvatarUrl" @error="handleAvatarError" />
            <span class="uploader-name">{{ material.uploaderName || '匿名用户' }}</span>
          </div>
          
          <div class="material-stats">
            <span><eye-outlined /> {{ formatNumber(material.views) }}</span>
            <span><heart-outlined /> {{ formatNumber(localFavoritesCount) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="material-content">
      <h3 class="material-title" :title="material.title">{{ material.title || '无标题' }}</h3>
      <div class="material-description" v-if="material.description">
        {{ truncateText(material.description, 60) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { HeartOutlined, HeartFilled, EyeOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { ref, computed, watch } from 'vue';
import { useMaterialStore } from '@/stores/material';
import { useUserStore } from '@/stores/user';
import { message } from 'ant-design-vue';

const props = defineProps({
  material: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const materialStore = useMaterialStore();
const userStore = useUserStore();
const imageRef = ref(null);

// 添加本地响应式状态来跟踪收藏状态和收藏数
const isFavorite = ref(props.material.favorite);
const localFavoritesCount = ref(props.material.favorites || 0);

console.log(`传参fav: ${isFavorite.value}`, `初始收藏数: ${localFavoritesCount.value}`);

// 当 props.material 相关属性变化时更新本地状态
watch(() => props.material.favorite, (newValue) => {
  isFavorite.value = newValue;
});

watch(() => props.material.favorites, (newValue) => {
  if (newValue !== undefined) {
    localFavoritesCount.value = newValue;
  }
});

// 默认图片和头像
const defaultImage = '/images/default-image.png';  // 默认图片放在 public/images 目录
const defaultAvatar = '/images/default-avatar.png'; // 默认头像放在 public/images 目录

// 计算属性: 图片URL
const imageUrl = computed(() => {
  const url = props.material.imageUrl;
  if (!url) return defaultImage;
  
  // 如果是完整的URL（外部图片），直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 如果是 UUID 格式的文件名，拼接到 /uploads 目录
  if (url.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z]+$/i)) {
    return `/uploads/${url}`;
  }
  
  // 如果已经包含 /uploads 前缀，则直接使用
  if (url.startsWith('/uploads/')) {
    return url;
  }
  
  // 否则，加上 /uploads/ 前缀
  return url.startsWith('/') ? url : `/uploads/${url}`;
});

// 计算属性: 上传者头像URL
const uploaderAvatarUrl = computed(() => {
  const url = props.material.uploaderAvatar;
  if (!url) return defaultAvatar;
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 如果是头像，可能存放在不同位置
  if (url.startsWith('/uploads/')) {
    return url;
  }
  
  return url.startsWith('/') ? url : `/uploads/${url}`;
});

// 处理图片加载错误
function handleImageError() {
  console.warn(`图片加载失败: ${props.material.imageUrl}`);
  if (imageRef.value) {
    imageRef.value.src = defaultImage;
  }
}

// 处理头像加载错误
function handleAvatarError(e) {
  console.warn(`头像加载失败: ${props.material.uploaderAvatar}`);
  e.target.src = defaultAvatar;
}

// 截断文本
function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

// 格式化数字
function formatNumber(num) {
  if (!num && num !== 0) return 0;
  if (num < 1000) return num;
  return (num / 1000).toFixed(1) + 'k';
}

// 导航到详情页
function navigateToDetail() {
  router.push(`/material/${props.material.id}`);
}

// 切换喜欢状态
function toggleLike(event) {
  event.stopPropagation();
  
  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    message.warning('请先登录后再收藏');
    // 记录当前URL，以便登录后返回
    const currentPath = router.currentRoute.value.fullPath;
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    return;
  }
  
  // 先在本地立即更新状态，优化用户体验
  const originalFavoriteState = isFavorite.value;
  const newFavoriteState = !originalFavoriteState;
  isFavorite.value = newFavoriteState;
  
  // 立即更新收藏计数
  if (newFavoriteState) {
    localFavoritesCount.value += 1;
  } else {
    localFavoritesCount.value = Math.max(0, localFavoritesCount.value - 1);
  }
  
  // 显示操作进行中的状态
  const loadingKey = `favorite-${props.material.id}`;
  message.loading({ content: newFavoriteState ? '收藏中...' : '取消收藏中...', key: loadingKey });
  
  // 发送请求
  materialStore.toggleFavorite(props.material.id)
    .then(result => {
      if (result) {
        // 服务器确认后，确保状态与服务器一致
        isFavorite.value = result.isFavorite;
        console.log(result)
        // 显示成功消息
        if (result.isFavorite) {
          message.success({ content: '收藏成功', key: loadingKey });
        } else {
          message.success({ content: '取消收藏成功', key: loadingKey });
        }
        
        console.log('状态已更新:', result.favorite ? '已收藏' : '已取消收藏');
      } else {
        // 如果请求成功但响应格式不正确，回滚本地状态
        isFavorite.value = originalFavoriteState;
        
        // 回滚收藏计数
        if (newFavoriteState) {
          localFavoritesCount.value = Math.max(0, localFavoritesCount.value - 1);
        } else {
          localFavoritesCount.value += 1;
        }
        
        message.error({ content: '操作失败，响应格式不正确', key: loadingKey });
      }
    })
    .catch(error => {
      console.error('操作失败:', error);
      
      // 错误处理：回滚本地状态
      isFavorite.value = originalFavoriteState;
      
      // 回滚收藏计数
      if (newFavoriteState) {
        localFavoritesCount.value = Math.max(0, localFavoritesCount.value - 1);
      } else {
        localFavoritesCount.value += 1;
      }
      
      // 判断是否是未授权错误
      if (error.response && error.response.status === 401) {
        message.error({ content: '请先登录后再收藏', key: loadingKey });
        // 记录当前URL，以便登录后返回
        const currentPath = router.currentRoute.value.fullPath;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      } else {
        message.error({ content: '操作失败，请稍后重试', key: loadingKey });
      }
    });
}
</script>

<style scoped>
.material-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  background-color: white;
  cursor: pointer;
}

.material-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.material-image-container {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 比例 */
  overflow: hidden;
}

.material-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.material-info-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
  background: linear-gradient(to bottom, 
    rgba(0,0,0,0.2) 0%, 
    rgba(0,0,0,0) 30%, 
    rgba(0,0,0,0) 70%, 
    rgba(0,0,0,0.6) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.material-card:hover .material-info-overlay {
  opacity: 1;
}

.material-top-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.material-bottom-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.uploader-info {
  display: flex;
  align-items: center;
}

.uploader-name {
  font-size: 14px;
  margin-left: 8px;
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.material-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.material-content {
  padding: 16px;
}

.material-title {
  font-size: 16px;
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.material-description {
  font-size: 14px;
  color: var(--text-color-secondary);
  line-height: 1.5;
  height: 42px; /* 2行文字高度 */
  overflow: hidden;
}
</style>