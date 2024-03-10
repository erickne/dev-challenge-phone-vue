<template>
  <nav>
    <router-link to="/">
      <a-button type="primary">Home</a-button>
    </router-link>
    <a-divider type="vertical" />
    <router-link to="/ready">
      <a-button type="primary">Ready</a-button>
    </router-link>
  </nav>
  <router-view />
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
<script setup lang="ts"></script>
