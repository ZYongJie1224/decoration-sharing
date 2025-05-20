<template>
    <a-layout-header class="header">
        <div class="header-content">
            <div class="logo-container">
                <router-link to="/">
                    <img src="@/assets/logo.png" alt="装修素材分享" class="logo" />
                    <span class="logo-text">装修素材分享</span>
                </router-link>
            </div>

            <div class="search-container">
                <a-input-search v-model:value="searchKeyword" placeholder="搜索素材..." enter-button class="search-input"
                    @search="handleSearch" />
            </div>

            <div class="menu-container">
                <a-menu v-model:selectedKeys="selectedKeys" mode="horizontal" class="main-menu">
                    <a-menu-item key="home">
                        <router-link to="/">首页</router-link>
                    </a-menu-item>

                    <a-sub-menu key="categories" title="分类">
                        <a-menu-item v-for="category in categoryStore.categories" :key="`cat-${category.id}`">
                            <router-link :to="`/category/${category.id}`">{{ category.name }}</router-link>
                        </a-menu-item>
                    </a-sub-menu>

                    <a-menu-item key="upload" v-if="isLoggedIn">
                        <router-link to="/upload">
                            <cloud-upload-outlined /> 上传素材
                        </router-link>
                    </a-menu-item>
                </a-menu>
            </div>

            <div class="user-container">
                <template v-if="isLoggedIn">
                    <a-dropdown>
                        <a class="user-dropdown-link" @click.prevent>
                            <a-avatar :src="processedAvatar" />
                            <span class="username">{{ username }}</span>
                            <down-outlined />
                        </a>
                        <template #overlay>
                            <a-menu>
                                <a-menu-item key="profile">
                                    <router-link to="/profile">
                                        <user-outlined /> 个人中心
                                    </router-link>
                                </a-menu-item>
                                <a-menu-item key="favorites">
                                    <router-link to="/favorites">
                                        <heart-outlined /> 我的收藏
                                    </router-link>
                                </a-menu-item>
                                <a-menu-item key="my-uploads">
                                    <router-link to="/my-uploads">
                                        <picture-outlined /> 我的上传
                                    </router-link>
                                </a-menu-item>
                                <a-menu-divider />
                                <a-menu-item v-if="isAdmin" key="admin">
                                    <router-link to="/admin">
                                        <crown-outlined /> 管理后台
                                    </router-link>
                                </a-menu-item>
                                <a-menu-item key="logout" @click="handleLogout">
                                    <logout-outlined /> 退出登录
                                </a-menu-item>
                            </a-menu>
                        </template>
                    </a-dropdown>
                </template>

                <template v-else>
                    <a-space>
                        <router-link to="/login">
                            <a-button type="primary">登录</a-button>
                        </router-link>
                        <router-link to="/register">
                            <a-button>注册</a-button>
                        </router-link>
                    </a-space>
                </template>
            </div>
        </div>
    </a-layout-header>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
    UserOutlined,
    DownOutlined,
    HeartOutlined,
    CrownOutlined,
    LogoutOutlined,
    CloudUploadOutlined,
    PictureOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { useMaterialStore } from '@/stores/material'
import { useCategoryStore } from '@/stores/category'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const materialStore = useMaterialStore()
const categoryStore = useCategoryStore()

const searchKeyword = ref('')
const selectedKeys = ref(['home'])
const defaultAvatar = '/images/default-avatar.png'

// 计算属性
const isLoggedIn = computed(() => userStore.isLoggedIn)
const isAdmin = computed(() => userStore.isAdmin)
const username = computed(() => userStore.username)

// 处理头像路径 - 添加错误处理和日志
const processedAvatar = computed(() => {
    const avatarUrl = userStore.avatar;
    console.log('原始头像URL:', avatarUrl);
    
    if (!avatarUrl) {
        console.log('头像URL为空，使用默认头像');
        return defaultAvatar;
    }
    
    // 如果是完整URL，直接返回
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
        console.log('使用完整URL头像:', avatarUrl);
        return avatarUrl;
    }
    
    // 如果已经包含 /uploads/avatars 前缀，则直接使用
    if (avatarUrl.startsWith('/uploads/')) {
        console.log('使用已包含前缀的头像路径:', avatarUrl);
        return avatarUrl;
    }
    
    // 如果已经包含 /uploads 前缀，但不是avatars子目录
    if (avatarUrl.startsWith('/uploads/')) {
        // 获取文件名并添加到avatars子目录
        const fileName = avatarUrl.split('/').pop();
        const result = `/uploads/${fileName}`;
        console.log('从uploads提取文件名后的头像路径:', result);
        return result;
    }
    
    // 否则，加上 /uploads/avatars/ 前缀
    const result = avatarUrl.startsWith('/') ? 
        `/uploads${avatarUrl}` : 
        `/uploads/${avatarUrl}`;
    
    console.log('添加前缀后的头像路径:', result);
    return result;
})

// 添加头像错误处理
function handleAvatarError(e) {
    console.log('头像加载失败，使用默认头像');
    e.target.src = defaultAvatar;
}
// 获取分类列表 - 使用categoryStore替代API调用
onMounted(async () => {
    await categoryStore.fetchCategories()
})

// 根据路由更新选中的菜单项
watch(
    () => route.path,
    (path) => {
        if (path === '/') {
            selectedKeys.value = ['home']
        } else if (path.startsWith('/category/')) {
            const categoryId = route.params.id
            selectedKeys.value = [`cat-${categoryId}`]
        } else if (path === '/upload') {
            selectedKeys.value = ['upload']
        } else {
            selectedKeys.value = []
        }
    },
    { immediate: true }
)

// 处理搜索
function handleSearch() {
    if (!searchKeyword.value.trim()) {
        message.warning('请输入搜索关键词')
        return
    }

    router.push({
        path: '/search',
        query: { keyword: searchKeyword.value }
    })
}

// 处理退出登录
function handleLogout() {
    userStore.logout()
    message.success('已成功退出登录')
    router.push('/')
}
</script>

<style scoped>
.header {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
    padding: 0;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    line-height: 64px;
}

.header-content {
    display: flex;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
}

.logo-container {
    margin-right: 24px;
}

.logo-container a {
    display: flex;
    align-items: center;
    color: var(--primary-color);
    text-decoration: none;
}

.logo {
    height: 32px;
    margin-right: 8px;
}

.logo-text {
    font-size: 18px;
    font-weight: 600;
}

.search-container {
    flex: 1;
    max-width: 400px;
    margin-right: 24px;
}

.search-input {
    width: 100%;
}

.menu-container {
    flex: 1;
}

.main-menu {
    border-bottom: none;
    justify-content: center;
}

.user-container {
    margin-left: 24px;
}

.user-dropdown-link {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: var(--text-color);
}

.username {
    margin: 0 8px;
}
</style>