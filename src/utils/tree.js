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

export const getLeafDepth = (node, targetId, currentDepth = 0) => {
  if (!node) {
    return null;
  }
  
  if (node.type === 'leaf') {
    return node.id === targetId ? currentDepth : null;
  }
  
  const firstResult = getLeafDepth(node.first, targetId, currentDepth + 1);
  const secondResult = getLeafDepth(node.second, targetId, currentDepth + 1);
  
  return firstResult ?? secondResult;
};

export const splitNode = (node, targetId, newLeaf, splitDirection) => {
  if (!node) {
    return null;
  }
  
  if (node.type === 'leaf') {
    const isTargetNode = node.id === targetId;
    
    if (isTargetNode) {
      return {
        type: 'split',
        dir: splitDirection,
        ratio: 0.5,
        first: newLeaf,
        second: node
      };
    }
    
    return node;
  }
  
  return {
    ...node,
    first: splitNode(node.first, targetId, newLeaf, splitDirection),
    second: splitNode(node.second, targetId, newLeaf, splitDirection)
  };
};

export const removeNode = (node, targetId) => {
  if (!node) {
    return null;
  }
  
  if (node.type === 'leaf') {
    return node.id === targetId ? null : node;
  }
  
  const firstResult = removeNode(node.first, targetId);
  const secondResult = removeNode(node.second, targetId);
  
  if (!firstResult) {
    return secondResult;
  }
  
  if (!secondResult) {
    return firstResult;
  }
  
  return { ...node, first: firstResult, second: secondResult };
};

export const collectLeaves = (node, bounds, activeId, outputArray = []) => {
  if (!node) {
    return outputArray;
  }
  
  if (node.type === 'leaf') {
    outputArray.push({
      id: node.id,
      kind: node.kind,
      bounds,
      focused: node.id === activeId
    });
    return outputArray;
  }
  
  const { x, y, w, h } = bounds;
  const isVerticalSplit = node.dir === 'vertical';
  
  if (isVerticalSplit) {
    const firstWidth = w * node.ratio;
    const secondWidth = w * (1 - node.ratio);
    
    collectLeaves(node.first, { x, y, w: firstWidth, h }, activeId, outputArray);
    collectLeaves(node.second, { x: x + firstWidth, y, w: secondWidth, h }, activeId, outputArray);
  } else {
    const firstHeight = h * node.ratio;
    const secondHeight = h * (1 - node.ratio);
    
    collectLeaves(node.first, { x, y, w, h: firstHeight }, activeId, outputArray);
    collectLeaves(node.second, { x, y: y + firstHeight, w, h: secondHeight }, activeId, outputArray);
  }
  
  return outputArray;
};
