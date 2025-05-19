<template>
  <div class="upload-material">
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
      @finish="handleSubmit"
    >
      <a-form-item name="title" label="素材标题">
        <a-input 
          v-model:value="formState.title" 
          placeholder="请输入素材标题"
          :maxLength="100"
          showCount
        />
      </a-form-item>
      
      <a-form-item name="description" label="素材描述">
        <a-textarea 
          v-model:value="formState.description" 
          placeholder="请描述您的素材"
          :rows="4"
          :maxLength="1000"
          showCount
        />
      </a-form-item>
      
      <a-form-item name="categoryId" label="所属分类">
        <a-select
          v-model:value="formState.categoryId"
          placeholder="请选择分类"
          :loading="loadingCategories"
        >
          <a-select-option 
            v-for="category in categories" 
            :key="category.id" 
            :value="category.id"
          >
            {{ category.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      
      <a-form-item name="tags" label="标签">
        <a-select
          v-model:value="formState.tags"
          mode="tags"
          placeholder="输入标签后按回车添加"
          :token-separators="[',']"
        ></a-select>
      </a-form-item>
      
      <a-form-item name="license" label="许可协议">
        <a-radio-group v-model:value="formState.license">
          <a-radio value="own">原创内容</a-radio>
          <a-radio value="cc">知识共享协议</a-radio>
          <a-radio value="commercial">商业用途</a-radio>
        </a-radio-group>
      </a-form-item>
      
      <!-- 注意: 这里移除了name属性，我们将手动验证文件 -->
      <a-form-item label="上传图片">
        <a-upload-dragger
          v-model:fileList="fileList"
          name="file"
          :beforeUpload="beforeUpload"
          :multiple="false"
          :showUploadList="true"
          accept="image/*"
        >
          <p class="ant-upload-drag-icon">
            <inbox-outlined />
          </p>
          <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p class="ant-upload-hint">
            支持单个文件上传，文件格式: JPG, PNG
          </p>
        </a-upload-dragger>
        <div class="ant-form-item-explain ant-form-item-explain-error" v-if="fileError">
          {{ fileError }}
        </div>
      </a-form-item>
      
      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="uploading" block>
          {{ uploading ? '上传中...' : '提交' }}
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import { getCategories } from '@/api/category';
import { uploadMaterial } from '@/api/material';

const props = defineProps({
  onSuccess: {
    type: Function,
    default: () => {}
  }
});

const formRef = ref(null);

// 表单状态
const formState = reactive({
  title: '',
  description: '',
  categoryId: undefined,
  tags: [],
  license: 'own'
});

// 文件上传状态
const fileList = ref([]);
const fileError = ref('');
const uploading = ref(false);
const loadingCategories = ref(false);
const categories = ref([]);

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入素材标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度应在5-100个字符之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入素材描述', trigger: 'blur' },
    { min: 10, max: 1000, message: '描述长度应在10-1000个字符之间', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
};

// 获取分类列表
async function fetchCategories() {
  loadingCategories.value = true;
  try {
    const data = await getCategories();
    categories.value = data;
  } catch (error) {
    console.error('获取分类失败:', error);
    message.error('获取分类列表失败');
  } finally {
    loadingCategories.value = false;
  }
}

// 上传前验证
function beforeUpload(file) {
  // 清除之前的文件错误提示
  fileError.value = '';
  
  // 验证文件类型
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isImage) {
    message.error('只能上传JPG/PNG格式的图片!');
    fileError.value = '只能上传JPG/PNG格式的图片!';
    return false;
  }
  
  // 验证文件大小
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    message.error('图片大小不能超过10MB!');
    fileError.value = '图片大小不能超过10MB!';
    return false;
  }
  
  // 更新文件列表
  fileList.value = [file];
  return false; // 阻止自动上传
}

// 提交表单
async function handleSubmit() {
  // 手动验证文件
  if (fileList.value.length === 0) {
    fileError.value = '请上传素材图片';
    message.error('请上传素材图片');
    return;
  }
  
  // 创建FormData对象
  const formData = new FormData();
  
  // 获取原始文件对象
  const fileItem = fileList.value[0];
  // Ant Design Upload 组件会把文件封装在 originFileObj 属性中
  const rawFile = fileItem.originFileObj || fileItem;
  
  // 安全检查
  if (!(rawFile instanceof Blob)) {
    console.error('文件对象不是有效的Blob:', fileItem);
    message.error('文件对象无效，请重新上传');
    return;
  }
  
  // 添加文件到 FormData
  formData.append('file', rawFile);
  
  // 添加其他表单字段
  formData.append('title', formState.title);
  formData.append('description', formState.description);
  formData.append('categoryId', formState.categoryId);
  formData.append('license', formState.license);
  
  // 处理标签
  if (formState.tags && formState.tags.length > 0) {
    formState.tags.forEach(tag => {
      formData.append('tags', tag);
    });
  }
  
  // 开发调试：查看FormData内容
  console.log('FormData检查:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value instanceof Blob ? 'Blob/File 对象' : value}`);
  }
  
  uploading.value = true;
  
  try {
    const result = await uploadMaterial(formData);
    message.success('素材上传成功，等待审核');
    
    // 重置表单
    fileList.value = [];
    fileError.value = '';
    Object.assign(formState, {
      title: '',
      description: '',
      categoryId: undefined,
      tags: [],
      license: 'own'
    });
    
    // 调用成功回调
    props.onSuccess(result);
  } catch (error) {
    console.error('上传素材失败:', error);
    message.error('上传素材失败: ' + (error.response?.data?.message || '请稍后再试'));
  } finally {
    uploading.value = false;
  }
}

// 页面加载时获取分类列表
onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.upload-material {
  max-width: 600px;
  margin: 0 auto;
}

.ant-form-item-explain-error {
  color: #ff4d4f;
  font-size: 14px;
  line-height: 1.5;
  margin-top: 8px;
}
</style>