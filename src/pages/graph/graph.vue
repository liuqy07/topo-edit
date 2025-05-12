<template>
  <div class="root">
    <el-button @click="clickgraph"> 123123 </el-button>
    <item-panel class="itemPanel" :imgurl="imgurl" />
    <div :id="domId" ref="canvasPanel" class="canvasPanel" @dragover.prevent />

    <el-drawer title="属性面板" v-model="configVisible" :direction="direction">
      <div id="configPanel">
        <el-collapse v-model="activeNames">
          <solt>
            <el-collapse-item title="设备信息" name="1"> </el-collapse-item>
          </solt>
          <el-collapse-item title="图片设置" name="2">
            <div class="form-item">
              <label>宽度</label>
              <el-input v-model="node.width" size="small"></el-input>
            </div>
            <div class="form-item">
              <label>高度</label>
              <el-input v-model="node.height" size="small"></el-input>
            </div>
            <div class="form-item">
              <!-- <label>图片地址</label> <el-input size="small"></el-input> -->
              <label>图片地址</label>
              <el-select v-model="node.img" placeholder="请选择">
                <el-option
                  v-for="(itemimglist, index) in imglistAll"
                  :key="index"
                  :label="itemimglist.level"
                  :value="itemimglist.imgsrc"
                  :change="changeingsrc(itemimglist)"
                >
                  <span style="float: left">{{ itemimglist.level }}</span>
                  <img
                    :src="getImageUrl(itemimglist.imgsrc)"
                    alt=""
                    style="
                      float: right;
                      color: #8492a6;
                      width: 20px;
                      margin-top: 10px;
                    "
                  />
                </el-option>
              </el-select>
            </div>
          </el-collapse-item>
          <el-collapse-item title="标题设置" name="3">
            <div class="form-item">
              <label>标题</label>
              <el-input v-model="node.label" size="small"></el-input>
            </div>
            <div class="form-item">
              <label>字体大小</label>
              <el-input
                v-model="labelCfg.style.fontSize"
                size="small"
              ></el-input>
            </div>
            <div class="form-item">
              <label>文本颜色</label>
              <el-input v-model="labelCfg.style.fill" size="small"></el-input>
            </div>
            <div class="form-item">
              <label>文本描边</label>
              <el-input v-model="labelCfg.style.stroke" size="small"></el-input>
            </div>
          </el-collapse-item>
        </el-collapse>

        <div class="footerBtn">
          <el-button @click="configVisible = false">取消</el-button>
          <el-button class="save" @click="save">保存</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import G6 from "@antv/g6";
import registerFactory from "../../components/graph/graph";
import ItemPanel from "./ItemPanel.vue";
import data from "./data";
// import data from "./data.js";
import { imglistAll as imglistAll1, imgurl } from "../static/static";

import { reactive, toRaw } from "vue";

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
      imglistAll1: imglistAll1,
      mode: "drag-shadow-node",
      dropCombo: false,
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
      labelCfg: reactive({
        style: {
          fontSize: 12,
          fill: "",
          fontWeight: 400,
          stroke: "",
        },
      }),
      configType: "node",
      node: reactive({
        label: "22",
        width: 40,
        height: 35,
        stroke: "",
        img: "",
      }),
      activeNames: 1,
      configVisible: false,
      direction: "rtl",
      isMouseDown: false,
      config: "",
      tooltip: "",
      top: 0,
      left: 0,
    };
  },
  computed: {
    configData() {
      return {
        ...this.node,
        labelCfg: this.labelCfg,
        // labelCfg: this.labelCfg,
      };
    },
    imglistAll() {
      return this.imglistAll1.filter((item) => {
        return item.level == this.node.level;
      });
    },
  },
  mounted() {
    // 创建画布
    this.$nextTick(() => {
      this.createGraphic();
      this.initGraphEvent();
      console.log("this===>", this.configData);
    });
  },
  beforeUnmount() {
    this.graph.destroy();
  },
  methods: {
    clickgraph() {
      let graphdata = this.graph.save();
      console.log("S", graphdata);
    },
    getImageUrl(name) {
      return new URL(`/src/assets/images/topo/${name}`, import.meta.url).href;
    },
    changeingsrc() {},
    deepToRaw(obj) {
      if (!obj || typeof obj !== "object") return obj;
      const rawObj = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        rawObj[key] = this.deepToRaw(toRaw(obj[key]));
      }
      return rawObj;
    },
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
        // groupByTypes: false,
        // renderer: 'svg',
        layout: {
          type: "", // 位置将固定
        },
        defaultCombo: {
          type: "base-combo-rect",
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
            "drag-node",
            "drag-shadow-node",
            // {
             "canvas-event",
             "drag-canvas",
              // enableDrop: true,
            // },
           
           
            "delete-item",
            "drag-combo",
            "hover-node",
            // 'hover-combo'
            // "active-edge",
          ],
          originDrag: [
            // "drag-canvas",
            // "drag-node",
            // "canvas-event",
            // "delete-item",
            // "select-node",
            // "hover-node",
            // "active-edge",

            {
              type: "canvas-event",
              enableDrop: true,
            },
            "drag-shadow-node",
            "drag-node",
            "canvas-event",
            "delete-item",

            "hover-node",

            "drag-combo",
            // "select-combo",
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
      // toRaw(this.graph.get("canvas")).cfg.droppable = true;
      // const canvas = toRaw(this.graph.get("canvas")).get("el");
      // canvas.setAttribute("droppable", "true");

      this.graph.on("drop", (e,i) => {
      debugger
        if (this.dropCombo) return;

        const { originalEvent } = e;

        if (originalEvent.dataTransfer) {
          const transferData =
            originalEvent.dataTransfer.getData("dragComponent");

          if (transferData) {
            this.addNode(transferData, e);
          }
        }
      });

      this.graph.on("combo:drop", (e) => {
        const { originalEvent } = e;
        if (originalEvent.dataTransfer) {
          const transferData =
            originalEvent.dataTransfer.getData("dragComponent");

          if (transferData) {
            let id = e.item.get("id");
            this.dropCombo = true;
            this.addNode(transferData, e, id);
            setTimeout(() => {
              this.dropCombo = false;
            }, 1000);
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

      console.log(this.graph.get("canvas"));
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
    editNode(e) {
      this.configVisible = true;
      this.visible = true;
      let model = e?._cfg.model;
      this.node = Object.assign(this.node, model);
      console.log("this.node ", this.node);
      // console.log("e",e)
    },
    // 添加节点
    addNode(transferData, { x, y }, comboId = "") {
      let shape = (JSON.parse(transferData)?.shape ?? "").toLocaleLowerCase();

      if (!shape.includes("combo")) {
        this.addimgNode(transferData, { x, y }, comboId);
      } else {
        this.addcombo(transferData, { x, y }, comboId);
      }
    },

    addimgNode(transferData, { x, y }, comboId) {
      let {
        label,
        shape = "img-node",
        fill,
        img,
        width,
        height,
        level,
      } = JSON.parse(transferData);
      const model = {
        id: this.guid(),
        comboId: comboId,
        level,
        label: label ? label : " ",
        labelCfg: toRaw(this.labelCfg),
        //   counts: [12, 11], //一般问题 和严重问题的数量
        width: Number(width),
        height: Number(height),
        type: shape,
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

    addcombo(transferData, { x, y }) {
      let {
        label,
        shape = "img-node",
        fill,
        width = 100,
        height = 100,
      } = JSON.parse(transferData);
      let model = {
        id: this.guid(),
        type: shape,
        // padding: [10, 10],
        size: [200, 200],
        width: 200,
        height: 200,
        stroke: "#999",
        fill: "#F8FAFE",
        style: {
          stroke: "#999",
          fill: "#F8FAFE",
          lineWidth: 1,
          lineDash: [1, 2],
        },
        label: "123123",
        labelCfg: {
          position: "top",
          refY: shape == "base-combo" ? -30 : 20,
          style: {
            fontSize: 12,
            fill: "#1890ff",
            stroke: "#1890ff",
            textAlign: "center",
          },
        },
        x,
        y,
      };

      let combo = this.graph.addItem("combo", model);
      let combo1 = this.graph.findById(combo.get("id"));
      this.graph.refreshItem(combo1); //刷新拖入的当前分组容器
    },
    async save() {
      // window.alert("我觉得就算我不写你也会了");
      await this.$nextTick();
      this.graph.refresh();
      let item = this.graph.findById(this.node.id);
      let model = this.deepToRaw(this.configData);
      console.log("model", model, item);
      // let newmodal = item.
      this.graph.updateItem(toRaw(item), model);
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
  .hidden {
    display: none;
  }
  ::v-deep(.g6-minimap) {
    position: absolute;
    right: 0;
    bottom: 0;
    background: #fff;
  }

  #configPanel {
    background: white;
    height: 100%;
    padding: 10px;

    .form-item {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      label {
        flex-basis: 80px;
      }
    }
  }
  .footerBtn {
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
