import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createLeaf, countLeaves, getFirstLeafId, getLeafDepth, splitNode, removeNode, collectLeaves } from './tree';
import Cli from './cmd';
import Notepad from './notepad';
import Camera from './camera';
import Help from './help';
import Desktop from './desktop';
import Taskbar from './taskbar';
import Login from './login';
import FileManager from './filemanager';

const BOUNDS = { x: 0, y: 0, w: 100, h: 100 };
const SINGLE = ['camera', 'help', 'files'];

function App() {
  const [user, setUser] = useState(null);
  const [tree, setTree] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [fs, setFs] = useState({});
  const [fmPath, setFmPath] = useState(null);
  const idRef = useRef(1);

  const handleLogin = (u) => {
    setFs({ '/home/': { type: 'dir' }, [`/home/${u}/`]: { type: 'dir' } });
    setUser(u);
  };

  const openWindow = (kind) => {
    const id = idRef.current++;
    setTree(prev => {
      if (countLeaves(prev) >= 6) { idRef.current--; return prev; }
      if (SINGLE.includes(kind) && collectLeaves(prev, BOUNDS, null).some(l => l.kind === kind)) { idRef.current--; return prev; }
      const leaf = createLeaf(id, kind);
      if (!prev) return leaf;
      const targetId = activeId ?? getFirstLeafId(prev);
      const dir = (getLeafDepth(prev, targetId) ?? 0) % 2 === 0 ? 'vertical' : 'horizontal';
      return splitNode(prev, targetId, leaf, dir);
    });
    setActiveId(id);
  };

  const closeWindow = (id) => {
    setTree(prev => {
      const leaves = collectLeaves(prev, BOUNDS, null);
      if (leaves.length <= 1) { setActiveId(null); return null; }
      const idx = leaves.findIndex(l => l.id === id);
      setActiveId((leaves[idx + 1] ?? leaves[idx - 1]).id);
      return removeNode(prev, id);
    });
  };

  const saveFile = (path, data) =>
    setFs(prev => ({ ...prev, [path]: { type: 'file', ...(typeof data === 'string' ? { text: data } : data) } }));

  useEffect(() => {
    const h = (e) => {
      if (!e.altKey) return;
      const k = e.key.toLowerCase();
      const map = { enter: 'cli', n: 'notepad', c: 'camera', h: 'help', f: 'files' };
      if (map[k] || e.key === 'Enter') { e.preventDefault(); openWindow(map[k] ?? 'cli'); }
      if (k === 'd') { e.preventDefault(); if (activeId != null) closeWindow(activeId); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [activeId, tree]);

  const windows = collectLeaves(tree, BOUNDS, activeId);

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <AnimatePresence mode="popLayout">
        {!tree ? (
          <motion.div key="desktop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
            <Desktop fs={fs} setFs={setFs} user={user} onOpenFolder={path => { setFmPath(path); openWindow('files'); }} />
          </motion.div>
        ) : windows.map(win => (
          <motion.div key={win.id} layout
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            onMouseDown={e => { if (e.button === 1) { e.preventDefault(); closeWindow(win.id); } else setActiveId(win.id); }}
            className="absolute p-1"
            style={{ left: `${win.bounds.x}%`, top: `${win.bounds.y}%`, width: `${win.bounds.w}%`, height: `${win.bounds.h}%`, zIndex: win.focused ? 40 : 10 }}>
            {win.kind === 'notepad' ? <Notepad {...win} onFocus={setActiveId} onClose={closeWindow} onSave={(name, data) => saveFile(`/home/${user}/${name}`, data)} />
              : win.kind === 'camera' ? <Camera {...win} onFocus={setActiveId} onClose={closeWindow} onSave={(name, data) => saveFile(`/home/${user}/${name}`, data)} />
              : win.kind === 'help' ? <Help {...win} onFocus={setActiveId} onClose={closeWindow} />
              : win.kind === 'files' ? <FileManager {...win} onFocus={setActiveId} onClose={closeWindow} fs={fs} setFs={setFs} user={user} initialPath={fmPath} />
              : <Cli {...win} onFocus={setActiveId} onClose={closeWindow} user={user} fs={fs} setFs={setFs} />}
          </motion.div>
        ))}
      </AnimatePresence>
      <Taskbar onOpen={openWindow} openKinds={windows.map(w => w.kind)} />
    </div>
  );
}

export default App;
