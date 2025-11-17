/**
 * 验证工具函数
 */

// 验证手机号
export const validatePhone = (phone: string): boolean => {
  const phoneReg = /^1[3-9]\d{9}$/
  return phoneReg.test(phone)
}

// 验证邮箱
export const validateEmail = (email: string): boolean => {
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailReg.test(email)
}

// 验证密码强度（至少包含字母和数字，6-20位）
export const validatePassword = (password: string): boolean => {
  const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,20}$/
  return passwordReg.test(password)
}

// 验证昵称（2-20位，只能包含中文、英文、数字、下划线）
export const validateNickname = (nickname: string): boolean => {
  const nicknameReg = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/
  return nicknameReg.test(nickname)
}

// XSS 防护：过滤 HTML 标签和脚本
export const sanitizeInput = (input: string): string => {
  if (!input) return ''

  // 移除 HTML 标签
  let sanitized = input.replace(/<[^>]*>/g, '')

  // 移除 script 标签内容
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // 转义特殊字符
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }

  sanitized = sanitized.replace(/[&<>"'/]/g, (char) => map[char])

  return sanitized.trim()
}

// SQL 注入防护：检测危险关键字
export const detectSQLInjection = (input: string): boolean => {
  const sqlKeywords = [
    'select', 'insert', 'update', 'delete', 'drop', 'create', 'alter',
    'exec', 'execute', 'script', 'union', 'declare', '--', ';--', '/*', '*/',
    'xp_', 'sp_', 'union all', 'union select'
  ]

  const lowerInput = input.toLowerCase()
  return sqlKeywords.some(keyword => lowerInput.includes(keyword))
}

// 检测特殊字符（只允许常见字符）
export const hasSpecialChars = (input: string, allowedChars: string = ''): boolean => {
  const specialCharsReg = new RegExp(`[^a-zA-Z0-9\\u4e00-\\u9fa5_@.${allowedChars}]`)
  return specialCharsReg.test(input)
}

// 验证输入长度
export const validateLength = (input: string, min: number, max: number): boolean => {
  const length = input.trim().length
  return length >= min && length <= max
}

// 检测是否包含敏感词
export const containsSensitiveWords = (input: string): boolean => {
  const sensitiveWords = [
    'admin', 'administrator', 'root', 'system', 'test',
    '管理员', '测试', '系统'
  ]

  const lowerInput = input.toLowerCase()
  return sensitiveWords.some(word => lowerInput.includes(word))
}

// 验证码格式验证（6位数字）
export const validateVerifyCode = (code: string): boolean => {
  const codeReg = /^\d{6}$/
  return codeReg.test(code)
}

// 综合验证函数
export const validateRegisterForm = (form: {
  nickname: string
  phone?: string
  email?: string
  password: string
  confirmPassword: string
}): { valid: boolean; message: string } => {
  // 验证昵称
  if (!form.nickname) {
    return { valid: false, message: '请输入昵称' }
  }

  const sanitizedNickname = sanitizeInput(form.nickname)
  if (sanitizedNickname !== form.nickname) {
    return { valid: false, message: '昵称包含非法字符' }
  }

  if (!validateNickname(form.nickname)) {
    return { valid: false, message: '昵称只能包含中文、英文、数字、下划线，长度2-20位' }
  }

  if (containsSensitiveWords(form.nickname)) {
    return { valid: false, message: '昵称包含敏感词' }
  }

  // 验证手机号或邮箱（至少一个）
  if (!form.phone && !form.email) {
    return { valid: false, message: '请输入手机号或邮箱' }
  }

  if (form.phone && !validatePhone(form.phone)) {
    return { valid: false, message: '手机号格式不正确' }
  }

  if (form.email) {
    const sanitizedEmail = sanitizeInput(form.email)
    if (sanitizedEmail !== form.email) {
      return { valid: false, message: '邮箱包含非法字符' }
    }

    if (!validateEmail(form.email)) {
      return { valid: false, message: '邮箱格式不正确' }
    }

    if (detectSQLInjection(form.email)) {
      return { valid: false, message: '邮箱包含非法字符' }
    }
  }

  // 验证密码
  if (!form.password) {
    return { valid: false, message: '请输入密码' }
  }

  if (!validateLength(form.password, 6, 20)) {
    return { valid: false, message: '密码长度为6-20位' }
  }

  if (!validatePassword(form.password)) {
    return { valid: false, message: '密码必须包含字母和数字' }
  }

  if (detectSQLInjection(form.password)) {
    return { valid: false, message: '密码包含非法字符' }
  }

  // 验证确认密码
  if (form.password !== form.confirmPassword) {
    return { valid: false, message: '两次密码不一致' }
  }

  return { valid: true, message: '验证通过' }
}

// 验证商品 ID
export const validateProductId = (id: any): number | null => {
  // 如果是对象，尝试获取 id 属性
  if (typeof id === 'object' && id !== null) {
    id = id.id
  }
  
  // 转换为数字
  const numId = Number(id)
  
  // 验证是否为有效数字
  if (isNaN(numId) || numId <= 0) {
    return null
  }
  
  return numId
}