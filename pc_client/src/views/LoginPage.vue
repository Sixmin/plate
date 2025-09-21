<template>
  <div class="login-page">
    <div class="login-container">
      <h1>小易AI助手</h1>
      <p>用户登录</p>
      <div class="login-form">
        <input type="text" placeholder="用户名" v-model="username" />
        <input type="password" placeholder="密码" v-model="password" />
        <button @click="handleLogin">登录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')

const handleLogin = () => {
  // 简单的登录逻辑，实际应该调用API
  if (username.value && password.value) {
    router.push('/')
  } else {
    alert('请输入用户名和密码')
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-form {
  margin-top: 1rem;
}

.login-form input {
  display: block;
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.login-form button {
  background-color: #1890ff;
  color: white;
  padding: 0.5rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.login-form button:hover {
  background-color: #40a9ff;
}
</style> 