<template>
  <a-layout>
    <a-layout-header>
      <a-row style="text-align: center">
        <a-col :span="24">
          <nav>
            <router-link to="/">
              <a-button type="primary">Home</a-button>
            </router-link>
            <a-divider type="vertical" />
            <router-link to="/ready">
              <a-button type="primary">Phone</a-button>
            </router-link>
            <a-divider type="vertical" />
            <router-link to="/history">
              <a-button type="primary">Call History</a-button>
            </router-link>
          </nav>
        </a-col>
      </a-row>
    </a-layout-header>
    <a-layout-content class="content">
      <router-view />
    </a-layout-content>
    <a-layout-footer class="footer">
      <a-divider />
      <a-typography-paragraph>InPhone - Dev Challenge</a-typography-paragraph>
    </a-layout-footer>
  </a-layout>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.footer {
  text-align: center;
}
.content {
  padding-top: 32px;
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
