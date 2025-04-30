<template>
  <div class="root">
    <item-panel class="itemPanel" :imgurl="imgurl" />
    <div :id="domId" ref="canvasPanel" class="canvasPanel" @dragover.prevent />

    <div id="configPanel" :class="{ hidden: !configVisible }">
      <div class="panel-title">
        <p>属性面板</p>
      </div>

      <el-collapse v-model="activeNames">
        <solt>
          <el-collapse-item title="设备信息" name="1"> </el-collapse-item>
        </solt>
        <el-collapse-item title="图片设置" name="2">
          <div class="form-item">
            <label>宽度</label> <el-input size="mini"></el-input>
          </div>
          <div class="form-item">
            <label>高度</label> <el-input size="mini"></el-input>
          </div>
          <div class="form-item">
            <label>图片地址</label> <el-input size="mini"></el-input>
          </div>
     
          
          
        </el-collapse-item>
        <el-collapse-item title="标题设置" name="3"> 
          <div class="form-item">
            <label>标题</label> <el-input size="mini"></el-input>
          </div>
          <div class="form-item">
            <label>字体大小</label> <el-input size="mini"></el-input>
          </div>
          <div class="form-item">
            <label>文本颜色</label> <el-input size="mini"></el-input>
          </div>
          <div class="form-item">
            <label>文本描边</label> <el-input size="mini"></el-input>
          </div>
        </el-collapse-item>
        
      </el-collapse>
      
      <div class="footerBtn">
        <el-button @click="configVisible = false">取消</el-button>
        <el-button class="save" @click="save">保存</el-button>
      </div>
    
    </div>

    <!-- <div
      v-if="tooltip && !isMouseDown"
      class="g6-tooltip"
      :style="`top: ${top}px; left: ${left}px;`"
    >
      id: {{ tooltip }}
    </div> -->
  </div>
</template>
<script>
import G6 from "@antv/g6";
import registerFactory from "../../components/graph/graph";
import ItemPanel from "./ItemPanel.vue";
import data from "./data";
// import data from "./data.js";
import { imgurl } from "../static/static";

export default {
  name: "graphVue",
  props: {
    imgurl: {
      type: Array,
      default: () => {
        return imgurl;
      },
    },
    domId: {
      type: String,
      default: () => {
        return "canvasPanel";
      },
    },
  },
  components: {
    ItemPanel,
  },
  data() {
    return {
      mode: "drag-shadow-node",
      graph: {},
      highLight: {
        undo: false,
        redo: false,
      },
      // 保存线条样式
      lineStyle: {
        type: "line",
        width: 1,
      },
      label: "",
      labelCfg: {
        fontSize: 12,
        style: {
          fill: "#fff",
        },
      },
      node: {
        fill: "",
        lineDash: "none",
        borderColor: "",
        width: 160,
        height: 60,
        shape: "rect-node",
      },
      activeNames: 1,
      headVisible: false,
      configVisible: false,
      isMouseDown: false,
      config: "",
      tooltip: "",
      top: 0,
      left: 0,
    };
  },
  mounted() {
    // 创建画布
    this.$nextTick(() => {
      this.createGraphic();
      this.initGraphEvent();
    });
  },
  beforeUnmount() {
    this.graph.destroy();
  },
  methods: {
    createGraphic() {
      const vm = this;
      const grid = new G6.Grid();
      const menu = new G6.Menu({
        offsetX: 5,
        offsetY: 5,
        itemTypes: ["node", "edge"],
        getContent() {
          const outDiv = document.createElement("div");
          outDiv.className = "contextmenu";
          outDiv.style.cursor = "pointer";
          outDiv.innerHTML = `
            <li id="editNode"> 编辑节点 </li>
            <li id="deleteNode"> 删除节点 </li>
           `;
          return outDiv;
        },
        handleMenuClick(target, item) {
          const { id } = target;

          if (id) {
            vm[id](item);
          }
        },
      });
      const minimap = new G6.Minimap({
        size: [200, 100],
        position: "bottom-right",
        delegateStyle: {
          fill: "#f5f5f5",
          stroke: "#c2c8cc",
        },
      });
      const cfg = registerFactory(G6, {
        width: this.$refs.canvasPanel.innerwidth,
        height: this.$refs.canvasPanel.innerHeight,
        // renderer: 'svg',
        layout: {
          type: "", // 位置将固定
        },
        // // 所有节点默认配置
        // defaultNode: {
        //   type: "rect-node",
        //   style: {
        //     lineDash: [1, 1],

        //     cursor: "move",
        //     fill: "#ecf3ff",
        //   },
        //   labelCfg: {
        //     fontSize: 20,
        //     style: {
        //       cursor: "move",
        //     },
        //   },
        // },
        // // 所有边的默认配置
        // defaultEdge: {
        //   type: "line-edge", // 扩展了内置边, 有边的事件
        //   style: {
        //     radius: 5,
        //     offset: 15,
        //     stroke: "#aab7c3",
        //     lineAppendWidth: 10, // 防止线太细没法点中
        //     endArrow: true,
        //   },
        // },
        // // 覆盖全局样式
        // nodeStateStyles: {
        //   "nodeState:default": {
        //     opacity: 1,
        //   },
        //   "nodeState:hover": {
        //     opacity: 0.8,
        //   },
        //   "nodeState:selected": {
        //     opacity: 0.9,
        //   },
        // },
        // // 默认边不同状态下的样式集合
        // edgeStateStyles: {
        //   "edgeState:default": {
        //     stroke: "#aab7c3",
        //   },
        //   "edgeState:selected": {
        //     stroke: "#1890FF",
        //   },
        //   "edgeState:hover": {
        //     animate: true,
        //     animationType: "dash",
        //     stroke: "#1890FF",
        //   },
        // },
        modes: {
          // 支持的 behavior
          default: [
            "drag-canvas",
            "drag-shadow-node",

            "canvas-event",
            "delete-item",
            // "select-node",
            "hover-node",
            "active-edge",
          ],
          originDrag: [
            "drag-canvas",
            "drag-node",
            "canvas-event",
            "delete-item",
            "select-node",
            "hover-node",
            "active-edge",
          ],
        },
        plugins: [menu, minimap, grid],
        // ... 其他G6原生入参
      });

      this.graph = new G6.Graph(cfg);
      this.graph.read(data); // 读取数据
      // this.graph.paint(); // 渲染到页面
      // this.graph.get('canvas').set('localRefresh', false); // 关闭局部渲染
      // this.graph.fitView();
    },
    // 初始化图事件
    initGraphEvent() {
      this.graph.on("drop", (e) => {
        const { originalEvent } = e;

        if (originalEvent.dataTransfer) {
          const transferData =
            originalEvent.dataTransfer.getData("dragComponent");

          if (transferData) {
            this.addNode(transferData, e);
          }
        }
      });

      this.graph.on("node:drop", (e) => {
        e.item.getOutEdges().forEach((edge) => {
          edge.clearStates("edgeState");
        });
      });

      this.graph.on("after-node-selected", (e) => {
        this.configVisible = !!e;
        if (e && e.item) {
          let modelcfg = {
            labelCfg: {
              fontSize: "12px",
              style: {
                fill: "red",
              },
            },
          };
          let model = e.item.get("model");
          model = { ...modelcfg, ...model };
          this.config = model;
          this.label = model.label;
          this.labelCfg = {
            fontSize: model.labelCfg.fontSize,
            style: {
              fill: model.labelCfg.style.fill,
            },
          };
          this.node = {
            fill: model.style.fill,
            borderColor: model.style.stroke,
            lineDash: model.style.lineDash || "none",
            width: model.style.width,
            height: model.style.height,
            shape: model.type,
          };
        }
      });

      this.graph.on("on-node-mouseenter", (e) => {
        if (e && e.item) {
          e.item.getOutEdges().forEach((edge) => {
            edge.clearStates("edgeState");
            edge.setState("edgeState", "hover");
          });
        }
      });

      // 鼠标拖拽到画布外时特殊处理
      this.graph.on("mousedown", () => {
        this.isMouseDown = true;
      });
      this.graph.on("mouseup", () => {
        this.isMouseDown = false;
      });
      this.graph.on("canvas:mouseleave", () => {
        this.graph.getNodes().forEach((x) => {
          const group = x.getContainer();

          group.clearAnchor();
          x.clearStates("anchorActived");
        });
      });

      this.graph.on("on-node-mousemove", (e) => {
        if (e && e.item) {
          this.tooltip = e.item.get("model").id;
          this.left = e.clientX + 20;
          this.top = e.clientY - 0;
        }
      });

      this.graph.on("on-node-mouseleave", (e) => {
        if (e && e.item) {
          this.tooltip = "";
          if (e && e.item) {
            e.item.getOutEdges().forEach((edge) => {
              edge.clearStates("edgeState");
            });
          }
        }
      });

      this.graph.on("before-node-removed", ({ target, callback }) => {
        console.log(target);
        setTimeout(() => {
          // 确认提示
          callback(true);
        }, 1000);
      });

      this.graph.on("after-node-dblclick", (e) => {
        if (e && e.item) {
          console.log(e.item);
        }
      });

      this.graph.on("after-edge-selected", (e) => {
        this.configVisible = !!e;

        if (e && e.item) {
          this.config = e.item.get("model").id;

          this.graph.updateItem(e.item, {
            // shape: 'line-edge',
            style: {
              radius: 10,
              lineWidth: 2,
            },
          });
        }
      });

      this.graph.on("on-edge-mousemove", (e) => {
        if (e && e.item) {
          this.tooltip = e.item.get("model").label;
          this.left = e.clientX + 40;
          this.top = e.clientY - 20;
        }
      });

      this.graph.on("on-edge-mouseleave", (e) => {
        if (e && e.item) {
          this.tooltip = "";
        }
      });

      this.graph.on(
        "before-edge-add",
        ({ source, target, sourceAnchor, targetAnchor }) => {
          setTimeout(() => {
            this.graph.addItem("edge", {
              id: `${+new Date() + (Math.random() * 10000).toFixed(0)}`, // edge id
              source: source.get("id"),
              target: target.get("id"),
              sourceAnchor,
              targetAnchor,
              // label:  'edge label',
            });
          }, 100);
        }
      );
    },
    changeMode() {
      if (this.mode === "drag-node") {
        this.mode = "drag-shadow-node";
        this.graph.setMode("default");
      } else {
        this.mode = "drag-node";
        this.graph.setMode("originDrag");
      }
    },
    deleteNode(item) {
      this.graph.removeItem(item);
    },
    editNode(){
      this.configVisible = true
    },
    // 添加节点
    addNode(transferData, { x, y }, comboId = "") {
      let { label, shape, fill, img, width, height, level } =
        JSON.parse(transferData);
      const model = {
        id: this.guid(),
        comboId: comboId,
        level,
        label: label ? label : " ",
        //   counts: [12, 11], //一般问题 和严重问题的数量
        width: Number(width),
        height: Number(height),
        type: "rect-node",
        img: img,
        style: {
          fill: fill || "",
          width: Number(width),
          height: Number(height),
        },
        // 坐标
        x,
        y,
      };

      this.graph.addItem("node", model);
    },
    save() {
      window.alert("我觉得就算我不写你也会了");
    },
    guid() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.root {
  display: flex;
  position: relative;
  width: 100%;
  height: 100%; //calc(100vh - 50px);
  .itemPanel {
    flex-basis: 300px;
  }
  .canvasPanel {
    flex: 1;

    ::v-deep(.g6-component-contextmenu) {
      padding: 0px;
      .contextmenu {
        padding: 10px 2px;
        font-size: 14px;
        text-align: left;
        display: flex;
        flex-direction: column;
        li {
          flex: 1;
          margin: 0px;
          list-style: none;
          text-align: left;
          padding: 5px 10px;
        }
        li:hover {
          background: #ededed;
        }
      }
    }
  }
  .hidden{
    display: none;
  }
  ::v-deep(.g6-minimap) {
    position: absolute;
    right: 0;
    bottom: 0;
    background: #fff;
  }

  #configPanel {
    width: 350px;
    position: absolute;
    top: 0px;
    right: 0px;
    background: white;
    height: 100%;
    border-left: 1px solid #c3c3c3;
    padding: 10px;
    .panel-title {
      font-weight: 500;
    }
    .form-item{
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      label{
        flex-basis: 80px;
      }

    }
  }
  .footerBtn{
    margin-top: 10px;
    text-align: center;
  }
}
/* 提示框的样式 */
.g6-tooltip {
  position: fixed;
  top: 0;
  left: 0;
  font-size: 12px;
  color: #545454;
  border-radius: 4px;
  border: 1px solid #e2e2e2;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: rgb(174, 174, 174) 0 0 10px;
  padding: 10px 8px;
}
</style>
