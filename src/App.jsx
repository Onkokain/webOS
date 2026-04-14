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

const TOTAL_WINDOWS = 6;
const BOUNDS = { x: 0, y: 0, w: 100, h: 100 };
const SINGLE_WINDOW = ['camera', 'help', 'settings', 'files'];

// swaps two apps; hold left click and drag a window over another to swap positions
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
  const [user, setUser] = useState(() => localStorage.getItem('suprland-user')); // username is saved to localstorage
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
    return saved ? JSON.parse(saved) : { wallpaper: 'color:bg-black', hiddenApps: [], taskbarPos: 'bottom', autoHide: false,textColor: 'rgb(200, 202, 202)' , fontSize:'16px', fontFamily:"'Inter', 'sans-serif'"};
  });

  const [browserUrl, setBrowserUrl] = useState(null);
  const idRef = useRef(1);
  const [dragOverId, setDragOverId] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const dragTile = useRef(null);
  const screenRef = useRef(null);

  const longPressTimer=useRef(null);
  const verylongPressTimer=useRef(null);

  const [isDragging,setIsDragging]=useState(false);

  const handleLogin = (user) => {
    const initialFs = { '/home/': { type: 'dir' }, [`/home/${user}/`]: { type: 'dir' } };
    setFs(initialFs);
    localStorage.setItem('suprland-user', user);
    localStorage.setItem('suprland-fs', JSON.stringify(initialFs));
    setUser(user);
  };

  const openWindow = (window_type) => {
    const id = idRef.current++;
    setTree(prev => {
      const currentLeafCount = countLeaves(prev);
      
      if (currentLeafCount >= TOTAL_WINDOWS) {
        idRef.current--;
        return prev;
      }
      
      const existingLeaves = collectLeaves(prev, BOUNDS, null);
      const windowAlreadyOpen = SINGLE_WINDOW.includes(window_type) && existingLeaves.some(leaf => leaf.kind === window_type);
      
      if (windowAlreadyOpen) {
        idRef.current--;
        return prev;
      }
      
      const newLeaf = createLeaf(id, window_type);
      
      if (!prev) {
        return newLeaf;
      }
      
      const targetId = activeId ?? getFirstLeafId(prev);
      const targetDepth = getLeafDepth(prev, targetId) ?? 0;
      const splitDirection = targetDepth % 2 === 0 ? 'vertical' : 'horizontal';
      
      return splitNode(prev, targetId, newLeaf, splitDirection);
    });
    setRegistry(prev => ({ ...prev, [id]: window_type }));
    setActiveId(id);
  };

  const closeWindow = (id) => {
    setRegistry(prev => {
      const updatedRegistry = { ...prev };
      delete updatedRegistry[id];
      return updatedRegistry;
    });
    
    const isFloatingWindow = floating.some(floatWindow => floatWindow.id === id);
    
    if (isFloatingWindow) {
      setFloating(prev => prev.filter(floatWindow => floatWindow.id !== id));
      
      if (activeId === id) {
        setActiveId(null);
      }
      
      return;
    }
    
    setTree(prev => {
      const allLeaves = collectLeaves(prev, BOUNDS, null);
      
      if (allLeaves.length <= 1) {
        setActiveId(null);
        return null;
      }
      
      const closingWindowIndex = allLeaves.findIndex(leaf => leaf.id === id);
      const nextActiveWindow = allLeaves[closingWindowIndex + 1] ?? allLeaves[closingWindowIndex - 1];
      
      setActiveId(nextActiveWindow.id);
      return removeNode(prev, id);
    });
  };

  const floatWindow = (id) => {
    const allLeaves = collectLeaves(tree, BOUNDS, null);
    const windowToFloat = allLeaves.find(leaf => leaf.id === id);
    
    if (!windowToFloat) {
      return;
    }
    
    const screenRect = screenRef.current?.getBoundingClientRect();
    const screenWidth = screenRect?.width ?? window.innerWidth;
    const screenHeight = screenRect?.height ?? window.innerHeight;
    
    const floatingWindowConfig = {
      id: windowToFloat.id,
      kind: registry[windowToFloat.id] ?? windowToFloat.kind,
      x: screenWidth * 0.2,
      y: screenHeight * 0.15,
      w: screenWidth * 0.5,
      h: screenHeight * 0.6
    };
    
    setFloating(prev => [...prev, floatingWindowConfig]);
    
    setTree(prev => {
      const remainingLeaves = collectLeaves(prev, BOUNDS, null);
      
      if (remainingLeaves.length <= 1) {
        setActiveId(id);
        return null;
      }
      
      const floatingWindowIndex = remainingLeaves.findIndex(leaf => leaf.id === id);
      const nextActiveWindow = remainingLeaves[floatingWindowIndex + 1] ?? remainingLeaves[floatingWindowIndex - 1];
      
      setActiveId(nextActiveWindow.id);
      return removeNode(prev, id);
    });
  };

  const tileWindow = (id) => {
    const windowToTile = floating.find(floatWindow => floatWindow.id === id);
    
    if (!windowToTile) {
      return;
    }
    
    setFloating(prev => prev.filter(floatWindow => floatWindow.id !== id));
    
    setTree(prev => {
      const newLeaf = createLeaf(id, windowToTile.kind);
      
      if (!prev) {
        return newLeaf;
      }
      
      const targetId = getFirstLeafId(prev);
      const targetDepth = getLeafDepth(prev, targetId) ?? 0;
      const splitDirection = targetDepth % 2 === 0 ? 'vertical' : 'horizontal';
      
      return splitNode(prev, targetId, newLeaf, splitDirection);
    });
    
    setActiveId(id);
  };

  const saveFile = (path, data) => {
    setFs(prev => {
      const fileContent = typeof data === 'string' ? { text: data } : data;
      const updatedFilesystem = {
        ...prev,
        [path]: { type: 'file', ...fileContent }
      };
      
      localStorage.setItem('suprland-fs', JSON.stringify(updatedFilesystem));
      return updatedFilesystem;
    });
  };

  const onTileHeaderMouseDown = (event, windowId) => {
    const isLeftClick = event.button === 0;
    
    if (!isLeftClick) {
      return;
    }
    
    dragTile.current = {
      id: windowId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false
    };
    
    const handleMouseMove = (moveEvent) => {
      if (!dragTile.current) {
        return;
      }
      
      const deltaX = Math.abs(moveEvent.clientX - dragTile.current.startX);
      const deltaY = Math.abs(moveEvent.clientY - dragTile.current.startY);
      const totalMovement = deltaX + deltaY;
      const dragThreshold = 8;
      
      if (totalMovement > dragThreshold) {
        dragTile.current.moved = true;
        setDraggingId(windowId);
      }
      
      if (!dragTile.current.moved) {
        return;
      }
      
      setDragPos({ x: moveEvent.clientX, y: moveEvent.clientY });
      
      const screenRect = screenRef.current?.getBoundingClientRect();
      
      if (!screenRect) {
        return;
      }
      
      const cursorXPercent = ((moveEvent.clientX - screenRect.left) / screenRect.width) * 100;
      const cursorYPercent = ((moveEvent.clientY - screenRect.top) / screenRect.height) * 100;
      
      const allLeaves = collectLeaves(tree, BOUNDS, null);
      const hoveredWindow = allLeaves.find(leaf =>
        leaf.id !== windowId &&
        cursorXPercent >= leaf.bounds.x &&
        cursorXPercent <= leaf.bounds.x + leaf.bounds.w &&
        cursorYPercent >= leaf.bounds.y &&
        cursorYPercent <= leaf.bounds.y + leaf.bounds.h
      );
      
      setDragOverId(hoveredWindow?.id ?? null);
    };
    
    const handleMouseUp = (upEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      setDragOverId(null);
      setDragPos(null);
      setDraggingId(null);
      
      if (!dragTile.current?.moved) {
        dragTile.current = null;
        return;
      }
      
      const screenRect = screenRef.current?.getBoundingClientRect();
      
      if (!screenRect) {
        dragTile.current = null;
        return;
      }
      
      const dropXPercent = ((upEvent.clientX - screenRect.left) / screenRect.width) * 100;
      const dropYPercent = ((upEvent.clientY - screenRect.top) / screenRect.height) * 100;
      
      const allLeaves = collectLeaves(tree, BOUNDS, null);
      const targetWindow = allLeaves.find(leaf =>
        leaf.id !== windowId &&
        dropXPercent >= leaf.bounds.x &&
        dropXPercent <= leaf.bounds.x + leaf.bounds.w &&
        dropYPercent >= leaf.bounds.y &&
        dropYPercent <= leaf.bounds.y + leaf.bounds.h
      );
      
      if (targetWindow) {
        setTree(prev => swapIds(prev, windowId, targetWindow.id));
        setActiveId(windowId);
      }
      
      dragTile.current = null;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const onTileHeaderTouchHold =(event, windowId) => {
    const touch=event.touches[0];

    longPressTimer.current=setTimeout(()=>{
      setIsDragging(true);
      setDraggingId(windowId);
      setDragPos({
        x:touch.clientX,
        y:touch.clientY

      });
    },2000000000000000000) // too lazy to fix it and since it works it works

    const handleTouchMovement =(moveEvent) => {
      if (!isDragging) {
        clearTimeout(longPressTimer.current);
        return;
      }

         const moveTouch=moveEvent.touches[0];
    setDragPos({
      x:moveTouch.clientX,
      y:moveTouch.clientY
    })
    const screenRect = screenRef.current?.getBoundingClientRect();
  
      if (!screenRect) {return};
      
      const cursorXPercent = ((moveEvent.clientX - screenRect.left) / screenRect.width) * 100;
      const cursorYPercent = ((moveEvent.clientY - screenRect.top) / screenRect.height) * 100;
      
      const allLeaves = collectLeaves(tree, BOUNDS, null);
      const hoveredWindow = allLeaves.find(leaf =>
        leaf.id !== windowId &&
        cursorXPercent >= leaf.bounds.x &&
        cursorXPercent <= leaf.bounds.x + leaf.bounds.w &&
        cursorYPercent >= leaf.bounds.y &&
        cursorYPercent <= leaf.bounds.y + leaf.bounds.h
      );
      
      setDragOverId(hoveredWindow?.id ?? null);
    };
    
    const handle_touch_over = (upEvent) => {
      clearTimeout(longPressTimer.current);

      const screenRect = screenRef.current?.getBoundingClientRect();
      const touch=upEvent.changedTouches[0];

      if (screenRect) {
        const dropXPercent = ((touch.clientX - screenRect.left) / screenRect.width) * 100;
        const dropYPercent = ((touch.clientY - screenRect.top) / screenRect.height) * 100;

        const allLeaves = collectLeaves(tree, BOUNDS, null);
        const targetWindow = allLeaves.find(leaf =>
          leaf.id !== windowId &&
          dropXPercent >= leaf.bounds.x &&
          dropXPercent <= leaf.bounds.x + leaf.bounds.w &&
          dropYPercent >= leaf.bounds.y &&
          dropYPercent <= leaf.bounds.y + leaf.bounds.h
        );
      
        if (targetWindow) {
          setTree(prev => swapIds(prev, windowId, targetWindow.id));
          setActiveId(windowId);
        }
      }

      window.removeEventListener('touchmove', handleTouchMovement);
      window.removeEventListener('touchend', handle_touch_over);
      
      setDragOverId(null);
      setDragPos(null);
      setDraggingId(null);
      setIsDragging(false);
    };
    
    window.addEventListener('touchmove', handleTouchMovement);
    window.addEventListener('touchend', handle_touch_over);
  }
    



  const onFloatHeaderMouseDown = (event, windowId) => {
    const isLeftClick = event.button === 0;
    
    if (!isLeftClick) {
      return;
    }
    
    event.stopPropagation();
    setActiveId(windowId);
    
    const floatingWindow = floating.find(floatWindow => floatWindow.id === windowId);
    const offsetX = event.clientX - floatingWindow.x;
    const offsetY = event.clientY - floatingWindow.y;
    
    const handleMouseMove = (moveEvent) => {
      setFloating(prev => prev.map(floatWindow =>
        floatWindow.id === windowId
          ? { ...floatWindow, x: moveEvent.clientX - offsetX, y: moveEvent.clientY - offsetY }
          : floatWindow
      ));
    };
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const onFloatResize = (event, windowId) => {
    event.stopPropagation();
    
    const floatingWindow = floating.find(floatWindow => floatWindow.id === windowId);
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = floatingWindow.w;
    const startHeight = floatingWindow.h;
    const minWidth = 200;
    const minHeight = 150;
    
    const handleMouseMove = (moveEvent) => {
      setFloating(prev => prev.map(floatWindow =>
        floatWindow.id === windowId
          ? {
              ...floatWindow,
              w: Math.max(minWidth, startWidth + moveEvent.clientX - startX),
              h: Math.max(minHeight, startHeight + moveEvent.clientY - startY)
            }
          : floatWindow
      ));
    };
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    localStorage.setItem('suprland-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const altKeyPressed = event.altKey;

      if (altKeyPressed) {
        const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        if (arrowKeys.includes(event.key)) {
          event.preventDefault();

          const focusable=[
            ...tiledWindows.map(w=>w.id),
            ...floating.map(f=>f.id),
          ]

          if (focusable.length===0){ return;}

          const currentIndex=focusable.indexOf(activeId);
          const safeIndex=currentIndex===-1 ? 0 : currentIndex // safety check to ensure activeid is in bounds

          let nextIndex=safeIndex;

          if (event.key==='ArrowRight' || event.key==='ArrowDown'){
            nextIndex=(safeIndex+1)%focusable.length;
          }

          if (event.key==='ArrowLeft' || event.key==='ArrowUp'){
            nextIndex=(safeIndex-1+focusable.length)%focusable.length;
          }

          setActiveId(focusable[nextIndex]);
          return;
        
        }
      }
      
      if (!altKeyPressed) {
        return;
      }
      
      const key = event.key.toLowerCase();
      const shiftKeyPressed = event.shiftKey;
      
      if (shiftKeyPressed && key === 'f') {
        event.preventDefault();
        
        if (activeId == null) {
          return;
        }
        
        const isCurrentWindowFloating = floating.some(floatWindow => floatWindow.id === activeId);
        
        if (isCurrentWindowFloating) {
          tileWindow(activeId);
        } else {
          floatWindow(activeId);
        }
        
        return;
      }
      
      const keyToAppMap = {
        enter: 'cli',
        n: 'notepad',
        c: 'camera',
        h: 'help',
        f: 'files',
        b: 'browser',
        s: 'settings'
      };
      
      const appToOpen = keyToAppMap[key];
      const isEnterKey = event.key === 'Enter';
      
      if (appToOpen || isEnterKey) {
        event.preventDefault();
        openWindow(appToOpen ?? 'cli');
      }
      
      if (key === 'd') {
        event.preventDefault();
        
        if (activeId != null) {
          closeWindow(activeId);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeId, tree, floating]);

  const tiledWindows = collectLeaves(tree, BOUNDS, activeId);
  const allKinds = [...tiledWindows.map(w => w.kind), ...floating.map(f => f.kind)];
  const allIds = Object.keys(registry).map(Number);

  // // Adjust bounds for content area when taskbar is visible
  // const contentBounds = {
  //   x: 0,
  //   y: 0, 
  //   w: 100,
  //   h: 100
  // };

  const winProps = (windowId, isFocused) => ({
    id: windowId,
    focused: isFocused,
    onFocus: setActiveId,
    onClose: closeWindow,
    onSave: (fileName, fileData) => saveFile(`/home/${user}/${fileName}`, fileData),
    fs,
    setFs,
    user,
    fmPath,
  });

  const renderById = (windowId, isFocused) => {
    const handleResetUser = () => {
        localStorage.removeItem('suprland-user');
        localStorage.removeItem('suprland-fs');
        localStorage.removeItem('suprland-settings')
        window.location.reload();
      };



    const windowKind = registry[windowId];
    const windowProps = winProps(windowId, isFocused);
    
    if (windowKind === 'notepad') {
      return <Notepad {...windowProps} />;
    }
    
    if (windowKind === 'camera') {
      return <Camera {...windowProps} />;
    }
    
    if (windowKind === 'help') {
      return <Help {...windowProps} />;
    }
    
    if (windowKind === 'files') {
      return <FileManager {...windowProps} initialPath={fmPath} />;
    }
    
    if (windowKind === 'browser') {
      return <Browser {...windowProps} initialUrl={browserUrl} />;
    }
    
    if (windowKind === 'settings') {
      const handleResetUser = () => {
        localStorage.removeItem('suprland-user');
        localStorage.removeItem('suprland-fs');
        localStorage.removeItem('suprland-settings')
        window.location.reload();
      };
      
      return (
        <Settings
          {...windowProps}
          settings={settings}
          onSettings={setSettings}
          onResetUser={handleResetUser}
        />
      );
    }
    
    const handleOpenApp = (appKind, url) => {
      
      if (url) {

        setBrowserUrl(url);
      }
      openWindow(appKind);
    };
    
    return (
      <Cli
        {...windowProps}
        fs={fs}
        setFs={setFs}
        user={user}
        onOpenApp={handleOpenApp}
        settings={settings}
        reset={handleResetUser}
      />
    );
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
      <div 
      ref={screenRef} 
      className={`relative w-screen h-screen overflow-hidden ${wallpaperClass}`}
      style={{...wallpaperStyle, '--text-color': settings.textColor, '--text-size': settings.fontSize, '--text-font': settings.fontFamily}}




      
      >

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
                onTouchStart={e => {
                    setActiveId(id);
                    onTileHeaderTouchHold(e,id);
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
                  <div className="absolute top-0 left-10 right-0 h-8 cursor-move z-10"
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
