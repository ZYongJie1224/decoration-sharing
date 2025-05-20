<template>
    <div class="material-detail-view">
        <div class="page-container">
            <a-breadcrumb class="breadcrumb">
                <a-breadcrumb-item>
                    <router-link to="/">首页</router-link>
                </a-breadcrumb-item>
                <a-breadcrumb-item v-if="material?.categoryId">
                    <router-link :to="`/category/${material.categoryId}`">{{ material.categoryName }}</router-link>
                </a-breadcrumb-item>
                <a-breadcrumb-item>{{ material?.title || '素材详情' }}</a-breadcrumb-item>
            </a-breadcrumb>

            <a-spin :spinning="loading">
                <template v-if="material">
                    <a-row :gutter="32" class="material-content">
                        <a-col :xs="24" :md="16">
                            <div class="material-main">
                                <div class="material-image-container">
                                    <!-- 处理主素材图片 -->
                                    <img :src="processImageUrl(material.imageUrl)" :alt="material.title" 
                                         class="material-main-image" @error="handleImageError" ref="mainImageRef" />
                                </div>

                                <div class="material-tags">
                                    <a-tag color="blue">{{ material.categoryName }}</a-tag>
                                    <a-tag v-for="tag in material.tags" :key="tag">{{ tag }}</a-tag>
                                </div>

                                <div class="material-detail-box">
                                    <h2 class="material-title">{{ material.title }}</h2>

                                    <div class="material-meta">
                                        <div class="meta-item">
                                            <clock-circle-outlined />
                                            <span>{{ formatDate(material.createdAt) }}</span>
                                        </div>
                                        <div class="meta-item">
                                            <eye-outlined />
                                            <span>{{ material.views || 0 }} 浏览</span>
                                        </div>
                                        <div class="meta-item">
                                            <heart-outlined />
                                            <span>{{ material.favorites || 0 }} 收藏</span>
                                        </div>
                                    </div>

                                    <a-divider />

                                    <div class="material-description">
                                        <h3>素材描述</h3>
                                        <p>{{ material.description }}</p>
                                    </div>

                                    <template v-if="material.details && material.details.length">
                                        <a-divider />

                                        <div class="material-specs">
                                            <h3>素材规格</h3>
                                            <a-descriptions :column="{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }">
                                                <a-descriptions-item v-for="(detail, index) in material.details"
                                                    :key="index" :label="detail.label">
                                                    {{ detail.value }}
                                                </a-descriptions-item>
                                            </a-descriptions>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </a-col>

                        <a-col :xs="24" :md="8">
                            <div class="material-sidebar">
                                <div class="material-actions">
                                    <a-button :type="material.isFavorite ? 'default' : 'primary'" size="large"
                                        @click="handleFavorite" block>
                                        <template #icon>
                                            <heart-filled v-if="material.isFavorite" />
                                            <heart-outlined v-else />
                                        </template>
                                        {{ material.favorite ? '取消收藏' : '收藏素材' }}
                                    </a-button>

                                    <a-button type="default" size="large" block class="action-btn">
                                        <template #icon><share-alt-outlined /></template>
                                        分享
                                    </a-button>

                                    <a-button type="default" size="large" block class="action-btn"
                                        @click="handleDownload">
                                        <template #icon><download-outlined /></template>
                                        下载高清原图
                                    </a-button>
                                </div>

                                <a-divider />

                                <div class="uploader-box">
                                    <h3>上传者</h3>
                                    <div class="uploader-info">
                                        <!-- 处理上传者头像 -->
                                        <a-avatar :size="64" :src="processAvatarUrl(material.uploader.avatar)" 
                                                 @error="handleAvatarError" />
                                        <div class="uploader-details">
                                            <h4>{{ material.uploader.username }}</h4>
                                            <p>{{ material.uploader.bio || '这个用户很懒，还没有写简介' }}</p>
                                            <a-button type="primary" size="small">查看主页</a-button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </a-col>
                    </a-row>

                    <a-divider />

                    <div class="comments-section">
                        <h3>用户评论 ({{ material.comments?.length || 0 }})</h3>

                        <div class="comment-form" v-if="isLoggedIn">
                            <a-form :model="commentForm" @finish="submitComment">
                                <a-form-item name="content">
                                    <a-textarea v-model:value="commentForm.content" :rows="4" placeholder="分享你的想法..." />
                                </a-form-item>
                                <a-form-item>
                                    <a-button type="primary" html-type="submit" :loading="submitting">
                                        发表评论
                                    </a-button>
                                </a-form-item>
                            </a-form>
                        </div>

                        <a-alert v-else type="info" show-icon class="login-alert" message="请先登录后评论"
                            description="登录后即可参与讨论和分享你的想法。">
                            <template #action>
                                <router-link to="/login">
                                    <a-button size="small" type="primary">
                                        立即登录
                                    </a-button>
                                </router-link>
                            </template>
                        </a-alert>

                        <a-list class="comment-list" item-layout="horizontal" :data-source="material.comments || []"
                            :loading="commentsLoading">
                            <template #header>
                                <div class="comment-header">
                                    {{ material.comments?.length || 0 }} 条评论
                                </div>
                            </template>

                            <template #renderItem="{ item }">
                                <a-list-item>
                                    <!-- 处理评论头像 -->
                                    <a-comment :author="item.user.username" :avatar="processAvatarUrl(item.user.avatar)"
                                        :content="item.content" :datetime="formatDate(item.createdAt)">
                                        <template #actions>
                                            <span @click="replyTo(item)">回复</span>
                                        </template>

                                        <template v-if="item.replies && item.replies.length">
                                            <a-list class="comment-replies" :data-source="item.replies">
                                                <template #renderItem="{ item: reply }">
                                                    <!-- 处理回复头像 -->
                                                    <a-comment :author="reply.user.username" 
                                                              :avatar="processAvatarUrl(reply.user.avatar)"
                                                              :content="reply.content"
                                                              :datetime="formatDate(reply.createdAt)" />
                                                </template>
                                            </a-list>
                                        </template>
                                    </a-comment>
                                </a-list-item>
                            </template>

                            <template #empty>
                                <div class="empty-comments">暂无评论，快来发表第一条评论吧！</div>
                            </template>
                        </a-list>
                    </div>
                </template>

                <a-result v-else-if="!loading" status="404" title="素材不存在" sub-title="您查看的素材可能已被删除或移动到其他位置">
                    <template #extra>
                        <router-link to="/">
                            <a-button type="primary">返回首页</a-button>
                        </router-link>
                    </template>
                </a-result>
            </a-spin>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
    HeartOutlined,
    HeartFilled,
    EyeOutlined,
    ClockCircleOutlined,
    ShareAltOutlined,
    DownloadOutlined
} from '@ant-design/icons-vue';
import { useMaterialStore } from '@/stores/material';
import { useUserStore } from '@/stores/user';
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();
const materialStore = useMaterialStore();
const userStore = useUserStore();

// DOM引用
const mainImageRef = ref(null);

// 状态
const loading = ref(true);
const commentsLoading = ref(false);
const submitting = ref(false);
const material = ref(null);

// 评论表单
const commentForm = reactive({
    content: ''
});

// 默认图片和头像
const defaultImage = '/images/default-image.png';
const defaultAvatar = '/images/default-avatar.png';

// 计算属性
const isLoggedIn = computed(() => userStore.isLoggedIn);

// 初始化
onMounted(async () => {
    const materialId = route.params.id;
    if (!materialId) {
        router.push('/404');
        return;
    }

    try {
        loading.value = true;
        const data = await materialStore.fetchMaterialById(materialId);
        if (data) {
            material.value = data;
        }
    } catch (error) {
        console.error('Error fetching material:', error);
        message.error('获取素材详情失败');
    } finally {
        loading.value = false;
    }
});

// 处理素材图片URL
function processImageUrl(url) {
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
}

// 处理头像URL
function processAvatarUrl(url) {
    if (!url) return defaultAvatar;
    
    // 如果是完整URL，直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    
    // 如果已经包含 /uploads/avatars 前缀，则直接使用
    if (url.startsWith('/uploads/avatars/')) {
        return url;
    }
    
    // 如果已经包含 /uploads 前缀，但不是avatars子目录
    if (url.startsWith('/uploads/')) {
        // 获取文件名并添加到avatars子目录
        const fileName = url.split('/').pop();
        return `/uploads/avatars/${fileName}`;
    }
    
    // 否则，加上 /uploads/avatars/ 前缀
    return url.startsWith('/') ? `/uploads/avatars${url}` : `/uploads/avatars/${url}`;
}

// 图片错误处理
function handleImageError() {
    if (mainImageRef.value) {
        mainImageRef.value.src = defaultImage;
    }
}

// 头像错误处理
function handleAvatarError(e) {
    e.target.src = defaultAvatar;
}

// 格式化日期
function formatDate(date) {
    if (!date) return '';
    return dayjs(date).format('YYYY-MM-DD HH:mm');
}

async function handleFavorite() {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录后再收藏');
    router.push('/login');
    return;
  }

  try {
    const result = await materialStore.toggleFavorite(material.value.id);

    if (result.success) {
      material.value.isFavorite = result.isFavorite;

      if (material.value.isFavorite) {
        material.value.favorites = (material.value.favorites || 0) + 1;
        message.success('收藏成功');
      } else {
        material.value.favorites = Math.max((material.value.favorites || 0) - 1, 0);
        message.success('已取消收藏');
      }
    } else {
      message.error(result.message || '操作失败');
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    message.error('操作失败，请重试');
  }
}

// 下载素材
function handleDownload() {
    if (!userStore.isLoggedIn) {
        message.warning('请先登录后再下载');
        router.push('/login');
        return;
    }

    // 获取处理后的图片URL
    const imageUrl = processImageUrl(material.value.imageUrl);
    
    message.success('开始下载素材，请稍候...');

    // 模拟下载延迟
    setTimeout(() => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = material.value.title || 'material';
        link.click();
    }, 1000);
}

// 提交评论
async function submitComment() {
    if (!commentForm.content.trim()) {
        message.warning('请输入评论内容');
        return;
    }

    submitting.value = true;

    try {
        // 模拟评论提交
        // 实际应用中应该调用后端API
        const response = await new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    comment: {
                        id: Date.now(),
                        content: commentForm.content,
                        createdAt: new Date().toISOString(),
                        user: {
                            username: userStore.username,
                            avatar: userStore.avatar || defaultAvatar
                        }
                    }
                });
            }, 1000);
        });

        if (response.success) {
            if (!material.value.comments) {
                material.value.comments = [];
            }

            material.value.comments.unshift(response.comment);
            commentForm.content = '';
            message.success('评论发表成功');
        }
    } catch (error) {
        message.error('评论发表失败，请重试');
    } finally {
        submitting.value = false;
    }
}

// 回复评论
function replyTo(comment) {
    // 确保用户已登录
    if (!isLoggedIn.value) {
        message.warning('请先登录后再回复');
        return;
    }
    
    // 滚动到评论表单
    const commentFormElement = document.querySelector('.comment-form');
    if (commentFormElement) {
        commentFormElement.scrollIntoView({ behavior: 'smooth' });
    }

    // 设置回复内容
    commentForm.content = `回复 @${comment.user.username}: `;
}
</script>

<style scoped>
.material-detail-view {
    padding: 24px 0 60px;
}

.breadcrumb {
    margin-bottom: 24px;
}

.material-content {
    margin-bottom: 40px;
}

.material-main {
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.material-image-container {
    width: 100%;
    text-align: center;
    background-color: #f5f5f5;
}

.material-main-image {
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
}

.material-tags {
    padding: 16px 24px 0;
}

.material-detail-box {
    padding: 16px 24px 24px;
}

.material-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 16px;
}

.material-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    color: var(--text-color-secondary);
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.material-description,
.material-specs {
    margin-top: 24px;
}

.material-description h3,
.material-specs h3 {
    font-size: 18px;
    margin-bottom: 16px;
}

.material-sidebar {
    position: sticky;
    top: 80px;
}

.material-actions {
    background-color: #fff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.action-btn {
    margin-top: 16px;
}

.uploader-box {
    background-color: #fff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.uploader-info {
    display: flex;
    gap: 16px;
    margin-top: 16px;
}

.uploader-details h4 {
    font-size: 16px;
    margin: 0 0 8px;
}

.uploader-details p {
    color: var(--text-color-secondary);
    margin-bottom: 12px;
    font-size: 14px;
}

.comments-section {
    margin-top: 40px;
}

.comment-form {
    margin: 24px 0;
}

.login-alert {
    margin-bottom: 24px;
}

.comment-header {
    font-weight: 500;
}

.comment-list {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    padding: 0 24px;
}

.comment-replies {
    margin-top: 16px;
    margin-left: 44px;
}

.empty-comments {
    text-align: center;
    padding: 40px 0;
    color: var(--text-color-secondary);
}

@media (max-width: 768px) {
    .material-sidebar {
        margin-top: 24px;
        position: static;
    }
}
</style>