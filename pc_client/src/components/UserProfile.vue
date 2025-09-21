<template>
  <a-modal
    v-model:open="modalVisible"
    title="个人中心"
    :width="600"
    :footer="null"
    class="user-profile-modal"
  >
    <div class="profile-content">
      <!-- 用户头像和基本信息区域 -->
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar-upload-container">
            <a-avatar :size="72" :src="authStore.avatar">
              {{ (authStore.userInfo?.nickName || authStore.userName).charAt(0) }}
            </a-avatar>
            <div class="avatar-overlay" @click="handleAvatarClick">
              <CameraOutlined class="camera-icon" />
              <span class="upload-text">上传头像</span>
            </div>
          </div>
          <!-- 隐藏的文件输入框 -->
          <input
            ref="avatarFileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleAvatarChange"
          />
        </div>
        <div class="user-basic-info">
          <h2>{{ authStore.userInfo?.nickName || authStore.userName }}</h2>
          <p class="user-email">{{ authStore.userInfo?.email || '未设置邮箱' }}</p>
          <div class="user-status">
            <a-tag :color="getStatusColor()">
              {{ getStatusText() }}
            </a-tag>
          </div>
        </div>
      </div>
      
      <!-- 用户详细信息表单区域 -->
      <a-divider orientation="left">
        <span class="section-title">基本信息</span>
      </a-divider>
      
      <div class="info-form-section">
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="form-item">
              <label class="form-label">用户昵称</label>
              <div class="form-value">
                {{ authStore.userInfo?.nickName || '-' }}
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="form-item">
              <label class="form-label">所属部门</label>
              <div class="form-value">
                {{ authStore.userInfo?.dept?.deptName || '-' }}
              </div>
            </div>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="form-item">
              <label class="form-label">手机号码</label>
              <div class="form-value">
                {{ authStore.userInfo?.phonenumber || '-' }}
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="form-item">
              <label class="form-label">邮箱地址</label>
              <div class="form-value">
                {{ authStore.userInfo?.email || '-' }}
              </div>
            </div>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="form-item">
              <label class="form-label">用户名称</label>
              <div class="form-value">
                {{ authStore.userInfo?.userName || '-' }}
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="form-item">
              <label class="form-label">用户性别</label>
              <div class="form-value">
                <a-tag :color="getSexColor()">
                  {{ getSexText() }}
                </a-tag>
              </div>
            </div>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="form-item">
              <label class="form-label">创建时间</label>
              <div class="form-value">
                {{ formatDate(authStore.userInfo?.createTime) }}
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="form-item">
              <label class="form-label">最后登录</label>
              <div class="form-value">
                {{ formatDate(authStore.userInfo?.loginDate) }}
              </div>
            </div>
          </a-col>
        </a-row>
        
        <!-- 备注信息 -->
        <a-row v-if="authStore.userInfo?.remark">
          <a-col :span="24">
            <div class="form-item">
              <label class="form-label">备注信息</label>
              <div class="form-value">
                {{ authStore.userInfo.remark }}
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
      
      <!-- 角色和权限信息 -->
      
      
      <!-- 操作按钮区域 -->
      <div class="action-section">
        <a-space>
          <a-button type="primary" @click="showEditProfileModal">
            <template #icon>
              <EditOutlined />
            </template>
            编辑资料
          </a-button>
          <a-button @click="showChangePasswordModal">
            <template #icon>
              <KeyOutlined />
            </template>
            修改密码
          </a-button>
         
          <a-button @click="modalVisible = false">
            返回
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>

  <!-- 编辑资料模态框 -->
  <a-modal
    v-model:open="editProfileVisible"
    title="编辑资料"
    :width="600"
    @ok="handleEditProfileSubmit"
    @cancel="editProfileVisible = false"
    :confirm-loading="editProfileLoading"
    okText="确定"
    cancelText="取消"
  >
    <a-form
      :model="editProfileForm"
      :rules="editProfileRules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
      ref="editProfileFormRef"
    >
      <a-form-item label="用户昵称" name="nickName">
        <a-input v-model:value="editProfileForm.nickName" placeholder="请输入用户昵称" />
      </a-form-item>
      <a-form-item label="邮箱地址" name="email">
        <a-input v-model:value="editProfileForm.email" placeholder="请输入邮箱地址" />
      </a-form-item>
      <a-form-item label="手机号码" name="phonenumber">
        <a-input v-model:value="editProfileForm.phonenumber" placeholder="请输入手机号码" />
      </a-form-item>
      <a-form-item label="用户性别" name="sex">
        <a-select v-model:value="editProfileForm.sex" placeholder="请选择性别">
          <a-select-option value="0">男</a-select-option>
          <a-select-option value="1">女</a-select-option>
          <a-select-option value="2">未知</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- 修改密码模态框 -->
  <a-modal
    v-model:open="changePasswordVisible"
    title="修改密码"
    :width="500"
    @ok="handleChangePasswordSubmit"
    @cancel="changePasswordVisible = false"
    :confirm-loading="changePasswordLoading"
    okText="确定"
    cancelText="取消"
  >
    <a-form
      :model="changePasswordForm"
      :rules="changePasswordRules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
      ref="changePasswordFormRef"
    >
      <a-form-item label="旧密码" name="oldPassword">
        <a-input-password v-model:value="changePasswordForm.oldPassword" placeholder="请输入旧密码" />
      </a-form-item>
      <a-form-item label="新密码" name="newPassword">
        <a-input-password v-model:value="changePasswordForm.newPassword" placeholder="请输入新密码" />
      </a-form-item>
      <a-form-item label="确认密码" name="confirmPassword">
        <a-input-password v-model:value="changePasswordForm.confirmPassword" placeholder="请再次输入新密码" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
/**
 * 用户个人中心组件
 * 功能：显示用户详细信息，提供编辑资料、修改密码、头像上传等功能
 * 作用：为用户提供个人信息查看和管理界面
 */

import { ref, reactive, watch, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { 
  EditOutlined, 
  KeyOutlined, 
  ReloadOutlined,
  CameraOutlined 
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { updateProfile, updatePassword, uploadAvatar } from '@/api/auth'

// ========== 组件属性定义 ==========

/**
 * 组件接收的属性
 * @property {Boolean} open - 模态框显示状态
 */
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

// ========== 组件事件定义 ==========

/**
 * 组件对外发送的事件
 * @event update:open - 更新模态框显示状态
 */
const emit = defineEmits(['update:open'])

// ========== 状态管理 ==========

/**
 * 认证状态管理
 * 用于获取用户信息、角色、权限等数据
 */
const authStore = useAuthStore()

// ========== 响应式数据 ==========

/**
 * 模态框显示状态
 * @type {Boolean} 控制模态框的显示/隐藏
 */
const modalVisible = ref(props.open)

/**
 * 刷新信息加载状态
 * @type {Boolean} 控制刷新按钮的加载状态
 */
const refreshLoading = ref(false)

/**
 * 编辑资料模态框显示状态
 * @type {Boolean} 控制编辑资料弹窗的显示/隐藏
 */
const editProfileVisible = ref(false)

/**
 * 编辑资料加载状态
 * @type {Boolean} 控制编辑资料提交按钮的加载状态
 */
const editProfileLoading = ref(false)

/**
 * 修改密码模态框显示状态
 * @type {Boolean} 控制修改密码弹窗的显示/隐藏
 */
const changePasswordVisible = ref(false)

/**
 * 修改密码加载状态
 * @type {Boolean} 控制修改密码提交按钮的加载状态
 */
const changePasswordLoading = ref(false)

/**
 * 头像文件输入框引用
 * @type {Ref} DOM元素引用
 */
const avatarFileInput = ref(null)

/**
 * 编辑资料表单引用
 * @type {Ref} 表单组件引用
 */
const editProfileFormRef = ref(null)

/**
 * 修改密码表单引用
 * @type {Ref} 表单组件引用
 */
const changePasswordFormRef = ref(null)

/**
 * 编辑资料表单数据
 * @type {Object} 表单数据对象
 */
const editProfileForm = reactive({
  nickName: '',
  email: '',
  phonenumber: '',
  sex: ''
})

/**
 * 修改密码表单数据
 * @type {Object} 表单数据对象
 */
const changePasswordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

/**
 * 编辑资料表单验证规则
 * @type {Object} 表单验证规则对象
 */
const editProfileRules = {
  nickName: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phonenumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

/**
 * 修改密码表单验证规则
 * @type {Object} 表单验证规则对象
 */
const changePasswordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 5, max: 20, message: '密码长度在 5 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { 
      validator: (rule, value) => {
        if (value !== changePasswordForm.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      }, 
      trigger: 'blur' 
    }
  ]
}

// ========== 监听器 ==========

/**
 * 监听props变化，同步模态框状态
 */
watch(() => props.open, (newVal) => {
  modalVisible.value = newVal
})

/**
 * 监听模态框状态变化，向父组件发送事件
 */
watch(modalVisible, (newVal) => {
  emit('update:open', newVal)
})

// ========== 工具方法 ==========

/**
 * 格式化日期时间
 * @param {String} dateString - 日期字符串
 * @returns {String} 格式化后的日期时间
 */
function formatDate(dateString) {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    // 检查日期是否有效
    if (isNaN(date.getTime())) return '-'
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  } catch (error) {
    console.error('日期格式化失败:', error)
    return '-'
  }
}

/**
 * 获取用户状态颜色
 * @returns {String} 状态对应的颜色
 */
function getStatusColor() {
  const status = authStore.userInfo?.status
  if (status === '0') return 'green'
  if (status === '1') return 'red'
  return 'default'
}

/**
 * 获取用户状态文本
 * @returns {String} 状态对应的文本
 */
function getStatusText() {
  const status = authStore.userInfo?.status
  if (status === '0') return '正常'
  if (status === '1') return '停用'
  return '未知'
}

/**
 * 获取性别颜色
 * @returns {String} 性别对应的颜色
 */
function getSexColor() {
  const sex = authStore.userInfo?.sex
  if (sex === '0') return 'blue'
  if (sex === '1') return 'pink'
  return 'default'
}

/**
 * 获取性别文本
 * @returns {String} 性别对应的文本
 */
function getSexText() {
  const sex = authStore.userInfo?.sex
  if (sex === '0') return '男'
  if (sex === '1') return '女'
  return '未知'
}

// ========== 事件处理方法 ==========

/**
 * 显示编辑资料模态框
 * 功能：初始化表单数据并显示编辑资料弹窗
 */
function showEditProfileModal() {
  // 初始化表单数据
  const userInfo = authStore.userInfo
  editProfileForm.nickName = userInfo?.nickName || ''
  editProfileForm.email = userInfo?.email || ''
  editProfileForm.phonenumber = userInfo?.phonenumber || ''
  editProfileForm.sex = userInfo?.sex || ''
  
  editProfileVisible.value = true
}

/**
 * 处理编辑资料提交
 * 功能：验证表单并提交编辑资料请求
 */
async function handleEditProfileSubmit() {
  try {
    // 验证表单
    await editProfileFormRef.value.validate()
    
    editProfileLoading.value = true
    
    // 提交更新请求
    await updateProfile(editProfileForm)
    
    message.success('资料修改成功')
    editProfileVisible.value = false
    
    // 刷新用户信息
    await authStore.refreshUserInfo()
    
  } catch (error) {
    console.error('修改资料失败:', error)
    if (error.response?.data?.msg) {
      message.error(error.response.data.msg)
    } else {
      message.error('修改资料失败')
    }
  } finally {
    editProfileLoading.value = false
  }
}

/**
 * 显示修改密码模态框
 * 功能：清空表单数据并显示修改密码弹窗
 */
function showChangePasswordModal() {
  // 清空表单数据
  changePasswordForm.oldPassword = ''
  changePasswordForm.newPassword = ''
  changePasswordForm.confirmPassword = ''
  
  changePasswordVisible.value = true
}

/**
 * 处理修改密码提交
 * 功能：验证表单并提交修改密码请求
 */
async function handleChangePasswordSubmit() {
  try {
    // 验证表单
    await changePasswordFormRef.value.validate()
    
    changePasswordLoading.value = true
    
    // 提交修改密码请求
    const response=await updatePassword({
      oldPassword: changePasswordForm.oldPassword,
      newPassword: changePasswordForm.newPassword
    })
    console.log('response=====>',response)   
    if(response.code === 200) {
      message.success('密码修改成功')
    }else{
      message.error(response.msg)
    }
    changePasswordVisible.value = false
    
    // 清空表单
    changePasswordForm.oldPassword = ''
    changePasswordForm.newPassword = ''
    changePasswordForm.confirmPassword = ''
    
  } catch (error) {
    console.error('修改密码失败:', error)
    if (error.response?.data?.msg) {
      message.error(error.response.data.msg)
    } else {
      message.error('修改密码失败:'+response.msg)
    }
  } finally {
    changePasswordLoading.value = false
  }
}

/**
 * 处理头像点击
 * 功能：触发文件选择器
 */
function handleAvatarClick() {
  avatarFileInput.value?.click()
}

/**
 * 处理头像文件变更
 * 功能：上传选择的头像文件
 */
async function handleAvatarChange(event) {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    message.error('请选择图片文件')
    return
  }
  
  // 验证文件大小 (2MB)
  if (file.size > 2 * 1024 * 1024) {
    message.error('图片大小不能超过2MB')
    return
  }
  
  try {
    // 创建FormData
    const formData = new FormData()
    formData.append('avatarfile', file)
    
    // 显示上传提示
    const hideLoading = message.loading('头像上传中...', 0)
    
    // 上传头像
    const response = await uploadAvatar(formData)
    
    hideLoading()
    
    if (response.code === 200) {
      message.success('头像上传成功')
      // 刷新用户信息
      await authStore.refreshUserInfo()
    } else {
      message.error(response.msg || '头像上传失败')
    }
    
  } catch (error) {
    console.error('头像上传失败:', error)
    message.error('头像上传失败')
  } finally {
    // 清空文件输入框
    event.target.value = ''
  }
}
</script>

<style scoped>
/**
 * 个人中心组件样式
 * 功能：定义个人中心的外观和布局
 */

.profile-content {
  padding: 0;
}

/* 头部区域样式 */
.profile-header {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 18px 18px 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
}

.avatar-section {
  flex-shrink: 0;
  position: relative;
}

.avatar-upload-container {
  position: relative;
  cursor: pointer;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-upload-container:hover .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  font-size: 18px;
  color: white;
  margin-bottom: 2px;
}

.upload-text {
  font-size: 11px;
  color: white;
}

.user-basic-info {
  flex: 1;
}

.user-basic-info h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.user-email {
  margin: 0 0 6px 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.user-status {
  margin-top: 4px;
}

/* 分割线样式 */
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

/* 表单区域样式 */
.info-form-section {
  margin: 10px 0 0 0;
}

.form-item {
  margin-bottom: 6px;
  padding: 8px;
  background: #fafafa;
  border-radius: 6px;
  border-left: 2px solid #1890ff;
}

.form-label {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
  color: #666;
  font-size: 12px;
}

.form-value {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
  min-height: 18px;
}

/* 角色区域样式 */
.roles-section {
  margin: 10px 0;
}

.role-tag, .post-tag {
  margin: 2px;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 12px;
}

.empty-text {
  color: #999;
  font-size: 12px;
  font-style: italic;
}

/* 操作按钮区域样式 */
.action-section {
  margin-top: 10px;
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

/* 个人中心模态框特殊样式 */
:deep(.user-profile-modal .ant-modal-header) {
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  border-bottom: none;
}

:deep(.user-profile-modal .ant-modal-title) {
  color: white;
  font-size: 15px;
  font-weight: 600;
}

:deep(.user-profile-modal .ant-modal-close) {
  color: white;
}

:deep(.user-profile-modal .ant-modal-close:hover) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.user-profile-modal .ant-modal-body) {
  padding: 18px;
}

/* 标签样式优化 */
:deep(.ant-tag) {
  border: none;
  font-weight: 500;
}

/* 头像样式优化 */
:deep(.ant-avatar) {
  border: 3px solid rgba(255, 255, 255, 0.3);
  font-size: 24px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* 按钮样式优化 */
:deep(.ant-btn) {
  border-radius: 5px;
  font-weight: 500;
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
}

:deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  border: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 10px;
    padding: 10px;
  }
  .action-section {
    text-align: center;
  }
  .form-item {
    padding: 6px;
  }
  :deep(.user-profile-modal) {
    margin: 0;
    max-width: 100vw;
  }
}

@media (max-width: 576px) {
  :deep(.ant-col) {
    margin-bottom: 8px;
  }
  .user-basic-info h2 {
    font-size: 16px;
  }
  .user-email {
    font-size: 12px;
  }
}
</style> 