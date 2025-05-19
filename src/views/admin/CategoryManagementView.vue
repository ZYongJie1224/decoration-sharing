<template>
  <div class="category-management-view">
    <a-card class="table-card">
      <template #title>
        <span>分类管理</span>
      </template>
      
      <template #extra>
        <a-button type="primary" @click="showAddModal">
          <plus-outlined /> 添加分类
        </a-button>
      </template>
      
      <a-table
        :columns="columns"
        :data-source="categories"
        :pagination="pagination"
        :loading="loading"
        :rowKey="record => record.id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 图标列 -->
          <template v-if="column.key === 'icon'">
            <a-avatar
              :src="record.iconUrl"
              :style="{ backgroundColor: record.color || '#1890ff' }"
            >
              {{ record.name.charAt(0) }}
            </a-avatar>
          </template>
          
          <!-- 素材数量列 -->
          <template v-else-if="column.key === 'materialCount'">
            <a-tag color="blue">{{ record.materialCount }} 个素材</a-tag>
          </template>
          
          <!-- 排序列 -->
          <template v-else-if="column.key === 'sort'">
            <a-input-number
              :value="record.sort"
              :min="0"
              :max="100"
              size="small"
              @change="(value) => handleSortChange(record, value)"
            />
          </template>
          
          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button
                type="primary"
                size="small"
                @click="editCategory(record)"
              >
                编辑
              </a-button>
              
              <a-popconfirm
                title="确定要删除这个分类吗?"
                ok-text="是"
                cancel-text="否"
                @confirm="deleteCategory(record)"
              >
                <a-button
                  type="danger"
                  size="small"
                  :disabled="record.materialCount > 0"
                >
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    
    <!-- 添加/编辑分类模态框 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑分类' : '添加分类'"
      :confirmLoading="submitLoading"
      @ok="handleSubmit"
    >
      <a-form
        :model="formState"
        :rules="rules"
        ref="formRef"
        layout="vertical"
      >
        <a-form-item label="分类名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入分类名称" />
        </a-form-item>
        
        <a-form-item label="分类描述" name="description">
          <a-textarea
            v-model:value="formState.description"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </a-form-item>
        
        <a-form-item label="分类图标" name="iconUrl">
          <a-input v-model:value="formState.iconUrl" placeholder="请输入图标URL" />
          <div class="preview-icon">
            <a-avatar
              :src="formState.iconUrl"
              :style="{ backgroundColor: formState.color || '#1890ff' }"
              size="large"
            >
              {{ formState.name ? formState.name.charAt(0) : '新' }}
            </a-avatar>
          </div>
        </a-form-item>
        
        <a-form-item label="分类颜色" name="color">
          <a-input 
            v-model:value="formState.color" 
            placeholder="#1890ff"
            allow-clear 
          >
            <template #prefix>
              <div 
                class="color-preview" 
                :style="{ backgroundColor: formState.color || '#1890ff' }"
              ></div>
            </template>
          </a-input>
        </a-form-item>
        
        <a-form-item label="排序权重" name="sort">
          <a-input-number
            v-model:value="formState.sort"
            :min="0"
            :max="100"
            style="width: 100%"
          />
          <div class="form-help">数值越大排序越靠前，默认为0</div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { useMaterialStore } from '@/stores/material';

const materialStore = useMaterialStore();

// 表格列定义
const columns = [
  {
    title: '图标',
    key: 'icon',
    width: 80
  },
  {
    title: '分类名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: '素材数量',
    key: 'materialCount',
    width: 150
  },
  {
    title: '排序',
    key: 'sort',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
    sorter: true
  },
  {
    title: '操作',
    key: 'action',
    width: 150
  }
];

// 状态
const loading = ref(false);
const categories = ref([]);
const formRef = ref(null);
const modalVisible = ref(false);
const submitLoading = ref(false);
const isEdit = ref(false);

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true
});

// 表单状态
const formState = reactive({
  id: null,
  name: '',
  description: '',
  iconUrl: '',
  color: '#1890ff',
  sort: 0
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { max: 20, message: '分类名称不能超过20个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
};

// 初始化
onMounted(async () => {
  fetchCategories();
});

// 获取分类列表
async function fetchCategories() {
  loading.value = true;
  
  try {
    // 实际应用中应该调用管理员API获取完整分类信息
    // 这里模拟数据
    setTimeout(() => {
      categories.value = [
        {
          id: 1,
          name: '客厅',
          description: '客厅装修灵感和设计素材',
          iconUrl: 'https://joeschmoe.io/api/v1/1',
          color: '#1890ff',
          materialCount: 320,
          sort: 10,
          createdAt: '2025-01-10 14:30:00'
        },
        {
          id: 2,
          name: '卧室',
          description: '卧室装修灵感和设计素材',
          iconUrl: 'https://joeschmoe.io/api/v1/2',
          color: '#52c41a',
          materialCount: 240,
          sort: 9,
          createdAt: '2025-01-12 10:15:00'
        },
        {
          id: 3,
          name: '厨房',
          description: '厨房装修灵感和设计素材',
          iconUrl: 'https://joeschmoe.io/api/v1/3',
          color: '#faad14',
          materialCount: 180,
          sort: 8,
          createdAt: '2025-01-15 16:45:00'
        },
        {
          id: 4,
          name: '卫生间',
          description: '卫生间装修灵感和设计素材',
          iconUrl: 'https://joeschmoe.io/api/v1/4',
          color: '#eb2f96',
          materialCount: 150,
          sort: 7,
          createdAt: '2025-01-18 09:30:00'
        },
        {
          id: 5,
          name: '书房',
          description: '书房装修灵感和设计素材',
          iconUrl: 'https://joeschmoe.io/api/v1/5',
          color: '#722ed1',
          materialCount: 120,
          sort: 6,
          createdAt: '2025-01-20 11:20:00'
        },
        {
          id: 6,
          name: '阳台',
          description: '阳台装修灵感和设计素材',
          iconUrl: 'https://joeschmoe.io/api/v1/6',
          color: '#13c2c2',
          materialCount: 100,
          sort: 5,
          createdAt: '2025-01-22 14:10:00'
        },
        {
          id: 7,
          name: '其他',
          description: '其他装修灵感和设计素材',
          iconUrl: 'https://joeschmoe.io/api/v1/7',
          color: '#fa8c16',
          materialCount: 80,
          sort: 0,
          createdAt: '2025-01-25 16:30:00'
        }
      ];
      
      pagination.total = categories.value.length;
      loading.value = false;
    }, 500);
  } catch (error) {
    message.error('获取分类列表失败');
    loading.value = false;
  }
}

// 处理表格变化
function handleTableChange(pag, filters, sorter) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  
  // 处理排序
  if (sorter.field && sorter.order) {
    const order = sorter.order === 'ascend' ? 'asc' : 'desc';
    // 在实际应用中调用API进行排序
  }
}

// 处理排序权重变化
function handleSortChange(record, value) {
  // 在实际应用中应该调用API更新排序权重
  const index = categories.value.findIndex(item => item.id === record.id);
  if (index !== -1) {
    categories.value[index].sort = value;
    message.success('排序已更新');
  }
}

// 显示添加模态框
function showAddModal() {
  isEdit.value = false;
  resetForm();
  modalVisible.value = true;
}

// 编辑分类
function editCategory(record) {
  isEdit.value = true;
  
  // 填充表单
  formState.id = record.id;
  formState.name = record.name;
  formState.description = record.description || '';
  formState.iconUrl = record.iconUrl || '';
  formState.color = record.color || '#1890ff';
  formState.sort = record.sort || 0;
  
  modalVisible.value = true;
}

// 重置表单
function resetForm() {
  formState.id = null;
  formState.name = '';
  formState.description = '';
  formState.iconUrl = '';
  formState.color = '#1890ff';
  formState.sort = 0;
  
  if (formRef.value) {
    formRef.value.resetFields();
  }
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value.validate();
    
    submitLoading.value = true;
    
    // 构建提交数据
    const categoryData = {
      name: formState.name,
      description: formState.description,
      iconUrl: formState.iconUrl,
      color: formState.color,
      sort: formState.sort
    };
    
    if (isEdit.value) {
      // 编辑现有分类
      // 在实际应用中调用API更新分类
      const index = categories.value.findIndex(item => item.id === formState.id);
      if (index !== -1) {
        categories.value[index] = {
          ...categories.value[index],
          ...categoryData
        };
        message.success('分类更新成功');
      }
    } else {
      // 添加新分类
      // 在实际应用中调用API创建分类
      const newCategory = {
        id: Date.now(),
        ...categoryData,
        materialCount: 0,
        createdAt: '2025-05-16 11:58:17' // 使用用户提供的当前日期
      };
      
      categories.value.unshift(newCategory);
      pagination.total += 1;
      message.success('分类添加成功');
    }
    
    // 关闭模态框
    modalVisible.value = false;
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    submitLoading.value = false;
  }
}

// 删除分类
async function deleteCategory(record) {
  if (record.materialCount > 0) {
    message.warning('该分类下有素材，无法删除');
    return;
  }
  
  try {
    // 在实际应用中调用API删除分类
    categories.value = categories.value.filter(item => item.id !== record.id);
    pagination.total -= 1;
    message.success('分类删除成功');
  } catch (error) {
    message.error('删除分类失败');
  }
}
</script>

<style scoped>
.category-management-view {
  padding: 0;
}

.table-card {
  margin-bottom: 24px;
}

.preview-icon {
  margin-top: 8px;
  text-align: center;
}

.color-preview {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  margin-right: 8px;
}

.form-help {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 4px;
}
</style>