export default (G6) => {
  G6.registerBehavior("canvas-event", {
    getDefaultCfg() {
      return {};
    },
    shouldBegin() {
      return true;
    },
    getEvents() {
      return {
       
        "canvas:mousemove": "onCanvasMouseMove",
        "canvas:mousedown": "onCanvasMouseDown",
        "canvas:mouseup": "onCanvasMouseUp",
        "canvas:dragend": "onCanvasDragEnd",
        // "drop": "onCanvasDrop", // 新增
        // "canvas:dragover": "onCanvasDragOver", // 新增
      };
    },

    onAllEvents(e) {
      console.log("Triggered event:", e?.name);
    },
    onCanvasMouseMove(e) {
      e.target.get("el").style.cursor = "grab";
    },
    onCanvasMouseDown(e) {
      e.target.get("el").style.cursor = "grabbing";
    },
    onCanvasMouseUp(e) {
      e.target.get("el").style.cursor = "grab";
    },
    onCanvasDragEnd(e) {
      ;
      e.target.get("el").style.cursor = "grab";
      this.graph.emit("on-canvas-dragend", e);
    },
    onCanvasDrop(e) {
      // 处理实际的 drop 逻辑
        e.preventDefault();
        this.graph.emit("canvas:drop", e)
    },
  });
};
