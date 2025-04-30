import graph from "./pages/graph/graph.vue";

graph.install = (app) => {
  app.component("topo-graph", graph); // 注册为全局组件，自定义组件名
};

export { graph };
