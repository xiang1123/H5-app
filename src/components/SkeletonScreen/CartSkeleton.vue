<template>
  <div class="cart-skeleton">
    <div v-for="i in 5" :key="i" class="cart-item">
      <van-skeleton :row="3" :row-width="['100%', '80%', '60%']" />
    </div>
    <div class="cart-footer">
      <van-skeleton :row="1" :row-height="'50px'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton as VanSkeleton } from 'vant'
</script>

<style lang="scss" scoped>
.cart-skeleton {
  padding: 16px;
  background-color: #f5f5f5;

  .cart-item {
    margin-bottom: 12px;
    padding: 12px;
    background-color: #fff;
    border-radius: 8px;
  }

  .cart-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background-color: #fff;
  }
}
</style>
