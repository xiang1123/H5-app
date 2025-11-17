<template>
  <div class="login-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      :title="isRegister ? '注册' : '登录'"
      left-arrow
      @click-left="onBack"
      fixed
      placeholder
    />

    <div class="login-content">
      <!-- Logo -->
      <div class="logo-section">
        <div class="logo">🛍️</div>
        <div class="app-name">商城</div>
      </div>

      <!-- 登录表单 -->
      <van-form v-if="!isRegister" @submit="onLogin">
        <!-- 登录方式切换 -->
        <van-tabs v-model:active="loginType" class="login-tabs">
          <van-tab title="手机号登录" name="phone"></van-tab>
          <van-tab title="邮箱登录" name="email"></van-tab>
        </van-tabs>

        <!-- 手机号登录 -->
        <template v-if="loginType === 'phone'">
          <van-cell-group inset>
            <van-field
              v-model="loginForm.phone"
              name="phone"
              label="手机号"
              placeholder="请输入手机号"
              maxlength="11"
              @input="onPhoneInput"
              :rules="[
                { required: true, message: '请输入手机号' },
                { validator: validatePhoneField, message: '手机号格式不正确' }
              ]"
            >
              <template #left-icon>
                <van-icon name="phone-o" />
              </template>
            </van-field>
            <van-field
              v-model="loginForm.password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              maxlength="20"
              :rules="[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' }
              ]"
            >
              <template #left-icon>
                <van-icon name="lock" />
              </template>
            </van-field>
          </van-cell-group>
        </template>

        <!-- 邮箱登录 -->
        <template v-else>
          <van-cell-group inset>
            <van-field
              v-model="loginForm.email"
              name="email"
              label="邮箱"
              placeholder="请输入邮箱"
              maxlength="50"
              @input="onEmailInput"
              :rules="[
                { required: true, message: '请输入邮箱' },
                { validator: validateEmailField, message: '邮箱格式不正确' }
              ]"
            >
              <template #left-icon>
                <van-icon name="envelop-o" />
              </template>
            </van-field>
            <van-field
              v-model="loginForm.password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              maxlength="20"
              :rules="[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' }
              ]"
            >
              <template #left-icon>
                <van-icon name="lock" />
              </template>
            </van-field>
          </van-cell-group>
        </template>

        <!-- 忘记密码 -->
        <div class="form-footer">
          <span class="forget-password">忘记密码？</span>
        </div>

        <!-- 登录按钮 -->
        <div class="button-group">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            :disabled="loginDisabled"
          >
            登录
          </van-button>
        </div>

        <!-- 切换到注册 -->
        <div class="switch-mode">
          还没有账号？
          <span class="link" @click="switchToRegister">立即注册</span>
        </div>
      </van-form>

      <!-- 注册表单 -->
      <van-form v-else @submit="onRegister">
        <van-cell-group inset>
          <van-field
            v-model="registerForm.nickname"
            name="nickname"
            label="昵称"
            placeholder="请输入昵称（2-20位）"
            maxlength="20"
            @input="onNicknameInput"
            :rules="[
              { required: true, message: '请输入昵称' },
              { validator: validateNicknameField, message: '昵称格式不正确' }
            ]"
          >
            <template #left-icon>
              <van-icon name="user-o" />
            </template>
          </van-field>

          <van-field
            v-model="registerForm.phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            maxlength="11"
            @input="onPhoneInput"
            :rules="[
              { required: true, message: '请输入手机号' },
              { validator: validatePhoneField, message: '手机号格式不正确' }
            ]"
          >
            <template #left-icon>
              <van-icon name="phone-o" />
            </template>
          </van-field>

          <van-field
            v-model="registerForm.email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱"
            maxlength="50"
            @input="onEmailInput"
            :rules="[
              { required: true, message: '请输入邮箱' },
              { validator: validateEmailField, message: '邮箱格式不正确' }
            ]"
          >
            <template #left-icon>
              <van-icon name="envelop-o" />
            </template>
          </van-field>

          <van-field
            v-model="registerForm.password"
            type="password"
            name="password"
            label="密码"
            placeholder="6-20位，包含字母和数字"
            maxlength="20"
            :rules="[
              { required: true, message: '请输入密码' },
              { validator: validatePasswordField, message: '密码必须包含字母和数字，6-20位' }
            ]"
          >
            <template #left-icon>
              <van-icon name="lock" />
            </template>
          </van-field>

          <van-field
            v-model="registerForm.confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="请再次输入密码"
            maxlength="20"
            :rules="[
              { required: true, message: '请再次输入密码' },
              { validator: validateConfirmPassword, message: '两次密码不一致' }
            ]"
          >
            <template #left-icon>
              <van-icon name="lock" />
            </template>
          </van-field>
        </van-cell-group>

        <!-- 剩余尝试次数提示 -->
        <div v-if="registerAttempts > 0" class="attempt-hint">
          <van-icon name="warning-o" color="#ff976a" />
          <span>剩余注册尝试次数：{{ remainingAttempts }}</span>
        </div>

        <!-- 用户协议 -->
        <div class="agreement">
          <van-checkbox v-model="agreedToTerms" icon-size="16px">
            我已阅读并同意
            <span class="link">《用户协议》</span>
            和
            <span class="link">《隐私政策》</span>
          </van-checkbox>
        </div>

        <!-- 注册按钮 -->
        <div class="button-group">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            :disabled="registerDisabled"
          >
            注册
          </van-button>
        </div>

        <!-- 切换到登录 -->
        <div class="switch-mode">
          已有账号？
          <span class="link" @click="switchToLogin">立即登录</span>
        </div>
      </van-form>

      <!-- 第三方登录 -->
      <div class="other-login">
        <div class="divider">
          <span>其他登录方式</span>
        </div>
        <div class="other-login-icons">
          <div class="login-icon">
            <van-icon name="wechat" size="32" color="#07c160" />
          </div>
          <div class="login-icon">
            <van-icon name="qq" size="32" color="#12b7f5" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NavBar as VanNavBar,
  Form as VanForm,
  Field as VanField,
  CellGroup as VanCellGroup,
  Button as VanButton,
  Icon as VanIcon,
  Tabs as VanTabs,
  Tab as VanTab,
  Checkbox as VanCheckbox,
  showToast,
  showLoadingToast,
  closeToast,
} from 'vant'
import { useUserStore } from '@/store/modules/user'
import { useRegisterLimit } from '@/hooks/useRegisterLimit'
import {
  sanitizeInput,
  detectSQLInjection,
  validatePhone,
  validateEmail,
  validatePassword,
  validateNickname,
  containsSensitiveWords,
  validateRegisterForm,
} from '@/utils/validate'
import { throttle } from '@/utils/throttle'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const registerLimit = useRegisterLimit()

const loading = ref(false)
const isRegister = ref(false)
const loginType = ref<'phone' | 'email'>('phone')
const agreedToTerms = ref(false)
const registerAttempts = ref(0)

// 登录表单
const loginForm = reactive({
  phone: '',
  email: '',
  password: '',
})

// 注册表单
const registerForm = reactive({
  nickname: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// 计算剩余尝试次数
const remainingAttempts = computed(() => {
  return registerLimit.remainingAttempts()
})

// 登录按钮禁用状态
const loginDisabled = computed(() => {
  if (loginType.value === 'phone') {
    return !loginForm.phone || !loginForm.password
  } else {
    return !loginForm.email || !loginForm.password
  }
})

// 注册按钮禁用状态
const registerDisabled = computed(() => {
  return (
    !registerForm.nickname ||
    !registerForm.phone ||
    !registerForm.email ||
    !registerForm.password ||
    !registerForm.confirmPassword ||
    !agreedToTerms.value
  )
})

// 输入过滤 - 手机号
const onPhoneInput = (value: string) => {
  // 只允许数字
  const filtered = value.replace(/\D/g, '')
  if (loginType.value === 'phone' || isRegister.value) {
    if (isRegister.value) {
      registerForm.phone = filtered
    } else {
      loginForm.phone = filtered
    }
  }
}

// 输入过滤 - 邮箱
const onEmailInput = (value: string) => {
  // 清理输入
  const sanitized = sanitizeInput(value)
  
  // 检测 SQL 注入
  if (detectSQLInjection(sanitized)) {
    showToast('输入包含非法字符')
    if (isRegister.value) {
      registerForm.email = ''
    } else {
      loginForm.email = ''
    }
    return
  }
  
  if (isRegister.value) {
    registerForm.email = sanitized
  } else {
    loginForm.email = sanitized
  }
}

// 输入过滤 - 昵称
const onNicknameInput = (value: string) => {
  // 清理输入
  const sanitized = sanitizeInput(value)
  
  // 检测 SQL 注入
  if (detectSQLInjection(sanitized)) {
    showToast('昵称包含非法字符')
    registerForm.nickname = ''
    return
  }
  
  registerForm.nickname = sanitized
}

// 验证手机号
const validatePhoneField = (value: string) => {
  return validatePhone(value)
}

// 验证邮箱
const validateEmailField = (value: string) => {
  if (detectSQLInjection(value)) {
    return false
  }
  return validateEmail(value)
}

// 验证昵称
const validateNicknameField = (value: string) => {
  if (!validateNickname(value)) {
    return false
  }
  
  if (containsSensitiveWords(value)) {
    showToast('昵称包含敏感词')
    return false
  }
  
  return true
}

// 验证密码
const validatePasswordField = (value: string) => {
  if (detectSQLInjection(value)) {
    showToast('密码包含非法字符')
    return false
  }
  return validatePassword(value)
}

// 验证确认密码
const validateConfirmPassword = () => {
  return registerForm.password === registerForm.confirmPassword
}

// 登录 - 使用节流
const onLogin = throttle(async () => {
  try {
    loading.value = true
    showLoadingToast({
      message: '登录中...',
      forbidClick: true,
      duration: 0,
    })

    const params: any = {
      password: loginForm.password,
    }

    if (loginType.value === 'phone') {
      params.phone = loginForm.phone
    } else {
      // 清理邮箱输入
      const sanitizedEmail = sanitizeInput(loginForm.email)
      if (detectSQLInjection(sanitizedEmail)) {
        throw new Error('邮箱包含非法字符')
      }
      params.email = sanitizedEmail
    }

    console.log('登录参数:', params)

    const res = await userStore.userLogin(params)
    
    closeToast()

    if (res.code === 0) {
      showToast({
        type: 'success',
        message: '登录成功',
      })

      setTimeout(() => {
        const redirect = (route.query.redirect as string) || '/home'
        router.replace(redirect)
      }, 500)
    } else {
      showToast({
        type: 'fail',
        message: res.message || '登录失败',
      })
    }
  } catch (error: any) {
    closeToast()
    console.error('登录失败:', error)
    
    let errorMsg = '登录失败'
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail
      if (Array.isArray(detail) && detail.length > 0) {
        errorMsg = detail[0].msg || errorMsg
      } else if (typeof detail === 'string') {
        errorMsg = detail
      }
    } else if (error.message) {
      errorMsg = error.message
    }
    
    showToast({
      type: 'fail',
      message: errorMsg,
    })
  } finally {
    loading.value = false
  }
}, 2000)

// 注册 - 使用节流
const onRegister = throttle(async () => {
  try {
    // 检查是否同意协议
    if (!agreedToTerms.value) {
      showToast('请先同意用户协议和隐私政策')
      return
    }

    // 检查是否被封禁
    if (registerLimit.checkBlocked()) {
      return
    }

    // 综合验证
    const validation = validateRegisterForm(registerForm)
    if (!validation.valid) {
      showToast(validation.message)
      return
    }

    loading.value = true
    showLoadingToast({
      message: '注册中...',
      forbidClick: true,
      duration: 0,
    })

    const params = {
      nickname: sanitizeInput(registerForm.nickname),
      phone: registerForm.phone,
      email: sanitizeInput(registerForm.email),
      password: registerForm.password,
    }

    console.log('注册参数:', params)

    const res = await userStore.userRegister(params)
    
    closeToast()

    if (res.code === 0) {
      showToast({
        type: 'success',
        message: '注册成功',
      })

      // 重置限制计数
      registerLimit.reset()

      setTimeout(() => {
        router.replace('/home')
      }, 500)
    } else {
      // 记录失败尝试
      registerAttempts.value++
      registerLimit.recordAttempt()
      
      showToast({
        type: 'fail',
        message: res.message || '注册失败',
      })
    }
  } catch (error: any) {
    closeToast()
    console.error('注册失败:', error)
    
    // 记录失败尝试
    registerAttempts.value++
    registerLimit.recordAttempt()
    
    let errorMsg = '注册失败'
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail
      if (Array.isArray(detail) && detail.length > 0) {
        errorMsg = detail[0].msg || errorMsg
      } else if (typeof detail === 'string') {
        errorMsg = detail
      }
    } else if (error.message) {
      errorMsg = error.message
    }
    
    showToast({
      type: 'fail',
      message: errorMsg,
    })
  } finally {
    loading.value = false
  }
}, 2000)

// 切换到注册
const switchToRegister = () => {
  isRegister.value = true
  // 清空表单
  Object.keys(registerForm).forEach(key => {
    registerForm[key as keyof typeof registerForm] = ''
  })
  agreedToTerms.value = false
}

// 切换到登录
const switchToLogin = () => {
  isRegister.value = false
  // 清空表单
  Object.keys(loginForm).forEach(key => {
    loginForm[key as keyof typeof loginForm] = ''
  })
}

// 返回
const onBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-content {
    padding: 20px;

    .logo-section {
      text-align: center;
      padding: 40px 0;

      .logo {
        font-size: 64px;
        margin-bottom: 16px;
      }

      .app-name {
        font-size: 24px;
        color: #fff;
        font-weight: bold;
      }
    }

    .login-tabs {
      margin-bottom: 20px;
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;

      :deep(.van-tabs__nav) {
        background-color: transparent;
      }

      :deep(.van-tab) {
        color: #646566;
      }

      :deep(.van-tab--active) {
        color: #667eea;
        font-weight: bold;
      }

      :deep(.van-tabs__line) {
        background-color: #667eea;
      }
    }

    :deep(.van-cell-group) {
      margin-bottom: 16px;
      border-radius: 8px;
      overflow: hidden;
    }

    :deep(.van-field__left-icon) {
      margin-right: 12px;
      color: #969799;
    }

    .form-footer {
      display: flex;
      justify-content: flex-end;
      padding: 12px 16px;

      .forget-password {
        font-size: 14px;
        color: #fff;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .attempt-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      margin: 0 16px 16px;
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      font-size: 13px;
      color: #ff976a;
    }

    .agreement {
      padding: 12px 16px;
      
      :deep(.van-checkbox) {
        .van-checkbox__label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
        }
      }

      .link {
        color: #fff;
        text-decoration: underline;
        cursor: pointer;
      }
    }

    .button-group {
      padding: 16px;

      :deep(.van-button--primary) {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        height: 44px;
        font-size: 16px;
      }

      :deep(.van-button--disabled) {
        opacity: 0.6;
      }
    }

    .switch-mode {
      text-align: center;
      font-size: 14px;
      color: #fff;
      margin-top: 16px;

      .link {
        color: #fff;
        font-weight: bold;
        text-decoration: underline;
        cursor: pointer;
      }
    }

    .other-login {
      margin-top: 40px;

      .divider {
        display: flex;
        align-items: center;
        margin-bottom: 24px;

        &::before,
        &::after {
          content: '';
          flex: 1;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.3);
        }

        span {
          padding: 0 16px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
        }
      }

      .other-login-icons {
        display: flex;
        justify-content: center;
        gap: 32px;

        .login-icon {
          width: 48px;
          height: 48px;
          background-color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;

          &:active {
            transform: scale(0.95);
          }
        }
      }
    }
  }
}
</style>
