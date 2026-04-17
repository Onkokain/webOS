import { useEffect, useRef, useState } from "react";
import {
  createLeaf,
  countLeaves,
  getFirstLeafId,
  getLeafDepth,
  splitNode,
  removeNode,
  collectLeaves,
} from "../utils/tree";

const BOUNDS = { x: 0, y: 0, w: 100, h: 100 };
const TOTAL_WINDOWS = 8;
const SINGLE_WINDOW = ["camera", "help", "files", "browser", "settings"];

function swapIds(node, idA, idB) {
  if (!node) return null;
  if (node.type === "leaf") {
    if (node.id === idA) return { ...node, id: idB };
    if (node.id === idB) return { ...node, id: idA };
    return node;
  }
  return {
    ...node,
    first: swapIds(node.first, idA, idB),
    second: swapIds(node.second, idA, idB),
  };
}

export function useWindowManager() {
  const [tree, setTree] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [floating, setFloating] = useState([]);
  const [registry, setRegistry] = useState({});
  const [dragOverId, setDragOverId] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const idRef = useRef(1);
  const dragTile = useRef(null);
  const screenRef = useRef(null);

  const openWindow = (kind, currentActiveId) => {
    const id = idRef.current++;
    setTree((prev) => {
      if (countLeaves(prev) >= TOTAL_WINDOWS) {
        idRef.current--;
        return prev;
      }
      if (
        SINGLE_WINDOW.includes(kind) &&
        collectLeaves(prev, BOUNDS, null).some((l) => l.kind === kind)
      ) {
        idRef.current--;
        return prev;
      }
      const leaf = createLeaf(id, kind);
      if (!prev) return leaf;
      const targetId = currentActiveId ?? getFirstLeafId(prev);
      const dir =
        (getLeafDepth(prev, targetId) ?? 0) % 2 === 0
          ? "vertical"
          : "horizontal";
      return splitNode(prev, targetId, leaf, dir);
    });
    setRegistry((prev) => ({ ...prev, [id]: kind }));
    setActiveId(id);
  };

  const closeWindow = (id) => {
    setRegistry((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    if (floating.some((f) => f.id === id)) {
      setFloating((prev) => prev.filter((f) => f.id !== id));
      setActiveId((prev) => (prev === id ? null : prev));
      return;
    }
    setTree((prev) => {
      const leaves = collectLeaves(prev, BOUNDS, null);
      if (leaves.length <= 1) {
        setActiveId(null);
        return null;
      }
      const idx = leaves.findIndex((l) => l.id === id);
      setActiveId((leaves[idx + 1] ?? leaves[idx - 1]).id);
      return removeNode(prev, id);
    });
  };

  const floatWindow = (id) => {
    const leaves = collectLeaves(tree, BOUNDS, null);
    const win = leaves.find((l) => l.id === id);
    if (!win) return;
    const rect = screenRef.current?.getBoundingClientRect();
    const W = rect?.width ?? window.innerWidth;
    const H = rect?.height ?? window.innerHeight;
    setFloating((prev) => [
      ...prev,
      {
        id: win.id,
        kind: registry[win.id] ?? win.kind,
        x: W * 0.2,
        y: H * 0.15,
        w: W * 0.5,
        h: H * 0.6,
      },
    ]);
    setTree((prev) => {
      const leaves2 = collectLeaves(prev, BOUNDS, null);
      if (leaves2.length <= 1) {
        setActiveId(id);
        return null;
      }
      const idx = leaves2.findIndex((l) => l.id === id);
      setActiveId((leaves2[idx + 1] ?? leaves2[idx - 1]).id);
      return removeNode(prev, id);
    });
  };

  const tileWindow = (id) => {
    const win = floating.find((f) => f.id === id);
    if (!win) return;
    setFloating((prev) => prev.filter((f) => f.id !== id));
    setTree((prev) => {
      const leaf = createLeaf(id, win.kind);
      if (!prev) return leaf;
      const targetId = getFirstLeafId(prev);
      const dir =
        (getLeafDepth(prev, targetId) ?? 0) % 2 === 0
          ? "vertical"
          : "horizontal";
      return splitNode(prev, targetId, leaf, dir);
    });
    setActiveId(id);
  };

  const onTileHeaderMouseDown = (e, winId, tiledWindows) => {
    if (e.button !== 0) return;
    dragTile.current = {
      id: winId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };

    const onMove = (me) => {
      if (!dragTile.current) return;
      if (
        Math.abs(me.clientX - dragTile.current.startX) +
          Math.abs(me.clientY - dragTile.current.startY) >
        8
      ) {
        dragTile.current.moved = true;
        setDraggingId(winId);
      }
      if (!dragTile.current.moved) return;
      setDragPos({ x: me.clientX, y: me.clientY });
      const rect = screenRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = ((me.clientX - rect.left) / rect.width) * 100;
      const py = ((me.clientY - rect.top) / rect.height) * 100;
      const over = tiledWindows.find(
        (l) =>
          l.id !== winId &&
          px >= l.bounds.x &&
          px <= l.bounds.x + l.bounds.w &&
          py >= l.bounds.y &&
          py <= l.bounds.y + l.bounds.h,
      );
      setDragOverId(over?.id ?? null);
    };

    const onUp = (ue) => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      setDragOverId(null);
      setDragPos(null);
      setDraggingId(null);
      if (!dragTile.current?.moved) {
        dragTile.current = null;
        return;
      }
      const rect = screenRef.current?.getBoundingClientRect();
      if (!rect) {
        dragTile.current = null;
        return;
      }
      const px = ((ue.clientX - rect.left) / rect.width) * 100;
      const py = ((ue.clientY - rect.top) / rect.height) * 100;
      const target = tiledWindows.find(
        (l) =>
          l.id !== winId &&
          px >= l.bounds.x &&
          px <= l.bounds.x + l.bounds.w &&
          py >= l.bounds.y &&
          py <= l.bounds.y + l.bounds.h,
      );
      if (target) {
        setTree((prev) => swapIds(prev, winId, target.id));
        setActiveId(winId);
      }
      dragTile.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onFloatHeaderMouseDown = (e, id) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setActiveId(id);
    const win = floating.find((f) => f.id === id);
    const ox = e.clientX - win.x,
      oy = e.clientY - win.y;
    const onMove = (me) =>
      setFloating((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, x: me.clientX - ox, y: me.clientY - oy } : f,
        ),
      );
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onFloatResize = (e, id) => {
    e.stopPropagation();
    const win = floating.find((f) => f.id === id);
    const startX = e.clientX,
      startY = e.clientY,
      startW = win.w,
      startH = win.h;
    const onMove = (me) =>
      setFloating((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                w: Math.max(200, startW + me.clientX - startX),
                h: Math.max(150, startH + me.clientY - startY),
              }
            : f,
        ),
      );
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const tiledWindows = collectLeaves(tree, BOUNDS, activeId);

  return {
    tree,
    activeId,
    setActiveId,
    floating,
    registry,
    dragOverId,
    dragPos,
    draggingId,
    screenRef,
    openWindow,
    closeWindow,
    floatWindow,
    tileWindow,
    onTileHeaderMouseDown,
    onFloatHeaderMouseDown,
    onFloatResize,
    tiledWindows,
  };
}
