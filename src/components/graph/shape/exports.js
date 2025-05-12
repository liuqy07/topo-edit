import registerBaseNode from './nodes/base-node';
import registerNode from './node';
import  registerCombo  from './combo/base-combo';

export default (G6) => {
  // 先注册基础节点
  registerBaseNode(G6);
  registerNode(G6);
  registerCombo(G6);
};
