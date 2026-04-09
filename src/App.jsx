import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createLeaf, countLeaves, getFirstLeafId, getLeafDepth, splitNode, removeNode, collectLeaves } from './utils/tree';
import Cli from './apps/cmd';
import Notepad from './apps/notepad';
import Camera from './apps/camera';
import Help from './apps/help';
import Desktop from './apps/desktop';
import Taskbar from './apps/taskbar';
import Login from './apps/login';
import FileManager from './apps/filemanager';
import Browser from './apps/browser';
import Settings from './apps/settings';

const TOTAL_WINDOWS = 8;
const BOUNDS = { x: 0, y: 0, w: 100, h: 100 };
const SINGLE_WINDOW = ['camera', 'help', 'settings'];

function swapIds(node, idA, idB) {
  if (!node) return null;
  if (node.type === 'leaf') {
    if (node.id === idA) return { ...node, id: idB };
    if (node.id === idB) return { ...node, id: idA };
    return node;
  }
  return { ...node, first: swapIds(node.first, idA, idB), second: swapIds(node.second, idA, idB) };
}

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('suprland-user'));
  const [tree, setTree] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [fs, setFs] = useState(() => {
    const saved = localStorage.getItem('suprland-fs');
    return saved ? JSON.parse(saved) : {};
  });
  const [fmPath, setFmPath] = useState(null);
  const [floating, setFloating] = useState([]);
  const [registry, setRegistry] = useState({});
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('suprland-settings');
    return saved ? JSON.parse(saved) : { wallpaper: 'color:bg-black', hiddenApps: [], taskbarPos: 'bottom', autoHide: false };
  });
  const [browserUrl, setBrowserUrl] = useState(null);
  const idRef = useRef(1);
  const [dragOverId, setDragOverId] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const dragTile = useRef(null);
  const screenRef = useRef(null);

  const handleLogin = (u) => {
    const initialFs = { '/home/': { type: 'dir' }, [`/home/${u}/`]: { type: 'dir' } };
    setFs(initialFs);
    localStorage.setItem('suprland-user', u);
    localStorage.setItem('suprland-fs', JSON.stringify(initialFs));
    setUser(u);
  };

  const openWindow = (window_type) => {
    const id = idRef.current++;
    setTree(prev => {
      if (countLeaves(prev) >= TOTAL_WINDOWS) { idRef.current--; return prev; }
      if (SINGLE_WINDOW.includes(window_type) && collectLeaves(prev, BOUNDS, null).some(l => l.kind === window_type)) { idRef.current--; return prev; }
      const leaf = createLeaf(id, window_type);
      if (!prev) return leaf;
      const targetId = activeId ?? getFirstLeafId(prev);
      const dir = (getLeafDepth(prev, targetId) ?? 0) % 2 === 0 ? 'vertical' : 'horizontal';
      return splitNode(prev, targetId, leaf, dir);
    });
    setRegistry(prev => ({ ...prev, [id]: window_type }));
    setActiveId(id);
  };

  const closeWindow = (id) => {
    setRegistry(prev => { const n = { ...prev }; delete n[id]; return n; });
    if (floating.some(f => f.id === id)) {
      setFloating(prev => prev.filter(f => f.id !== id));
      if (activeId === id) setActiveId(null);
      return;
    }
    setTree(prev => {
      const leaves = collectLeaves(prev, BOUNDS, null);
      if (leaves.length <= 1) { setActiveId(null); return null; }
      const idx = leaves.findIndex(l => l.id === id);
      setActiveId((leaves[idx + 1] ?? leaves[idx - 1]).id);
      return removeNode(prev, id);
    });
  };

  const floatWindow = (id) => {
    const leaves = collectLeaves(tree, BOUNDS, null);
    const win = leaves.find(l => l.id === id);
    if (!win) return;
    const rect = screenRef.current?.getBoundingClientRect();
    const W = rect?.width ?? window.innerWidth;
    const H = rect?.height ?? window.innerHeight;
    setFloating(prev => [...prev, { id: win.id, kind: registry[win.id] ?? win.kind, x: W * 0.2, y: H * 0.15, w: W * 0.5, h: H * 0.6 }]);
    setTree(prev => {
      const leaves2 = collectLeaves(prev, BOUNDS, null);
      if (leaves2.length <= 1) { setActiveId(id); return null; }
      const idx = leaves2.findIndex(l => l.id === id);
      setActiveId((leaves2[idx + 1] ?? leaves2[idx - 1]).id);
      return removeNode(prev, id);
    });
  };

  const tileWindow = (id) => {
    const win = floating.find(f => f.id === id);
    if (!win) return;
    setFloating(prev => prev.filter(f => f.id !== id));
    setTree(prev => {
      const leaf = createLeaf(id, win.kind);
      if (!prev) return leaf;
      const targetId = getFirstLeafId(prev);
      const dir = (getLeafDepth(prev, targetId) ?? 0) % 2 === 0 ? 'vertical' : 'horizontal';
      return splitNode(prev, targetId, leaf, dir);
    });
    setActiveId(id);
  };

  const saveFile = (path, data) => {
    setFs(prev => {
      const next = { ...prev, [path]: { type: 'file', ...(typeof data === 'string' ? { text: data } : data) } };
      localStorage.setItem('suprland-fs', JSON.stringify(next));
      return next;
    });
  };

  const onTileHeaderMouseDown = (e, winId) => {
    if (e.button !== 0) return;
    dragTile.current = { id: winId, startX: e.clientX, startY: e.clientY, moved: false };
    const onMove = (me) => {
      if (!dragTile.current) return;
      if (Math.abs(me.clientX - dragTile.current.startX) + Math.abs(me.clientY - dragTile.current.startY) > 8) {
        dragTile.current.moved = true;
        setDraggingId(winId);
      }
      if (!dragTile.current.moved) return;
      setDragPos({ x: me.clientX, y: me.clientY });
      const rect = screenRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = ((me.clientX - rect.left) / rect.width) * 100;
      const py = ((me.clientY - rect.top) / rect.height) * 100;
      const leaves = collectLeaves(tree, BOUNDS, null);
      const over = leaves.find(l => l.id !== winId &&
        px >= l.bounds.x && px <= l.bounds.x + l.bounds.w &&
        py >= l.bounds.y && py <= l.bounds.y + l.bounds.h
      );
      setDragOverId(over?.id ?? null);
    };
    const onUp = (ue) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      setDragOverId(null);
      setDragPos(null);
      setDraggingId(null);
      if (!dragTile.current?.moved) { dragTile.current = null; return; }
      const rect = screenRef.current?.getBoundingClientRect();
      if (!rect) { dragTile.current = null; return; }
      const px = ((ue.clientX - rect.left) / rect.width) * 100;
      const py = ((ue.clientY - rect.top) / rect.height) * 100;
      const leaves = collectLeaves(tree, BOUNDS, null);
      const target = leaves.find(l => l.id !== winId &&
        px >= l.bounds.x && px <= l.bounds.x + l.bounds.w &&
        py >= l.bounds.y && py <= l.bounds.y + l.bounds.h
      );
      if (target) {
        setTree(prev => swapIds(prev, winId, target.id));
        setActiveId(winId);
      }
      dragTile.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onFloatHeaderMouseDown = (e, id) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setActiveId(id);
    const win = floating.find(f => f.id === id);
    const ox = e.clientX - win.x, oy = e.clientY - win.y;
    const onMove = (me) => setFloating(prev => prev.map(f => f.id === id ? { ...f, x: me.clientX - ox, y: me.clientY - oy } : f));
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onFloatResize = (e, id) => {
    e.stopPropagation();
    const win = floating.find(f => f.id === id);
    const startX = e.clientX, startY = e.clientY, startW = win.w, startH = win.h;
    const onMove = (me) => setFloating(prev => prev.map(f => f.id === id ? { ...f, w: Math.max(200, startW + me.clientX - startX), h: Math.max(150, startH + me.clientY - startY) } : f));
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  useEffect(() => {
    localStorage.setItem('suprland-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.altKey) return;
      const k = e.key.toLowerCase();
      if (e.shiftKey && k === 'f') {
        e.preventDefault();
        if (activeId == null) return;
        if (floating.some(f => f.id === activeId)) tileWindow(activeId);
        else floatWindow(activeId);
        return;
      }
      const map = { enter: 'cli', n: 'notepad', c: 'camera', h: 'help', f: 'files', b: 'browser', s: 'settings' };
      if (map[k] || e.key === 'Enter') { e.preventDefault(); openWindow(map[k] ?? 'cli'); }
      if (k === 'd') { e.preventDefault(); if (activeId != null) closeWindow(activeId); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeId, tree, floating]);

  const tiledWindows = collectLeaves(tree, BOUNDS, activeId);
  const allKinds = [...tiledWindows.map(w => w.kind), ...floating.map(f => f.kind)];
  const allIds = Object.keys(registry).map(Number);

  // Adjust bounds for content area when taskbar is visible
  const contentBounds = {
    x: 0,
    y: 0, 
    w: 100,
    h: 100
  };

  const winProps = (id, focused) => ({
    id, focused,
    onFocus: setActiveId,
    onClose: closeWindow,
    onSave: (name, data) => saveFile(`/home/${user}/${name}`, data),
    fs, setFs, user, fmPath,
  });

  const renderById = (id, focused) => {
    const kind = registry[id];
    const p = winProps(id, focused);
    if (kind === 'notepad') return <Notepad {...p} />;
    if (kind === 'camera') return <Camera {...p} />;
    if (kind === 'help') return <Help {...p} />;
    if (kind === 'files') return <FileManager {...p} initialPath={fmPath} />;
    if (kind === 'browser') return <Browser {...p} initialUrl={browserUrl} />;
    if (kind === 'settings') return <Settings {...p} settings={settings} onSettings={setSettings} 
        onResetUser={() => { localStorage.removeItem('suprland-user'); localStorage.removeItem('suprland-fs'); window.location.reload(); }} />;
    return <Cli {...p} fs={fs} setFs={setFs} user={user} onOpenApp={(kind, url) => { if (url) setBrowserUrl(url); openWindow(kind); }} />;
  };

  const isImgWallpaper = settings.wallpaper.startsWith('img:');
  const wallpaperClass = isImgWallpaper ? 'bg-black' : settings.wallpaper.replace('color:', '');
  const wallpaperStyle = isImgWallpaper ? { backgroundImage: `url(${settings.wallpaper.replace('img:', '')})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

  if (!user) return <Login onLogin={handleLogin} />;

  const showDesktop = !tree && floating.length === 0;
  const taskbarHeight = settings.autoHide ? 0 : (settings.taskbarPos === 'top' || settings.taskbarPos === 'bottom' ? 85 : 0);
  const taskbarWidth = settings.autoHide ? 0 : (settings.taskbarPos === 'left' || settings.taskbarPos === 'right' ? 105 : 0);
  
  const contentStyle = {
    paddingBottom: settings.taskbarPos === 'bottom' && !settings.autoHide ? `${taskbarHeight}px` : '0',
    paddingTop: settings.taskbarPos === 'top' && !settings.autoHide ? `${taskbarHeight}px` : '0',
    paddingLeft: settings.taskbarPos === 'left' && !settings.autoHide ? `${taskbarWidth}px` : '0',
    paddingRight: settings.taskbarPos === 'right' && !settings.autoHide ? `${taskbarWidth}px` : '0',
  };

  return (
    <>
      <div ref={screenRef} className={`relative w-screen h-screen overflow-hidden ${wallpaperClass}`} style={wallpaperStyle}>

        <AnimatePresence>
          {showDesktop && (
            <motion.div key='desktop' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute" 
              style={{
                top: settings.taskbarPos === 'top' && !settings.autoHide ? `${taskbarHeight}px` : '0',
                bottom: settings.taskbarPos === 'bottom' && !settings.autoHide ? `${taskbarHeight}px` : '0',
                left: settings.taskbarPos === 'left' && !settings.autoHide ? `${taskbarWidth}px` : '0',
                right: settings.taskbarPos === 'right' && !settings.autoHide ? `${taskbarWidth}px` : '0',
              }}>
              <Desktop fs={fs} setFs={setFs} user={user} onOpenFolder={path => { setFmPath(path); openWindow('files'); }}
                onDelete={(path) => { 
                  setFs(prev => { 
                    const n = { ...prev }; 
                    delete n[path]; 
                    localStorage.setItem('suprland-fs', JSON.stringify(n));
                    return n; 
                  }); 
                }} />
            </motion.div>
          )}
        </AnimatePresence>

        {allIds.map(id => {
          const tiledWin = tiledWindows.find(w => w.id === id);
          const floatWin = floating.find(f => f.id === id);
          const isActive = activeId === id;

          if (tiledWin) {
            const isDragging = draggingId === id;
            const isTarget = dragOverId === id;
            
            // Calculate actual position accounting for taskbar
            const topOffset = settings.taskbarPos === 'top' && !settings.autoHide ? taskbarHeight : 0;
            const leftOffset = settings.taskbarPos === 'left' && !settings.autoHide ? taskbarWidth : 0;
            const availableHeight = settings.taskbarPos === 'top' || settings.taskbarPos === 'bottom' ? 
              (settings.autoHide ? 100 : 100 - (taskbarHeight / window.innerHeight * 100)) : 100;
            const availableWidth = settings.taskbarPos === 'left' || settings.taskbarPos === 'right' ? 
              (settings.autoHide ? 100 : 100 - (taskbarWidth / window.innerWidth * 100)) : 100;
            
            return (
              <div key={id}
                onMouseDown={e => {
                  if (e.button === 1) { e.preventDefault(); closeWindow(id); }
                  else { setActiveId(id); onTileHeaderMouseDown(e, id); }
                }}
                className="absolute p-1"
                style={{
                  left: `calc(${(tiledWin.bounds.x / 100) * availableWidth}% + ${leftOffset}px)`, 
                  top: `calc(${(tiledWin.bounds.y / 100) * availableHeight}% + ${topOffset}px)`,
                  width: `${(tiledWin.bounds.w / 100) * availableWidth}%`, 
                  height: `${(tiledWin.bounds.h / 100) * availableHeight}%`,
                  zIndex: isDragging ? 30 : tiledWin.focused ? 20 : 10,
                  transition: 'left 0.15s ease, top 0.15s ease, width 0.15s ease, height 0.15s ease',
                }}>
                <div style={{ transform: isTarget ? 'scale(0.8)' : 'scale(1)', transition: 'transform 0.15s ease', width: '100%', height: '100%' }}>
                  {renderById(id, tiledWin.focused)}
                </div>
                {isTarget && <div className="absolute inset-1 rounded-3xl border-2 border-cyan-400/60 bg-cyan-400/10 pointer-events-none z-50" />}
              </div>
            );
          }

          if (floatWin) {
            return (
              <div key={id}
                onMouseDown={e => {
                  if (e.button === 1) { e.preventDefault(); closeWindow(id); return; }
                  setActiveId(id);
                }}
                className="absolute"
                style={{ left: floatWin.x, top: floatWin.y, width: floatWin.w, height: floatWin.h, zIndex: isActive ? 50 : 30 }}>
                <div className="w-full h-full relative">
                  {renderById(id, isActive)}
                  <div className="absolute top-0 left-0 right-0 h-8 cursor-move z-10"
                    onMouseDown={e => onFloatHeaderMouseDown(e, id)} />
                  <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10"
                    onMouseDown={e => onFloatResize(e, id)} />
                </div>
              </div>
            );
          }

          return null;
        })}

        {draggingId && dragPos && (() => {
          const win = tiledWindows.find(w => w.id === draggingId);
          if (!win) return null;
          const rect = screenRef.current?.getBoundingClientRect();
          const W = rect?.width ?? window.innerWidth;
          const H = rect?.height ?? window.innerHeight;
          const w = (win.bounds.w / 100) * W;
          const h = (win.bounds.h / 100) * H;
          return (
            <div className="pointer-events-none fixed z-[100]" style={{ left: dragPos.x - w / 2, top: dragPos.y - 16, width: w, height: h, opacity: 0.75, transform: 'scale(1.04)', transformOrigin: 'top center' }}>
              <div className="w-full h-full rounded-3xl border-2 border-cyan-400 bg-[#0a0a0f] flex items-center justify-center" style={{ backdropFilter: 'blur(10px)' }}>
                <span className="font-mono text-cyan-400 text-sm tracking-widest">{registry[draggingId]}</span>
              </div>
            </div>
          );
        })()}

        <Taskbar onOpen={openWindow} openKinds={allKinds} settings={settings} />
      </div>
    </>
  );
}
