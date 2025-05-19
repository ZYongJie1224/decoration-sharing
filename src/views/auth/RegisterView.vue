<template>
  <div class="register-view">
    <div class="auth-container">
      <div class="auth-box">
        <div class="auth-header">
          <h2>用户注册</h2>
          <p>注册成为会员，享受更多服务</p>
        </div>
        
        <a-form
          :model="formState"
          :rules="rules"
          @finish="handleSubmit"
          layout="vertical"
          class="register-form"
        >
          <a-form-item name="username" label="用户名">
            <a-input
              v-model:value="formState.username"
              placeholder="请设置用户名"
              size="large"
            >
              <template #prefix>
                <user-outlined />
              </template>
            </a-input>
          </a-form-item>
          
          <a-form-item name="email" label="邮箱">
            <a-input
              v-model:value="formState.email"
              placeholder="请输入邮箱地址"
              size="large"
            >
              <template #prefix>
                <mail-outlined />
              </template>
            </a-input>
          </a-form-item>
          
          <a-form-item name="password" label="密码">
            <a-input-password
              v-model:value="formState.password"
              placeholder="请设置密码"
              size="large"
            >
              <template #prefix>
                <lock-outlined />
              </template>
            </a-input-password>
          </a-form-item>
          
          <a-form-item name="confirmPassword" label="确认密码">
            <a-input-password
              v-model:value="formState.confirmPassword"
              placeholder="请再次输入密码"
              size="large"
            >
              <template #prefix>
                <lock-outlined />
              </template>
            </a-input-password>
          </a-form-item>
          
          <a-form-item name="agreement">
            <a-checkbox v-model:checked="formState.agreement">
              我已阅读并同意<a href="#" @click.prevent="showAgreement">《用户协议》</a>和<a href="#" @click.prevent="showPrivacy">《隐私政策》</a>
            </a-checkbox>
          </a-form-item>
          
          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="userStore.loading"
            >
              注册
            </a-button>
          </a-form-item>
          
          <div class="form-footer">
            已有账号? <router-link to="/login">立即登录</router-link>
          </div>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

// 表单状态
const formState = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value === formState.password) {
          return Promise.resolve();
        }
        return Promise.reject('两次输入的密码不一致');
      },
      trigger: 'blur'
    }
  ],
  agreement: [
    {
      validator: (rule, value) => {
        if (value === true) {
          return Promise.resolve();
        }
        return Promise.reject('请阅读并同意用户协议和隐私政策');
      },
      trigger: 'change'
    }
  ]
};

// 提交表单
async function handleSubmit() {
  try {
    const result = await userStore.register({
      username: formState.username,
      email: formState.email,
      password: formState.password
    });
    
    if (result.success) {
      message.success('注册成功');
      router.push('/');
    } else {
      message.error(result.message || '注册失败，请稍后再试');
    }
  } catch (error) {
    message.error('注册时出现错误，请稍后再试');
    console.error('Register error:', error);
  }
}

// 显示用户协议
function showAgreement() {
  Modal.info({
    title: '用户协议',
    content: `
      <div style="height: 400px; overflow-y: auto;">
        <h3>装修素材分享网站用户协议</h3>
        <p>
          欢迎您使用装修素材分享网站服务！<br /><br />
          
          为使用本网站服务，您应当阅读并遵守本《用户协议》。请您务必审慎阅读、充分理解各条款内容。<br /><br />
          
          第一条：服务内容<br />
          本网站为用户提供素材分享、收藏、下载等服务。<br /><br />
          
          第二条：账号注册<br />
          您在注册时应当按照提示提供真实资料，保证提供的注册资料真实、准确、完整、及时。<br /><br />
          
          第三条：用户行为规范<br />
          用户在使用本网站服务时，必须遵守国家有关法律法规，不得利用本服务从事违法违规行为。<br /><br />
          
          第四条：内容规范<br />
          用户上传的素材内容必须符合法律法规，不得侵犯他人知识产权。<br /><br />
          
          第五条：服务变更、中断或终止<br />
          本网站有权在必要时变更、中断或终止服务。<br /><br />
          
          第六条：知识产权<br />
          本网站所提供的服务中包含的任何文本、图形、标识等，其版权均归本网站所有。<br /><br />
          
          第七条：免责声明<br />
          用户明确同意其使用本网站服务所存在的风险将完全由其自己承担。<br /><br />
          
          第八条：用户隐私<br />
          本网站尊重用户隐私权，保护用户个人信息。<br /><br />
          
          第九条：协议修改<br />
          本网站有权随时修改本协议，修改后的协议将通过网站公告的形式向用户发布。<br /><br />
          
          第十条：适用法律和管辖权<br />
          本协议的订立、执行和解释及争议的解决均适用中华人民共和国法律。<br /><br />
        </p>
      </div>
    `,
    width: 700
  });
}

// 显示隐私政策
function showPrivacy() {
  Modal.info({
    title: '隐私政策',
    content: `
      <div style="height: 400px; overflow-y: auto;">
        <h3>装修素材分享网站隐私政策</h3>
        <p>
          我们非常重视您的隐私，本隐私政策说明我们如何收集、使用、披露、处理和保护您的个人信息。<br /><br />
          
          一、我们收集的信息<br />
          1. 您提供的信息：注册账号时提供的用户名、邮箱、密码等信息。<br />
          2. 使用服务时产生的信息：您上传的素材、收藏记录、浏览历史等。<br /><br />
          
          二、我们如何使用这些信息<br />
          1. 提供、维护和改进我们的服务。<br />
          2. 向您发送服务通知和更新。<br />
          3. 防止欺诈和滥用行为。<br /><br />
          
          三、信息共享<br />
          除非获得您的明确同意，我们不会与第三方共享您的个人信息。<br /><br />
          
          四、信息安全<br />
          我们采取合理的安全措施保护您的个人信息。<br /><br />
          
          五、您的权利<br />
          您有权访问、更正或删除您的个人信息。<br /><br />
          
          六、Cookie技术<br />
          我们使用Cookie和类似技术来提供和支持我们的服务。<br /><br />
          
          七、政策更新<br />
          我们可能会不时更新本隐私政策，更新后的政策将在网站上公布。<br /><br />
          
          八、联系我们<br />
          如果您对本隐私政策有任何疑问，请通过联系我们的客服团队。<br /><br />
        </p>
      </div>
    `,
    width: 700
  });
}
</script>

<style scoped>
.register-view {
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

.register-form {
  max-width: 100%;
}

.form-footer {
  text-align: center;
  margin-top: 24px;
}
</style>