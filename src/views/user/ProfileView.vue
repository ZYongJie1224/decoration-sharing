<template>
  <div class="profile-view">
    <div class="page-container">
      <a-row :gutter="24">
        <a-col :xs="24" :md="8">
          <a-card class="profile-card">
            <div class="profile-header">
              <a-avatar :src="processAvatarUrl(userInfo.avatar)" :size="96" @error="handleAvatarError" />
              <h2>{{ userInfo.username }}</h2>
              <p>{{ userInfo.bio || '这个用户很懒，还没有写简介' }}</p>
            </div>
            
            <a-divider />
            
            <div class="profile-stats">
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.uploadCount || 0 }}</div>
                <div class="stat-label">素材上传</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.favoriteCount || 0 }}</div>
                <div class="stat-label">收藏素材</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.followersCount || 0 }}</div>
                <div class="stat-label">关注者</div>
              </div>
            </div>
            
            <a-divider />
            
            <div class="profile-actions">
              <a-button block @click="activeKey = 'uploads'">
                <folder-outlined /> 我的上传
              </a-button>
              <a-button block style="margin-top: 12px" @click="activeKey = 'favorites'">
                <heart-outlined /> 我的收藏
              </a-button>
              <a-button block style="margin-top: 12px" @click="activeKey = 'settings'">
                <setting-outlined /> 修改资料
              </a-button>
            </div>
            
            <a-divider />
            
            <div class="profile-info">
              <p><mail-outlined /> 邮箱: {{ userInfo.email }}</p>
              <p><calendar-outlined /> 注册时间: {{ formatDate(userInfo.createdAt) }}</p>
              <p>
                <crown-outlined /> 
                角色: 
                <a-tag :color="userInfo.role === 'ADMIN' ? 'red' : 'blue'">
                  {{ userInfo.role === 'ADMIN' ? '管理员' : '普通用户' }}
                </a-tag>
              </p>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :md="16">
          <a-card class="content-card">
            <a-tabs v-model:activeKey="activeKey">
              <a-tab-pane key="settings" tab="账号设置">
                <div class="settings-section">
                  <h3>个人资料</h3>
                  
                  <a-form
                    :model="profileForm"
                    layout="vertical"
                    @finish="updateProfile"
                  >
                    <a-form-item label="头像">
                      <div class="avatar-uploader">
                        <a-avatar :src="processAvatarUrl(profileForm.avatar)" :size="80" @error="handleFormAvatarError" />
                        <a-upload
                          name="file"
                          :show-upload-list="false"
                          action="/api/user/upload-avatar"
                          :headers="uploadHeaders"
                          :before-upload="beforeAvatarUpload"
                          @change="handleAvatarChange"
                        >
                          <a-button>更换头像</a-button>
                        </a-upload>
                      </div>
                    </a-form-item>
                    
                    <a-form-item label="用户名" name="username">
                      <a-input v-model:value="profileForm.username" />
                    </a-form-item>
                    
                    <a-form-item label="邮箱" name="email">
                      <a-input v-model:value="profileForm.email" disabled />
                    </a-form-item>
                    
                    <a-form-item label="个人简介" name="bio">
                      <a-textarea v-model:value="profileForm.bio" :rows="4" />
                    </a-form-item>
                    
                    <a-form-item>
                      <a-button type="primary" html-type="submit" :loading="profileSubmitting">
                        保存修改
                      </a-button>
                    </a-form-item>
                  </a-form>
                  
                  <a-divider />
                  
                  <h3>修改密码</h3>
                  
                  <a-form
                    :model="passwordForm"
                    layout="vertical"
                    @finish="updatePassword"
                  >
                    <a-form-item label="当前密码" name="currentPassword">
                      <a-input-password v-model:value="passwordForm.currentPassword" />
                    </a-form-item>
                    
                    <a-form-item label="新密码" name="newPassword">
                      <a-input-password v-model:value="passwordForm.newPassword" />
                    </a-form-item>
                    
                    <a-form-item label="确认新密码" name="confirmPassword">
                      <a-input-password v-model:value="passwordForm.confirmPassword" />
                    </a-form-item>
                    
                    <a-form-item>
                      <a-button type="primary" html-type="submit" :loading="passwordSubmitting">
                        修改密码
                      </a-button>
                    </a-form-item>
                  </a-form>
                </div>
              </a-tab-pane>
              
              <a-tab-pane key="uploads" tab="我的上传">
                <a-spin :spinning="materialsLoading">
                  <div v-if="userUploads.length" class="materials-grid">
                    <a-row :gutter="[16, 16]">
                      <a-col :xs="24" :sm="12" :md="8" v-for="material in userUploads" :key="material.id">
                        <material-card :material="material" />
                      </a-col>
                    </a-row>
                    
                    <div class="view-more">
                      <router-link to="/my-uploads">
                        <a-button type="primary">查看全部上传</a-button>
                      </router-link>
                    </div>
                  </div>
                  
                  <a-empty v-else description="您还没有上传素材">
                    <router-link to="/upload">
                      <a-button type="primary">立即上传</a-button>
                    </router-link>
                  </a-empty>
                </a-spin>
              </a-tab-pane>
              
              <a-tab-pane key="favorites" tab="我的收藏">
                <a-spin :spinning="materialsLoading">
                  <div v-if="userFavorites.length" class="materials-grid">
                    <a-row :gutter="[16, 16]">
                      <a-col :xs="24" :sm="12" :md="8" v-for="material in userFavorites" :key="material.id">
                        <material-card :material="material" />
                      </a-col>
                    </a-row>
                    
                    <div class="view-more">
                      <router-link to="/favorites">
                        <a-button type="primary">查看全部收藏</a-button>
                      </router-link>
                    </div>
                  </div>
                  
                  <a-empty v-else description="您还没有收藏素材">
                    <router-link to="/">
                      <a-button type="primary">浏览素材库</a-button>
                    </router-link>
                  </a-empty>
                </a-spin>
              </a-tab-pane>
            </a-tabs>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import axios from 'axios';
import { 
  FolderOutlined, 
  HeartOutlined, 
  SettingOutlined,
  MailOutlined,
  CalendarOutlined,
  CrownOutlined
} from '@ant-design/icons-vue';
import MaterialCard from '@/components/material/MaterialCard.vue';
import { useUserStore } from '@/stores/user';
import { useMaterialStore } from '@/stores/material';
import { formatDate } from '@/utils/date';

const userStore = useUserStore();
const materialStore = useMaterialStore();

// 默认头像
const defaultAvatar = '/images/default-avatar.png';

// 状态
const activeKey = ref('settings');
const profileSubmitting = ref(false);
const passwordSubmitting = ref(false);
const materialsLoading = ref(false);
const userUploads = ref([]);
const userFavorites = ref([]);

// 用户信息 - 从后端获取
const userInfo = ref({});

// 表单状态
const profileForm = reactive({
  username: '',
  email: '',
  avatar: '',
  bio: ''
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 上传头像的请求头，包含token
const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${userStore.token.value}`
  };
});

// 初始化
onMounted(async () => {
  await fetchUser();
  await fetchUserMaterials();
});

// 获取用户信息
async function fetchUser() {
  try {
    const userData = await userStore.fetchUserInfo();
    
    if (userData) {
      userInfo.value = userData;
      
      // 更新表单数据
      profileForm.username = userInfo.value.username || '';
      profileForm.email = userInfo.value.email || '';
      profileForm.avatar = userInfo.value.avatar || '';
      profileForm.bio = userInfo.value.bio || '';
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    message.error('获取用户信息失败');
  }
}

// 获取用户上传和收藏的素材
async function fetchUserMaterials() {
  materialsLoading.value = true;
  
  try {
    // 获取用户上传 - 页码从0开始
    const uploadsResult = await materialStore.getUserUploads({ 
      page: 0, 
      size: 6 
    });
    userUploads.value = uploadsResult.content || [];
    
    // 获取用户收藏 - 页码从0开始
    const favoritesResult = await materialStore.getUserFavorites({ 
      page: 0, 
      size: 6 
    });
    userFavorites.value = favoritesResult.content || [];
  } catch (error) {
    console.error('获取素材失败:', error);
    message.error('获取素材数据失败');
  } finally {
    materialsLoading.value = false;
  }
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

// 头像错误处理
function handleAvatarError(e) {
  e.target.src = defaultAvatar;
}

// 表单头像错误处理
function handleFormAvatarError(e) {
  e.target.src = defaultAvatar;
}

// 头像上传前验证
function beforeAvatarUpload(file) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('只能上传JPG/PNG格式的图片!');
    return false;
  }
  
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('图片大小不能超过2MB!');
    return false;
  }
  
  return true; // 允许上传
}

// 处理头像变化
function handleAvatarChange(info) {
  if (info.file.status === 'uploading') {
    return;
  }
  
  if (info.file.status === 'done') {
    // 获取上传后的头像URL
    const avatarPath = info.file.response.data || info.file.response.url;
    profileForm.avatar = avatarPath;
    message.success('头像上传成功');
  } else if (info.file.status === 'error') {
    message.error('头像上传失败: ' + (info.file.response?.message || '未知错误'));
  }
}

// 更新个人资料
async function updateProfile() {
  if (!profileForm.username.trim()) {
    message.warning('用户名不能为空');
    return;
  }
  
  profileSubmitting.value = true;
  
  try {
    const result = await userStore.updateProfile({
      username: profileForm.username,
      bio: profileForm.bio,
      avatar: profileForm.avatar
    });
    
    if (result.success) {
      // 更新本地状态
      userInfo.value = {...userInfo.value, ...result.user};
      message.success('个人资料更新成功');
    } else {
      message.error(result.message || '更新资料失败');
    }
  } catch (error) {
    console.error('更新个人资料失败:', error);
    message.error('更新失败: ' + error.message);
  } finally {
    profileSubmitting.value = false;
  }
}

// 更新密码
async function updatePassword() {
  // 验证密码输入
  if (!passwordForm.currentPassword) {
    message.warning('请输入当前密码');
    return;
  }
  
  if (!passwordForm.newPassword) {
    message.warning('请输入新密码');
    return;
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.warning('两次输入的新密码不一致');
    return;
  }
  
  passwordSubmitting.value = true;
  
  try {
    const result = await userStore.updatePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
    
    if (result.success) {
      message.success('密码修改成功');
      
      // 清空表单
      passwordForm.currentPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
    } else {
      message.error(result.message || '修改密码失败');
    }
  } catch (error) {
    console.error('密码修改失败:', error);
    message.error('密码修改失败: ' + error.message);
  } finally {
    passwordSubmitting.value = false;
  }
}
</script>

<style scoped>
.profile-view {
  padding: 40px 0 60px;
}

.profile-card {
  margin-bottom: 24px;
}

.profile-header {
  text-align: center;
  padding: 16px 0;
}

.profile-header h2 {
  margin: 16px 0 8px;
  font-size: 20px;
}

.profile-header p {
  color: var(--text-color-secondary);
  margin: 0;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  margin: 16px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 500;
  color: var(--primary-color);
}

.stat-label {
  font-size: 14px;
  color: var(--text-color-secondary);
}

.profile-actions {
  margin: 16px 0;
}

.profile-info {
  font-size: 14px;
}

.profile-info p {
  margin-bottom: 8px;
}

.profile-info p:last-child {
  margin-bottom: 0;
}

.content-card {
  min-height: 500px;
}

.settings-section {
  max-width: 500px;
}

.avatar-uploader {
  display: flex;
  align-items: center;
  gap: 16px;
}

.materials-grid {
  margin-top: 16px;
}

.view-more {
  margin-top: 24px;
  text-align: center;
}
</style>