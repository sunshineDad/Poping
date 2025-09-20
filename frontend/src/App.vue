<template>
  <div id="app">
    <!-- 路由视图 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 应用程序根组件
</script>

<style>
/* 全局样式 */
#app {
  min-height: 100vh;
}

/* 确保路由过渡动画流畅 */
.router-link-active {
  /* 可以在这里添加激活链接的样式 */
}

/* 滚动条样式已在全局style.css中定义 */
</style>
