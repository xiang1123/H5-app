<template>
  <div class="user-skeleton">
    <!-- 用户信息骨架 -->
    <div class="user-info-skeleton">
      <van-skeleton avatar :row="2" />
    </div>

    <!-- 订单骨架 -->
    <div class="order-skeleton">
      <van-skeleton title :row="1" />
    </div>

    <!-- 菜单列表骨架 -->
    <div class="menu-skeleton">
      <van-skeleton v-for="i in 8" :key="i" :row="1" class="menu-item" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton as VanSkeleton } from 'vant'
</script>

<style lang="scss" scoped>
.user-skeleton {
  background-color: #f5f5f5;

  .user-info-skeleton {
    padding: 24px 16px;
    background: linear-gradient(135deg, #e93b3d 0%, #ff6b6b 100%);
  }

  .order-skeleton {
    margin: 12px 0;
    padding: 16px;
    background-color: #fff;
  }

  .menu-skeleton {
    background-color: #fff;

    .menu-item {
      padding: 16px;
      border-bottom: 1px solid #f5f5f5;
    }
  }
}
</style>
