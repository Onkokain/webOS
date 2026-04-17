import { useRef, useState } from "react";
import { fsRename } from "../utils/fsUtils";

const W = 72,
  H = 84;

export function useDesktopDrag(entries, root, setFs, setSelected, selected) {
  const ref = useRef(null);
  const dragState = useRef(null);
  const bandState = useRef(null);
  const [positions, setPositions] = useState({});
  const [band, setBand] = useState(null);

  const getPos = (path) =>
    positions[path] ?? entries.find((e) => e.path === path) ?? { x: 0, y: 0 };

  const onIconMouseDown = (e, path) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const newSel = e.shiftKey
      ? new Set([...selected, path])
      : selected.has(path)
        ? selected
        : new Set([path]);
    setSelected(newSel);
    const paths = [...newSel];
    const startPos = Object.fromEntries(paths.map((p) => [p, getPos(p)]));
    dragState.current = {
      paths,
      startMouse: { x: e.clientX, y: e.clientY },
      startPos,
      moved: false,
    };

    const onMove = (me) => {
      const dx = me.clientX - dragState.current.startMouse.x;
      const dy = me.clientY - dragState.current.startMouse.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragState.current.moved = true;
      if (!dragState.current.moved) return;
      setPositions((prev) => ({
        ...prev,
        ...Object.fromEntries(
          paths.map((p) => [
            p,
            { x: startPos[p].x + dx, y: startPos[p].y + dy },
          ]),
        ),
      }));
    };

    const onUp = (ue) => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (!dragState.current?.moved) return;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const dropX = ue.clientX - rect.left,
        dropY = ue.clientY - rect.top;
      const target = entries.find(
        (e) =>
          e.type === "dir" &&
          !paths.includes(e.path) &&
          dropX >= e.x &&
          dropX <= e.x + W &&
          dropY >= e.y &&
          dropY <= e.y + H,
      );
      if (target) {
        setFs((prev) => {
          let n = { ...prev };
          paths.forEach((p) => {
            const name = p.slice(root.length).replace(/\/$/, "");
            const newPath =
              target.path + name + (prev[p]?.type === "dir" ? "/" : "");
            n = fsRename(n, p, newPath);
          });
          return n;
        });
        setPositions((prev) => {
          const n = { ...prev };
          paths.forEach((p) => delete n[p]);
          return n;
        });
        setSelected(new Set());
      }
      dragState.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onBgMouseDown = (e, onClear) => {
    if (e.button !== 0) return;
    if (!e.shiftKey) setSelected(new Set());
    onClear?.();
    const rect = ref.current.getBoundingClientRect();
    const x0 = e.clientX - rect.left,
      y0 = e.clientY - rect.top;
    bandState.current = { x0, y0 };

    const onMove = (me) => {
      const x2 = me.clientX - rect.left,
        y2 = me.clientY - rect.top;
      setBand({
        x: Math.min(x0, x2),
        y: Math.min(y0, y2),
        w: Math.abs(x2 - x0),
        h: Math.abs(y2 - y0),
      });
      const [minX, maxX, minY, maxY] = [
        Math.min(x0, x2),
        Math.max(x0, x2),
        Math.min(y0, y2),
        Math.max(y0, y2),
      ];
      const hit = new Set(
        entries
          .filter(
            (en) =>
              en.x + W > minX && en.x < maxX && en.y + H > minY && en.y < maxY,
          )
          .map((en) => en.path),
      );
      setSelected(e.shiftKey ? new Set([...selected, ...hit]) : hit);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      setBand(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return { ref, positions, setPositions, band, onIconMouseDown, onBgMouseDown };
}
