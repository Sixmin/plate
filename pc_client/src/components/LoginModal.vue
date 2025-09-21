<template>
  <a-modal
    v-model:open="modalVisible"
    :width="400"
    :centered="true"
    :footer="null"
    :closable="false"
    class="login-modal"
  >
    <div class="login-container">
      <!-- 顶部医院标识区域 -->
      <div class="hospital-header" v-if="!scanMode">
        <!-- 左侧logo -->
        <div class="hospital-logo">
          <img src="/src/assets/logo/wzzy.jpg" alt="医院logo" class="logo-img" />
        </div>
        <!-- 中间医院名称 -->
        <div class="hospital-name-center">
          <span class="hospital-name">梧州市中医医院</span>
        </div>
        <!-- 右侧二维码 -->
        <div class="qr-code"
          @mouseenter="showScanTip = true"
          @mouseleave="showScanTip = false"
          @click="handleQrCodeClick"
          style="position: relative;"
        >
          <!-- 悬浮气泡提示 -->
          <transition name="fade">
            <div v-if="showScanTip" class="scan-tip-bubble">
              扫码登录
            </div>
          </transition>
          <img src="/src/assets/image/二维码.jpg" alt="二维码" class="qr-img" />
        </div>
      </div>

      <!-- 小易AI助手标题 -->
      <div class="app-title" v-if="!scanMode">
        <h2>小易AI助手</h2>
      </div>

      <!-- 登录表单 -->
      <a-form
        v-if="!scanMode"
        :model="formData"
        @finish="handleLogin"
        layout="vertical"
        class="login-form"
      >
        <!-- 用户名输入 -->
        <a-form-item
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input
            v-model:value="formData.username"
            placeholder="请输入用户名"
            size="large"
            class="login-input"
          />
        </a-form-item>

        <!-- 密码输入 -->
        <a-form-item
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password
            v-model:value="formData.password"
            placeholder="请输入密码"
            size="large"
            class="login-input"
            :visibilityToggle="true"
          />
        </a-form-item>

        <!-- 用户协议 -->
        <a-form-item>
          <a-checkbox v-model:checked="agreeTerms" class="agree-checkbox">
            已阅读并同意
            <a href="#" @click.prevent="handleTermsClick" class="terms-link">用户协议</a>
            <!-- <span @click="handleRegisterClick" class="register-link">立即注册</span> -->
          </a-checkbox>
        </a-form-item>

        <!-- 登录按钮 -->
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            :loading="loading"
            :disabled="formData.username.trim() =='' && formData.password.trim() ==''"
            size="large"
            block
            class="login-button"
          >
            登录
          </a-button>
        </a-form-item>

        <!-- 取消按钮 -->
        <!-- <a-form-item>
          <a-button
            type="text"
            @click="handleCancel"
            size="large"
            block
            class="cancel-button"
          >
            取消
          </a-button>
        </a-form-item> -->
      </a-form>

      <!-- 扫码登录界面 -->
      <div v-if="scanMode" class="scan-login-panel">
        <div class="scan-login-corner-logo-abs"
          @mouseenter="showLoginCodeTip = true"
          @mouseleave="showLoginCodeTip = false">
          <img src="/src/assets/image/loginCode.png" class="scan-login-corner-logo-img" @click="handleBackToAccount" />
          <transition name="fade">
            <div v-if="showLoginCodeTip" class="login-code-tip-bubble">返回账号登录</div>
          </transition>
        </div>
        <div class="scan-login-title">登录后免费使用完整功能</div>
        <div class="scan-login-desc-weChat-row">
          <img src="/src/assets/image/weixin.jpg" class="scan-login-qrcode-img-weChat" />
          <span class="scan-login-desc-weChat-text">微信 App扫码登录</span>
        </div>
       
        <div class="scan-login-qrcode">
          <img src="/src/assets/image/weChat.jpg" alt="扫码二维码" class="scan-login-qrcode-img" />
        </div>
        <div class="scan-login-desc">打开<span class="scan-login-app">微信 App</span> - 点击右上角加号 - 点击扫一扫</div>
      
      </div>

      <!-- 底部技术支持 -->
      <div class="footer-support" v-if="!scanMode">
        <span>技术支持由梧州市思捷科技网络有限公司提供</span>
      </div>

       <!-- 用户协议弹窗 -->
       <a-modal
        v-model:open="agreementModalVisible"
        :width="420"
        :centered="true"
        :footer="null"
        :closable="false"
        class="agreement-modal"
        wrap-class-name="agreement-modal-center"
        @cancel="handleAgreementDisagree"
      >
        <div class="agreement-content">
          <div class="agreement-header-row">
            <div class="agreement-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1890ff"/><text x="12" y="17" text-anchor="middle" font-size="16" fill="#fff" font-family="Arial,Helvetica,sans-serif">i</text></svg>
            </div>
            <span class="agreement-title">服务协议及隐私保护</span>
            <span class="agreement-close" @click="handleAgreementDisagree">×</span>
          </div>
          <div class="agreement-desc">
            已阅读并同意 小易AI助手 的
            <a href="#" class="agreement-link">使用协议</a>
            和
            <a href="#" class="agreement-link">隐私政策</a>。
          </div>
          <div class="agreement-actions">
            <a-button class="btn-grey" @click="handleAgreementDisagree">不同意</a-button>
            <a-button type="primary" class="btn-blue" @click="handleAgreementAgree">同意</a-button>
          </div>
        </div>
      </a-modal>
    </div>
  </a-modal>
</template>

<script setup>
/**
 * 登录模态框组件
 * 功能：用户登录界面，包含表单验证、状态管理、UI交互等
 * 使用认证store进行登录处理
 */

import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

/**
 * 组件属性定义
 */
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

/**
 * 组件事件定义
 */
const emit = defineEmits(['update:open', 'success'])

// 路由对象
const router = useRouter()

// 认证状态管理
const authStore = useAuthStore()

/**
 * 响应式数据定义
 */
const modalVisible = ref(props.open)  // 模态框显示状态
const agreeTerms = ref(false)         // 用户协议同意状态
const loading = ref(false)            // 登录加载状态

const agreementModalVisible = ref(false)
let pendingLogin = false

// 新增扫码登录模式和气泡提示状态
const scanMode = ref(false)
const showScanTip = ref(false)
const showLoginCodeTip = ref(false)

/**
 * 登录表单数据
 */
const formData = reactive({
  username: '',   // 用户名
  password: '',   // 密码
  code: '',       // 验证码
  uuid: ''        // 验证码UUID
})

/**
 * 监听props变化，同步模态框显示状态
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

/**
 * 处理用户登录
 * 功能：表单验证、调用登录接口、处理登录结果
 * 参考管理端的登录逻辑，提供友好的错误处理
 */
const handleLogin = async () => {
  // 检查用户协议同意状态
  if (!agreeTerms.value) {
    agreementModalVisible.value = true
    pendingLogin = true
    return
  }

  // 基础表单验证
  if (!formData.username.trim()) {
    message.warning('请输入用户名')
    return
  }
  
  if (!formData.password.trim()) {
    message.warning('请输入密码')
    return
  }

  loading.value = true
  try {
    // 调用认证store的登录方法
    await authStore.loginAction(formData)
    
    // 登录成功后获取用户信息
    await authStore.getUserInfoAction()
    
    // 关闭模态框
    modalVisible.value = false
    
    // 向父组件发送成功事件
    emit('success')
    
    // 重置表单
    resetForm()
    
    // 获取重定向路径，默认跳转到首页
    const redirect = router.currentRoute.value.query.redirect || '/'
    router.push(redirect)
    
  } catch (error) {
    console.error('登录失败:', error)
    // 错误信息已经在authStore中处理并显示，这里不需要额外处理
    // 参考管理端的做法，让store负责错误提示的显示
  } finally {
    loading.value = false
  }
}

function handleAgreementAgree() {
  agreementModalVisible.value = false
  agreeTerms.value = true
  // 如果是因登录触发的，自动继续登录
  if (pendingLogin) {
    pendingLogin = false
    handleLogin()
  }
}

function handleAgreementDisagree() {
  agreementModalVisible.value = false
  pendingLogin = false
}


/**
 * 处理取消登录
 * 功能：关闭模态框、重置表单
 */
const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

/**
 * 重置表单数据
 * 功能：清空所有输入项和状态
 */
const resetForm = () => {
  formData.username = ''
  formData.password = ''
  formData.code = ''
  formData.uuid = ''
  agreeTerms.value = false
}

/**
 * 处理二维码点击事件
 * 功能：二维码相关交互逻辑
 */
const handleQrCodeClick = () => {
  // 切换到扫码登录模式
  scanMode.value = true
}

// 新增：返回账号登录
const handleBackToAccount = () => {
  scanMode.value = false
}

/**
 * 处理注册链接点击
 * 功能：跳转到注册页面或显示注册模态框
 */
const handleRegisterClick = () => {
  console.log('注册链接被点击')
  // 这里可以：
  // - 跳转到注册页面
  // - 显示注册模态框
  // - 或者其他注册相关逻辑
  message.info('注册功能即将开放')
}

/**
 * 处理用户协议链接点击
 * 功能：显示用户协议内容
 */
const handleTermsClick = () => {
  console.log('用户协议链接被点击')
  // 可以：
  // - 打开用户协议页面
  // - 显示协议内容的模态框
  message.info('用户协议详情')
}
</script>

<style scoped>
.login-container {
  padding: 16px 24px 8px 24px;
  text-align: center;
}


/* 顶部医院标识区域 */
.hospital-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.hospital-logo {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  margin-right: 25px;
}

.logo-img {
  width: 52px;
  height: 52px;
  margin-left: 28px;
}

.hospital-name-center {
  margin-left: -64px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* flex: 1; */
}

.hospital-name {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.qr-code {
  /* display: flex;
  align-items: center;
  flex: 0 0 auto; */
  margin-right: -43px;
  margin-top: -30px;
  cursor: pointer;
}

.qr-img {
  width: 60px;
  height: 60px;
  border: 0 solid #e5e7eb;
  border-radius: 4px;
}

/* 小易AI助手标题 */
.app-title {
  margin-top: 20px;
  margin-bottom: 35px;
}

.app-title h2 {
  font-size: 26px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* 登录表单 */
.login-form {
  text-align: left;
}

.login-input {
  margin: 5px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  transition: all 0.2s;
}

.login-input:focus,
.login-input:hover {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 用户协议区域 */
.agree-checkbox {
  margin-bottom: 20px;
  margin-left: 5px;
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.terms-link {
  color: #3b82f6;
  text-decoration: none;
  margin: 0 8px;
}

.terms-link:hover {
  text-decoration: underline;
}

.register-link {
  color: #3b82f6;
  cursor: pointer;
  margin-left: auto;
}

.register-link:hover {
  text-decoration: underline;
}

/* 按钮样式 */
.login-button {
  border-radius: 4px;
  background-color: #9ca3af;
  border: none;
  font-weight: 500;
  height: 40px;
  margin-bottom: 8px;
  margin-left: 5px;
}

.login-button:not(:disabled) {
  background-color: #3b82f6;
}

.login-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.login-button:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.cancel-button {
  color: #6b7280;
  height: 36px;
  border: none;
  background: transparent;
}

.cancel-button:hover {
  color: #374151;
  background-color: #f9fafb;
}

/* 底部技术支持 */
.footer-support {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
}

/* 模态框样式覆盖 */
:deep(.ant-modal-content) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.ant-modal-body) {
  padding: 0;
}

:deep(.ant-form-item) {
  margin-bottom: 12px;
}

:deep(.ant-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.ant-checkbox-wrapper) {
  display: flex;
  align-items: center;
  width: 100%;
}

:deep(.ant-checkbox) {
  flex-shrink: 0;
}

:deep(.ant-checkbox + span) {
  flex: 1;
  display: flex;
  align-items: center;
}

.agreement-modal :deep(.ant-modal-content) {
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 0;
}
.agreement-modal-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.agreement-content {
  padding: 2px 2px 2px 2px;
  text-align: left;
  min-width: 350px;
  position: relative;
}
.agreement-header-row {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  position: relative;
}
.agreement-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1890ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
}
.agreement-title {
  font-size: 20px;
  font-weight: 700;
  color: #222;
  flex: 1;
  line-height: 1;
}
.agreement-close {
  font-size: 22px;
  color: #888;
  cursor: pointer;
  margin-left: 12px;
  transition: color 0.2s;
  position: absolute;
  right: 0;
  top: 0;
  line-height: 1;
}
.agreement-close:hover {
  color: #1890ff;
}
.agreement-desc {
  font-size: 15px;
  color: #444;
  margin-bottom: 32px;
  margin-top: 8px;
  line-height: 1.7;
}
.agreement-link {
  color: #1890ff;
  text-decoration: none;
  margin: 0 2px;
  font-weight: 500;
}
.agreement-link:hover {
  text-decoration: underline;
}
.agreement-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.btn-grey {
  background: #f5f5f5 !important;
  color: #444 !important;
  border: none !important;
  min-width: 88px;
  height: 36px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  box-shadow: none !important;
  transition: background 0.2s;
}
.btn-grey:hover {
  background: #e4e7ed !important;
  color: #222 !important;
}
.btn-blue {
  background: #1890ff !important;
  color: #fff !important;
  border: none !important;
  min-width: 88px;
  height: 36px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  box-shadow: none !important;
}
.btn-blue:hover {
  background: #1677d2 !important;
  color: #fff !important;
}

/* 扫码登录气泡提示样式 */
.scan-tip-bubble {
  position: absolute;
  left: -80px;
  top: 50%;
  transform: translateY(-50%);
  background: #222;
  color: #fff;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 扫码登录界面样式 */
.scan-login-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 340px;
  padding: 32px 0 16px 0;
  position: relative;
}
.scan-login-title {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  margin-bottom: 24px;
}
.scan-login-qrcode {
  margin-bottom: 24px;
}
.scan-login-qrcode-img {
  width: 180px;
  height: 180px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  border: 1px solid #e5e7eb;
}
.scan-login-qrcode-img-weChat{
  width: 17px;
  height: 17px;
}
.scan-login-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 18px;
  margin-top: 8px;
}
.scan-login-app {
  color: #1890ff;
  font-weight: 500;
}
.scan-login-back-btn {
  color: #1890ff;
  font-size: 14px;
  margin-top: 8px;
  padding: 0;
}
.scan-login-desc-weChat-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}
.scan-login-qrcode-img-weChat{
  width: 17px;
  height: 17px;
  margin-right: 6px;
}
.scan-login-desc-weChat-text {
  font-size: 15px;
  color: #666;
  vertical-align: middle;
}
.scan-login-corner-logo-abs {
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 60px;
  z-index: 30;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  
}
.scan-login-corner-logo-img {
  position: absolute;
  width: 60px;
  height: 60px;
  display: block;
  cursor: pointer;
  object-fit: contain;
  margin: 0;
  padding: 0;
  right: -43px;
  top: -23px
}
.login-code-tip-bubble {
  position: absolute;
  left: 50px;
  top: 10px;
  transform: translate(-100%, -50%);
  background: #222;
  color: #fff;
  padding: 4px 14px;
  border-radius: 6px;
  font-size: 13px;
  white-space: nowrap;
  z-index: 40;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  pointer-events: none;
}
</style> 