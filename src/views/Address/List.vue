<template>
  <div class="address-list-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="收货地址"
      left-arrow
      fixed
      placeholder
      @click-left="onBack"
    >
      <template #right>
        <van-icon name="plus" size="18" @click="onAdd" />
      </template>
    </van-nav-bar>

    <!-- 骨架屏 -->
    <div v-if="loading" class="skeleton-container">
      <van-skeleton title :row="3" class="skeleton-item" v-for="i in 3" :key="i" />
    </div>

    <!-- 地址列表 -->
    <div v-else-if="addressList.length > 0" class="address-list">
      <van-swipe-cell
        v-for="item in addressList"
        :key="item.id"
        class="address-item-wrapper"
      >
        <div class="address-item" @click="onSelectAddress(item)">
          <div class="address-info">
            <div class="contact-info">
              <span class="contact-name">{{ item.contact_name }}</span>
              <span class="contact-phone">{{ item.contact_phone }}</span>
              <van-tag v-if="item.is_default" type="danger" size="medium">默认</van-tag>
            </div>
            <div class="address-detail">
              {{ item.province }} {{ item.city }} {{ item.district }} {{ item.detail }}
            </div>
          </div>
          <div class="address-actions">
            <van-icon name="edit" size="20" @click.stop="onEdit(item)" />
          </div>
        </div>

        <!-- 左滑删除 -->
        <template #right>
          <van-button
            square
            type="danger"
            text="删除"
            class="delete-button"
            @click="onDelete(item)"
          />
        </template>
      </van-swipe-cell>
    </div>

    <!-- 空状态 -->
    <van-empty v-else description="暂无收货地址">
      <van-button round type="primary" class="empty-button" @click="onAdd">
        添加地址
      </van-button>
    </van-empty>

    <!-- 底部添加按钮 -->
    <div v-if="addressList.length > 0" class="bottom-button safe-area-bottom">
      <van-button type="primary" block round @click="onAdd">
        新增收货地址
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NavBar as VanNavBar,
  Icon as VanIcon,
  Tag as VanTag,
  Button as VanButton,
  Empty as VanEmpty,
  Skeleton as VanSkeleton,
  SwipeCell as VanSwipeCell,
  showConfirmDialog,
  showToast,
} from 'vant'
import { getAddressList, deleteAddress, type Address } from '@/api/address'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const addressList = ref<Address[]>([])
const isSelectMode = ref(false) // 是否是选择地址模式

// 加载地址列表
const loadAddressList = async () => {
  try {
    loading.value = true
    const res = await getAddressList()
    
    console.log('地址列表响应:', res)
    
    if (res.code === 0 && res.data) {
      addressList.value = res.data
      
      // 按默认地址排序，默认地址在前
      addressList.value.sort((a, b) => {
        if (a.is_default && !b.is_default) return -1
        if (!a.is_default && b.is_default) return 1
        return 0
      })
    }
  } catch (error) {
    console.error('加载地址列表失败:', error)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

// 返回
const onBack = () => {
  router.back()
}

// 添加地址
const onAdd = () => {
  router.push('/address/edit')
}

// 编辑地址
const onEdit = (address: Address) => {
  router.push({
    path: '/address/edit',
    query: { id: address.id }
  })
}

// 删除地址
const onDelete = (address: Address) => {
  showConfirmDialog({
    title: '提示',
    message: '确定要删除该地址吗？',
  })
    .then(async () => {
      try {
        const res = await deleteAddress(address.id)
        if (res.code === 0) {
          showToast('删除成功')
          // 重新加载列表
          await loadAddressList()
        }
      } catch (error) {
        console.error('删除地址失败:', error)
        showToast('删除失败')
      }
    })
    .catch(() => {})
}

// 选择地址（从订单页跳转过来时）
const onSelectAddress = (address: Address) => {
  if (route.query.from === 'order') {
    // 返回订单页，并传递选中的地址
    router.back()
    // 这里可以通过事件或状态管理传递地址信息
  }
}

onMounted(() => {
  // 检查是否是选择地址模式
  isSelectMode.value = route.query.from === 'order'
  
  loadAddressList()
})
</script>

<style lang="scss" scoped>
.address-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;

  .skeleton-container {
    padding: 16px;

    .skeleton-item {
      margin-bottom: 12px;
      padding: 16px;
      background-color: #fff;
      border-radius: 8px;
    }
  }

  .address-list {
    padding: 12px 16px;

    .address-item-wrapper {
      margin-bottom: 12px;
      border-radius: 8px;
      overflow: hidden;

      .address-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background-color: #fff;
        cursor: pointer;

        &:active {
          background-color: #f7f8fa;
        }

        .address-info {
          flex: 1;
          margin-right: 12px;

          .contact-info {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;

            .contact-name {
              font-size: 16px;
              font-weight: bold;
              color: #323233;
            }

            .contact-phone {
              font-size: 14px;
              color: #646566;
            }
          }

          .address-detail {
            font-size: 14px;
            color: #969799;
            line-height: 20px;
          }
        }

        .address-actions {
          flex-shrink: 0;

          .van-icon {
            color: #969799;
            cursor: pointer;

            &:active {
              color: #323233;
            }
          }
        }
      }

      .delete-button {
        height: 100%;
      }
    }
  }

  .empty-button {
    margin-top: 16px;
    width: 160px;
  }

  .bottom-button {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background-color: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  }
}
</style>
