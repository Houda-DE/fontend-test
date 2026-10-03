<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <main class="vite-home">
    <div>
      <a href="https://vite.dev" target="_blank" rel="noreferrer">
        <svg class="logo vite" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 257" aria-label="Vite">
          <path fill="#41D1FF" d="M255.9 36.4 151.6 241.8c-2.4 4.8-9.2 4.8-11.6 0L.6 36.4c-2.7-5.2 1.2-11.5 7-10.9l118.7 21a4.3 4.3 0 0 0 1.5 0l118.5-21c5.8-.6 9.7 5.7 7.1 10.9Z"/>
          <path fill="#FFEA81" d="m185.7 24.5-89.7 16.4-.5 0c-5.2.9-8 6.1-6 11.2l47.5 121.5c1.1 2.7 4.6 2.7 5.7 0l47.4-121.5c2-5.2-.9-10.3-6.1-11.2l-.3-.4Z"/>
        </svg>
      </a>
      <a href="https://vuejs.org/" target="_blank" rel="noreferrer">
        <svg class="logo vue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 230" aria-label="Vue">
          <path fill="#41B883" d="M204.8 0H256L128 220 0 0h51.2L128 132.5 204.8 0Z"/>
          <path fill="#35495E" d="M204.8 0L128 132.5 51.2 0H102.4L128 66.3 153.6 0h51.2Z"/>
        </svg>
      </a>
    </div>

    <h1>Vite + Vue</h1>

    <div class="card">
      <button type="button" @click="count++">count is {{ count }}</button>
      <p>
        Edit <code>src/pages/HomePage.vue</code> to test HMR
      </p>
    </div>

    <p>
      Check out
      <a href="https://vitejs.dev" target="_blank" rel="noreferrer">Vite Documentation</a>
      and
      <a href="https://vuejs.org/guide/introduction.html" target="_blank" rel="noreferrer">Vue 3 Documentation</a>
      for more.
    </p>

    <h3>Recommended IDE Setup</h3>
    <ul class="ide-setup">
      <li>
        <a href="https://code.visualstudio.com/" target="_blank" rel="noreferrer">VS Code</a> +
        <a href="https://marketplace.visualstudio.com/items?itemName=Vue.volar" target="_blank" rel="noreferrer">Vue (Official)</a>
      </li>
    </ul>

    <h3>Customize configuration</h3>
    <p>
      See <a href="https://vitejs.dev/config/" target="_blank" rel="noreferrer">Vite Configuration Reference</a>.
    </p>

    <p class="type-note">
      Note: Vue language support in Volar is powered by TypeScript. If you want editor support for
      <code>.vue</code> templates, follow the
      <a href="https://vuejs.org/guide/scaling-up/tooling.html#editor-support" target="_blank" rel="noreferrer">docs</a>.
    </p>

    <p class="create-note">
      Scaffolded with <a href="https://github.com/vuejs/create-vue" target="_blank" rel="noreferrer">create-vue</a>.
    </p>
  </main>
</template>

<style scoped>
.vite-home {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  color: var(--text, #213547);
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.card {
  padding: 2em;
}
.card button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: var(--surface-sunken, #f9f9f9);
  color: inherit;
  cursor: pointer;
  transition: border-color 0.25s;
}
.card button:hover {
  border-color: #646cff;
}
.vite-home > p {
  color: #888;
}
ul.ide-setup {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
}
.type-note, .create-note {
  color: #888;
}
a {
  color: var(--link, #646cff);
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
</style>
