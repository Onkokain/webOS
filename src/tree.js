export const createLeaf = (id, kind) => ({ type: 'leaf', id, kind });

export const countLeaves = (node) => {
  if (!node) return 0;
  if (node.type === 'leaf') return 1;
  return countLeaves(node.first) + countLeaves(node.second);
};

export const getFirstLeafId = (node) => {
  if (!node) return null;
  if (node.type === 'leaf') return node.id;
  return getFirstLeafId(node.first) ?? getFirstLeafId(node.second);
};

export const getLeafDepth = (node, id, d = 0) => {
  if (!node) return null;
  if (node.type === 'leaf') return node.id === id ? d : null;
  return getLeafDepth(node.first, id, d + 1) ?? getLeafDepth(node.second, id, d + 1);
};

export const splitNode = (node, targetId, newLeaf, dir) => {
  if (!node) return null;
  if (node.type === 'leaf')
    return node.id === targetId ? { type: 'split', dir, ratio: 0.5, first: newLeaf, second: node } : node;
  return { ...node, first: splitNode(node.first, targetId, newLeaf, dir), second: splitNode(node.second, targetId, newLeaf, dir) };
};

export const removeNode = (node, id) => {
  if (!node) return null;
  if (node.type === 'leaf') return node.id === id ? null : node;
  const first = removeNode(node.first, id);
  const second = removeNode(node.second, id);
  if (!first) return second;
  if (!second) return first;
  return { ...node, first, second };
};

export const collectLeaves = (node, bounds, activeId, out = []) => {
  if (!node) return out;
  if (node.type === 'leaf') { out.push({ id: node.id, kind: node.kind, bounds, focused: node.id === activeId }); return out; }
  const { x, y, w, h } = bounds;
  if (node.dir === 'vertical') {
    collectLeaves(node.first, { x, y, w: w * node.ratio, h }, activeId, out);
    collectLeaves(node.second, { x: x + w * node.ratio, y, w: w * (1 - node.ratio), h }, activeId, out);
  } else {
    collectLeaves(node.first, { x, y, w, h: h * node.ratio }, activeId, out);
    collectLeaves(node.second, { x, y: y + h * node.ratio, w, h: h * (1 - node.ratio) }, activeId, out);
  }
  return out;
};
