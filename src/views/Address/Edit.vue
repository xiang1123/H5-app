<template>
  <div class="address-edit-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      :title="isEdit ? '编辑地址' : '新增地址'"
      left-arrow
      fixed
      placeholder
      @click-left="onBack"
    />

    <div class="address-form">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <!-- 联系人 -->
          <van-field
            v-model="formData.contact_name"
            name="contact_name"
            label="收货人"
            placeholder="请输入收货人姓名"
            maxlength="20"
            :rules="[
              { required: true, message: '请输入收货人姓名' },
              { validator: validateName, message: '姓名格式不正确' }
            ]"
          >
            <template #left-icon>
              <van-icon name="contact" />
            </template>
          </van-field>

          <!-- 手机号 -->
          <van-field
            v-model="formData.contact_phone"
            name="contact_phone"
            type="tel"
            label="手机号"
            placeholder="请输入手机号"
            maxlength="11"
            :rules="[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]"
          >
            <template #left-icon>
              <van-icon name="phone-o" />
            </template>
          </van-field>

          <!-- 地区选择 -->
          <van-field
            v-model="areaText"
            name="area"
            label="所在地区"
            placeholder="请选择省市区"
            readonly
            is-link
            @click="showAreaPicker = true"
            :rules="[{ required: true, message: '请选择所在地区' }]"
          >
            <template #left-icon>
              <van-icon name="location-o" />
            </template>
          </van-field>

          <!-- 详细地址 -->
          <van-field
            v-model="formData.detail"
            name="detail"
            label="详细地址"
            type="textarea"
            placeholder="街道、楼牌号等"
            rows="3"
            maxlength="200"
            show-word-limit
            :rules="[
              { required: true, message: '请输入详细地址' },
              { min: 5, message: '详细地址至少5个字符' }
            ]"
          >
            <template #left-icon>
              <van-icon name="location" />
            </template>
          </van-field>
        </van-cell-group>

        <!-- 设置默认地址 -->
        <van-cell-group inset class="default-switch">
          <van-cell center>
            <template #title>
              <span class="switch-label">设为默认地址</span>
            </template>
            <template #right-icon>
              <van-switch v-model="formData.is_default" size="20" />
            </template>
          </van-cell>
        </van-cell-group>

        <!-- 提交按钮 -->
        <div class="button-group">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="submitting"
          >
            保存
          </van-button>
          
          <!-- 删除按钮（仅编辑时显示） -->
          <van-button
            v-if="isEdit"
            round
            block
            type="danger"
            plain
            @click="onDeleteCurrent"
            :loading="deleting"
          >
            删除地址
          </van-button>
        </div>
      </van-form>
    </div>

    <!-- 地区选择弹窗 -->
    <van-popup v-model:show="showAreaPicker" position="bottom" round>
      <van-area
        :area-list="areaList"
        :columns-num="3"
        @confirm="onAreaConfirm"
        @cancel="showAreaPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NavBar as VanNavBar,
  Icon as VanIcon,
  Form as VanForm,
  Field as VanField,
  CellGroup as VanCellGroup,
  Cell as VanCell,
  Button as VanButton,
  Switch as VanSwitch,
  Popup as VanPopup,
  Area as VanArea,
  showConfirmDialog,
  showToast,
} from 'vant'
import { getAddressList, addAddress, updateAddress, deleteAddress, type Address } from '@/api/address'
import { areaList } from '@/utils/area'
import { sanitizeInput } from '@/utils/validate'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const showAreaPicker = ref(false)
const isEdit = ref(false)
const currentAddressId = ref<number | null>(null)

// 表单数据
const formData = ref({
  contact_name: '',
  contact_phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  is_default: false,
})

// 地区文本
const areaText = computed(() => {
  if (formData.value.province && formData.value.city && formData.value.district) {
    return `${formData.value.province} ${formData.value.city} ${formData.value.district}`
  }
  return ''
})

// 验证姓名
const validateName = (value: string) => {
  const sanitized = sanitizeInput(value)
  if (sanitized !== value) return false
  
  // 只允许中文、英文、空格
  const nameReg = /^[\u4e00-\u9fa5a-zA-Z\s]{2,20}$/
  return nameReg.test(value)
}

// 加载地址详情（编辑模式）
const loadAddressDetail = async () => {
  try {
    loading.value = true
    const res = await getAddressList()
    
    if (res.code === 0 && res.data) {
      const address = res.data.find(item => item.id === currentAddressId.value)
      if (address) {
        formData.value = { ...address }
      }
    }
  } catch (error) {
    console.error('加载地址失败:', error)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

// 地区选择确认
const onAreaConfirm = ({ selectedOptions }: any) => {
  formData.value.province = selectedOptions[0]?.text || ''
  formData.value.city = selectedOptions[1]?.text || ''
  formData.value.district = selectedOptions[2]?.text || ''
  showAreaPicker.value = false
}

// 提交表单
const onSubmit = async () => {
  try {
    submitting.value = true

    // 数据清理
    const params = {
      contact_name: sanitizeInput(formData.value.contact_name),
      contact_phone: formData.value.contact_phone,
      province: formData.value.province,
      city: formData.value.city,
      district: formData.value.district,
      detail: sanitizeInput(formData.value.detail),
      is_default: formData.value.is_default,
    }

    console.log('提交地址参数:', params)

    let res
    if (isEdit.value && currentAddressId.value) {
      res = await updateAddress(currentAddressId.value, params)
    } else {
      res = await addAddress(params)
    }

    if (res.code === 0) {
      showToast(isEdit.value ? '修改成功' : '添加成功')
      setTimeout(() => {
        router.back()
      }, 500)
    }
  } catch (error) {
    console.error('保存地址失败:', error)
    showToast('保存失败')
  } finally {
    submitting.value = false
  }
}

// 删除当前地址
const onDeleteCurrent = () => {
  if (!currentAddressId.value) return

  showConfirmDialog({
    title: '提示',
    message: '确定要删除该地址吗？',
  })
    .then(async () => {
      try {
        deleting.value = true
        const res = await deleteAddress(currentAddressId.value!)
        
        if (res.code === 0) {
          showToast('删除成功')
          setTimeout(() => {
            router.back()
          }, 500)
        }
      } catch (error) {
        console.error('删除地址失败:', error)
        showToast('删除失败')
      } finally {
        deleting.value = false
      }
    })
    .catch(() => {})
}

// 选择地址（从订单页跳转过来）
const onSelectAddress = (address: Address) => {
  if (route.query.from === 'order') {
    // 返回订单页并传递地址
    router.back()
    // TODO: 通过事件总线或状态管理传递地址
  }
}

// 返回
const onBack = () => {
  router.back()
}

onMounted(() => {
  // 检查是否是编辑模式
  if (route.query.id) {
    isEdit.value = true
    currentAddressId.value = Number(route.query.id)
    loadAddressDetail()
  }
})
</script>

<style lang="scss" scoped>
.address-edit-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;

  .address-form {
    padding: 16px;

    :deep(.van-cell-group) {
      margin-bottom: 16px;
    }

    :deep(.van-field__left-icon) {
      margin-right: 12px;
      color: #969799;
    }

    .default-switch {
      .switch-label {
        font-size: 14px;
        color: #323233;
      }
    }

    .button-group {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>
