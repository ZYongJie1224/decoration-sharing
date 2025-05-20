<template>
  <div class="login-view">
    <div class="auth-container">
      <div class="auth-box">
        <div class="auth-header">
          <h2>用户登录</h2>
          <p>登录后即可收藏、上传素材</p>
        </div>
        
        <a-form
          :model="formState"
          :rules="rules"
          @finish="handleSubmit"
          layout="vertical"
          class="login-form"
        >
          <a-form-item name="username" label="用户名">
            <a-input
              v-model:value="formState.username"
              placeholder="请输入用户名"
              size="large"
            >
              <template #prefix>
                <user-outlined />
              </template>
            </a-input>
          </a-form-item>
          
          <a-form-item name="password" label="密码">
            <a-input-password
              v-model:value="formState.password"
              placeholder="请输入密码"
              size="large"
            >
              <template #prefix>
                <lock-outlined />
              </template>
            </a-input-password>
          </a-form-item>
          
          <a-form-item>
            <div class="form-row">
              <a-checkbox v-model:checked="formState.remember">记住我</a-checkbox>
              <a class="login-form-forgot">忘记密码?</a>
            </div>
          </a-form-item>
          
          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="userStore.loading"
            >
              登录
            </a-button>
          </a-form-item>
          
          <div class="form-footer">
            还没有账号? <router-link to="/register">立即注册</router-link>
          </div>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 表单状态
const formState = reactive({
  username: '',
  password: '',
  remember: false
});

// 表单验证规则 (保持不变)
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ]
};

// 页面加载时检查是否已登录
onMounted(() => {
  if (userStore.isLoggedIn) {
    router.push('/');
  }
});

// 提交表单 - 增加显式获取用户资料的步骤
async function handleSubmit() {
  try {
    const result = await userStore.login({
      username: formState.username,
      password: formState.password
    });
    
    if (result.success) {
      // 登录成功后明确获取用户信息，包括头像
      await userStore.fetchUserInfo();
      message.success('登录成功');
      
      // 如果存在重定向，则跳转到相应页面
      const redirect = route.query.redirect || '/';
      router.push(redirect);
    } else {
      message.error(result.message || '登录失败，请检查用户名和密码');
    }
  } catch (error) {
    message.error('登录时出现错误，请稍后再试');
    console.error('Login error:', error);
  }
}
</script>

<style scoped>
.login-view {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 24px;
}

.auth-box {
  background-color: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-header h2 {
  font-size: 24px;
  margin-bottom: 8px;
}

.auth-header p {
  color: var(--text-color-secondary);
}

.login-form {
  max-width: 100%;
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-form-forgot {
  color: var(--primary-color);
  cursor: pointer;
}

.form-footer {
  text-align: center;
  margin-top: 24px;
}
</style>