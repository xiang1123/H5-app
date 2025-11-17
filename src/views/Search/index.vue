<template>
  <div class="search-page">
    <van-nav-bar title="搜索" left-arrow @click-left="onBack" fixed placeholder />

    <div class="search-content">
      <van-search
        v-model="searchValue"
        placeholder="请输入搜索关键词"
        show-action
        @search="onSearch"
      >
        <template #action>
          <div @click="onSearch">搜索</div>
        </template>
      </van-search>

      <!-- 搜索历史 -->
      <div v-if="!searchValue" class="search-history">
        <div class="history-header">
          <span class="title">搜索历史</span>
          <van-icon name="delete-o" @click="clearHistory" />
        </div>
        <div class="history-tags">
          <van-tag v-for="item in historyList" :key="item" plain @click="searchValue = item">
            {{ item }}
          </van-tag>
        </div>
      </div>

      <!-- 热门搜索 -->
      <div v-if="!searchValue" class="hot-search">
        <div class="hot-header">
          <span class="title">热门搜索</span>
        </div>
        <div class="hot-tags">
          <van-tag v-for="item in hotList" :key="item" color="#fff7f0" text-color="#e93b3d">
            {{ item }}
          </van-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NavBar as VanNavBar,
  Search as VanSearch,
  Icon as VanIcon,
  Tag as VanTag,
} from 'vant'

const router = useRouter()
const searchValue = ref('')
const historyList = ref(['手机', '电脑', '耳机'])
const hotList = ref(['iPhone 15', '小米14', '华为Mate60', 'AirPods', 'iPad'])

const onBack = () => {
  router.back()
}

const onSearch = () => {
  console.log('搜索:', searchValue.value)
}

const clearHistory = () => {
  historyList.value = []
}
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background-color: #f5f5f5;

  .search-content {
    padding: 16px;

    .search-history,
    .hot-search {
      margin-bottom: 24px;

      .history-header,
      .hot-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .title {
          font-size: 14px;
          font-weight: bold;
          color: #333;
        }
      }

      .history-tags,
      .hot-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  }
}
</style>
