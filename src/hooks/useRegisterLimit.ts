import { ref } from 'vue'
import { showToast } from 'vant'

/**
 * 注册限制 Hook
 */
export function useRegisterLimit() {
  const registerAttempts = ref(0)
  const lastRegisterTime = ref(0)
  const isBlocked = ref(false)
  const blockEndTime = ref(0)

  const MAX_ATTEMPTS = 5 // 最大尝试次数
  const BLOCK_DURATION = 30 * 60 * 1000 // 封禁时长：30分钟
  const ATTEMPT_WINDOW = 60 * 60 * 1000 // 时间窗口：1小时

  // 检查是否被封禁
  const checkBlocked = (): boolean => {
    const now = Date.now()
    
    if (isBlocked.value && now < blockEndTime.value) {
      const remainingMinutes = Math.ceil((blockEndTime.value - now) / 60000)
      showToast(`操作过于频繁，请${remainingMinutes}分钟后再试`)
      return true
    }
    
    if (isBlocked.value && now >= blockEndTime.value) {
      // 解除封禁
      isBlocked.value = false
      registerAttempts.value = 0
      blockEndTime.value = 0
    }
    
    return false
  }

  // 记录注册尝试
  const recordAttempt = (): boolean => {
    const now = Date.now()
    
    // 检查是否被封禁
    if (checkBlocked()) {
      return false
    }
    
    // 如果超过时间窗口，重置计数
    if (now - lastRegisterTime.value > ATTEMPT_WINDOW) {
      registerAttempts.value = 0
    }
    
    registerAttempts.value++
    lastRegisterTime.value = now
    
    // 检查是否超过最大尝试次数
    if (registerAttempts.value >= MAX_ATTEMPTS) {
      isBlocked.value = true
      blockEndTime.value = now + BLOCK_DURATION
      showToast(`注册失败次数过多，请${Math.ceil(BLOCK_DURATION / 60000)}分钟后再试`)
      return false
    }
    
    return true
  }

  // 重置计数（注册成功后调用）
  const reset = () => {
    registerAttempts.value = 0
    lastRegisterTime.value = 0
    isBlocked.value = false
    blockEndTime.value = 0
  }

  return {
    checkBlocked,
    recordAttempt,
    reset,
    remainingAttempts: () => MAX_ATTEMPTS - registerAttempts.value,
  }
}