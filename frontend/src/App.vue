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

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
