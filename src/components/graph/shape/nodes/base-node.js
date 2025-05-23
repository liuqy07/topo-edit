/**
 * @author claude
 * @date 2020/3/15
 * @description 注册基础节点, 其他节点都在此基础上继承和扩展
 */

import itemEvents from "./item-event";
import anchorEvent from "./anchor-event";
// import defaultStyles from "../defaultStyles";
import { imgurl as imglist } from "@/pages/static/static.js";
// const { nodeStyles, anchorPointStyles, nodeLabelStyles } = defaultStyles;


/*
 * 注册基础node => 添加锚点/图标 => 绘制node => 初始化node状态 => node动画(设置交互动画)
 */
export default (G6) => {
  G6.registerNode(
    "base-node",
    {
      // getShapeStyle(cfg) {
      //   const width = cfg.width || 80;
      //   const height = cfg.height || 40;
        
      //   return getStyle.call(
      //     this,
      //     {
      //       width,
      //       height,
      //       radius: 5,
      //       // 将图形中心坐标移动到图形中心, 用于方便鼠标位置计算
      //       x: -width / 2,
      //       y: -height / 2,
      //     },
      //     cfg
      //   );
      // },

      // 绘制锚点
      initAnchor(cfg, group) {
        group.anchorShapes = [];
        group.showAnchor = () => {
          this.drawAnchor(cfg, group);
        };
        group.clearAnchor = () => {
          if (group.anchorShapes) {
            const line = group.$getItem("dashed-line");

            if (line) {
              line.remove();
            }
            group.anchorShapes.forEach((a) => a.remove());
          }
          group.anchorShapes = [];
        };
      },
      drawAnchor(cfg, group) {
        const { type, direction, anchorPointStyles } = group.getFirst().attr();
        const item = group.get("children")[0];
        const bBox = item.getBBox();
        const anchors = this.getAnchorPoints(cfg);

        // 绘制锚点坐标
        anchors &&
          anchors.forEach((p, i) => {
            const diff =
              type === "triangle-node" ? (direction === "up" ? 1 : 0) : 0.5;
            const x = bBox.width * (p[0] - 0.5);
            const y = bBox.height * (p[1] - diff);

            /**
             * 绘制三层锚点
             * 最底层: 锚点bg
             * 中间层: 锚点
             * 最顶层: 锚点group, 用于事件触发
             */
            // 视觉锚点
            const anchor = group.addShape("circle", {
              attrs: {
                x,
                y,
                ...anchorPointStyles,
              },
              zIndex: 1,
              nodeId: group.get("id"),
              className: "node-anchor",
              draggable: true,
              isAnchor: true,
              index: i,
            });

            // 锚点事件触发的元素
            const anchorGroup = group.addShape("circle", {
              attrs: {
                x,
                y,
                r: 11,
                fill: "#000",
                opacity: 0,
              },
              zIndex: 2,
              nodeId: group.get("id"),
              className: "node-anchor-group",
              draggable: true,
              isAnchor: true,
              index: i,
            });

            /**
             * 添加锚点事件绑定
             */
            anchorEvent(anchorGroup, group, p);

            group.anchorShapes.push(anchor);
            group.anchorShapes.push(anchorGroup);
          });

        // 查找所有锚点
        group.getAllAnchors = () => {
          return group.anchorShapes.filter((c) => c.get("isAnchor") === true);
        };
        // 查找指定锚点
        group.getAnchor = (i) => {
          return group.anchorShapes.filter(
            (c) => c.get("className") === "node-anchor" && c.get("index") === i
          );
        };
        // 查找所有锚点背景
        group.getAllAnchorBg = () => {
          return group.anchorShapes.filter(
            (c) => c.get("className") === "node-anchor-bg"
          );
        };
      },
      /* 添加文本节点 */
      /* https://g6.antv.vision/zh/docs/manual/advanced/keyconcept/shape-and-properties/#%E6%96%87%E6%9C%AC-text */
      addLabel(cfg, group, attrs) {
        const { label, labelCfg, labels } = attrs;
        // 字体小于12时 svg会报错
        /* if (labelCfg && labelCfg.fontSize < 12) {
        labelCfg.fontSize = 12;
      } */

        // 多行文本
        if (labels) {
          labels.forEach((item) => {
            const {
              label,
              labelCfg: { maxlength },
              className,
            } = item;

            let text = maxlength ? label.substr(0, maxlength) : label || "";

            if (label.length > maxlength) {
              text = `${text}...`;
            }

            group.addShape("text", {
              attrs: {
                text,
                ...item,
                ...item.labelCfg,
                ...item.labelCfg.style,
              },
              className: `node-text ${className}`,
              draggable: true,
            });
          });
        } else if (label) {
          const { maxlength } = labelCfg;

          let text = maxlength ? label.substr(0, maxlength) : label || "";

          if (label.length > maxlength) {
            text = `${text}...`;
          }

          group.addShape("text", {
            attrs: {
              text,
              x: 0,
              y: 0,
              ...labelCfg,
              ...labelCfg.style,
            },
            className: "node-text",
            draggable: true,
          });
        }
      },
      drawModelRect(group, attrs) {
        const { preRect, width, height } = attrs;
        const $preRect = {
          show: true, // 是否显示左侧方条
          width: 4,
          fill: "#40a9ff",
          radius: 2,
        };

        if (!preRect || preRect.show !== false) {
          group.addShape("rect", {
            attrs: {
              x: -width / 2,
              y: -height / 2,
              height,
              ...$preRect,
              ...preRect,
            },
            draggable: true,
          });
        }
      },

      drawImg(cfg) {
        let img = "";
        if (cfg.img.includes("/")) {
          try {
            img = cfg.img.split("/").pop();
          } catch {
            let imgsrc = imglist.find((item) => item.level == cfg.name)?.imgsrc;
            img = imgsrc ? imgsrc : "olt_1.png";
          }
        } else {
          img = cfg.img;
        }
        const imgurl = `@/assets/images/topo/${img}`;
        return new URL(imgurl.replace("@", "/src"), import.meta.url).href;
      },
      /* 绘制节点，包含文本 */
      draw(cfg, group) {
        return this.drawShape(cfg, group);
      },
      /* 绘制节点，包含文本 */
      drawShape(cfg, group) {
        // 元素分组
        // 合并外部样式和默认样式
        // 获取节点样式
        
        const attrs = this.getShapeStyle(cfg, group);

        console.log("attrs", attrs);
        // 添加节点
        const shape = group.addShape(this.shapeType, {
          // shape 属性在定义时返回
          className: `${this.shapeType}-shape`,
          xShapeNode: true, // 自定义节点标识
          draggable: true,
          attrs,
        });

        // 给 group 添加自定义方法 按className查找元素
        group.$getItem = (className) => {
          return group
            .get("children")
            .find((item) => item.get("className") === className);
        };

        if (this.type === "modelRect-node") {
          this.drawModelRect(group, attrs);
        }
        // 添加文本节点
        this.addLabel(cfg, group, attrs);
  
        // 添加锚点
        this.initAnchor(cfg, group);
        // 添加图标
        if (cfg.img) {
          let img = this.drawImg(cfg);
          let { width, height } = attrs;
        
          let imgShape=  group.addShape("image", {
            className: `${this.shapeType}-image`,
            attrs: {
              x: -width / 2,
              y: -height / 2,
              width: width,
              height: height,
              img: img,
              opacity: 1,
              clipCfg: {
                show: false,
                type: "circle",
                r: 50,
              },
            },
            draggable: true,
          });
          imgShape.toFront()
        }
     
        return shape;
      },
      /* 更新节点，包含文本 */
      update(cfg, node) {
        const model = node.get("model");
        let  { attrs } =  node.get("keyShape");
        const group = node.get("group");
        const text = group.$getItem("node-text");
        const item = group.get("children")[0];
        group.anchorShapes.forEach((a) => a.remove());
        const imgShape = group.$getItem(`${this.shapeType}-image`);
        attrs.width = Number(cfg.width)
        attrs.height = Number(cfg.height)
        attrs.style.width = Number(cfg.width)
        attrs.style.height = Number(cfg.height)
        let { height } = cfg;
        let position_y = 0;
        position_y = height / 2 + 12;
        
        if (imgShape) {
          let img = this.drawImg(cfg);
          imgShape.attr({
            img: img,
            x: -attrs.width/2,
            y: -attrs.height/2,
            width: attrs.width,
            height: attrs.height,
          });
        }
        // 更新文本内容
        text &&
          text.attr({
            y: position_y, 
            text: model.label,
            ...model.labelCfg.style,
          });
        // 更新节点属性
        // if (attrs.type === "diamond-node") {
        //   const path = this.getPath({
        //     style: {
        //       size: model.size,
        //     },
        //   });

        //   item.attr({
        //     ...attrs,
        //     ...model.style,
        //     path,
        //     width: model.size[0],
        //     height: model.size[1],
        //   });
        // } else {
          // const logoIcon = group
          //   .get("children")
          //   .find((x) => x.cfg.className === `${attrs.type}-logoIcon`);

          // if (logoIcon) {
          //   logoIcon.attr({ ...model.logoIcon });
          // }

          // const stateIcon = group
          //   .get("children")
          //   .find((x) => x.cfg.className === `${attrs.type}-stateIcon`);

          // if (stateIcon) {
          //   stateIcon.attr({ ...model.stateIcon });
          // }
         
          item.attr({
            x: -attrs.width/2,
            y: -attrs.height/2,
            width: attrs.width,
            height: attrs.height
          });
        
        // }
      },
      /* 设置节点的状态，主要是交互状态，业务状态请在 draw 方法中实现 */
      setState(name, value, item) {
        const buildInEvents = [
          "anchorShow",
          "anchorActived",
          "nodeState",
          "nodeState:default",
          "nodeState:selected",
          "nodeState:hover",
          "nodeOnDragStart",
          "nodeOnDrag",
          "nodeOnDragEnd",
        ];
        const group = item.getContainer();

        if (group.get("destroyed")) return;
        if (buildInEvents.includes(name)) {
          // 内部this绑定到了当前item实例
          itemEvents[name].call(this, value, group);
        } else if (this.stateApplying) {
          this.stateApplying.call(this, name, value, item);
        } else {
          console.warn(
            `warning: ${name} 事件回调未注册!\n可继承该节点并通过 stateApplying 方法进行注册\n如已注册请忽略 (-_-!)`
          );
        }
      },
      /* 获取锚点（相关边的连入点） */
      getAnchorPoints(cfg) {
        return (
          cfg.anchorPoints || [
            [0.5, 0],
            [1, 0.5],
            [0.5, 1],
            [0, 0.5],
          ]
        );
      },
    },
    "single-node"
  );
};
