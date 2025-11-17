<template>
  <div class="category-skeleton">
    <div class="left-nav">
      <van-skeleton v-for="i in 10" :key="i" :row="1" class="nav-item" />
    </div>
    <div class="right-content">
      <van-skeleton v-for="i in 6" :key="i" :row="2" class="content-item" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton as VanSkeleton } from 'vant'
</script>

<style lang="scss" scoped>
.category-skeleton {
  display: flex;
  height: 100vh;

  .left-nav {
    width: 90px;
    background-color: #f5f5f5;
    overflow-y: auto;

    .nav-item {
      padding: 16px 12px;
      border-bottom: 1px solid #eee;
    }
  }

  .right-content {
    flex: 1;
    padding: 16px;
    background-color: #fff;
    overflow-y: auto;

    .content-item {
      margin-bottom: 16px;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
  }
}
</style>
