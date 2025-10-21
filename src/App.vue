<script setup>
import graph from "./pages/graph/graph.vue";
</script>

<template>

   <div style = 'width:50%; height: 50vh;' @saveTopo ="saveTopo">
    <graph/>
  </div>

</template>

<style scoped>
body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}
</style>
