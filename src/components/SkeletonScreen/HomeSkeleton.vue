<template>
  <div class="home-skeleton">
    <!-- 搜索栏骨架 -->
    <div class="search-skeleton">
      <van-skeleton :row="1" :row-width="'100%'" />
    </div>

    <!-- 轮播图骨架 -->
    <div class="banner-skeleton">
      <van-skeleton :row="1" :row-height="'180px'" />
    </div>

    <!-- 导航图标骨架 -->
    <div class="nav-skeleton">
      <van-skeleton :row="2" :row-width="['100%', '100%']" />
    </div>

    <!-- 秒杀区域骨架 -->
    <div class="seckill-skeleton">
      <van-skeleton title :row="1" :row-height="'100px'" />
    </div>

    <!-- 商品列表骨架 -->
    <div class="goods-skeleton">
      <van-skeleton v-for="i in 4" :key="i" title :row="3" class="goods-item" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton as VanSkeleton } from 'vant'
</script>

<style lang="scss" scoped>
.home-skeleton {
  padding: 16px;
  background-color: #f5f5f5;

  .search-skeleton {
    margin-bottom: 16px;
    padding: 12px;
    background-color: #fff;
    border-radius: 8px;
  }

  .banner-skeleton {
    margin-bottom: 16px;
    border-radius: 8px;
    overflow: hidden;
  }

  .nav-skeleton {
    margin-bottom: 16px;
    padding: 16px;
    background-color: #fff;
    border-radius: 8px;
  }

  .seckill-skeleton {
    margin-bottom: 16px;
    padding: 16px;
    background-color: #fff;
    border-radius: 8px;
  }

  .goods-skeleton {
    .goods-item {
      margin-bottom: 12px;
      padding: 12px;
      background-color: #fff;
      border-radius: 8px;
    }
  }
}
</style>
