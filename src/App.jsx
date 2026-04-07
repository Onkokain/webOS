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

const BOUNDS = { x: 0, y: 0, w: 100, h: 100 };

function App() {
  const [user, setUser] = useState(null);
  const [tree, setTree] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [files, setFiles] = useState([]);
  const idRef = useRef(1);

  const openWindow = (kind) => {
    const id = idRef.current++;
    setTree((prev) => {
      if (countLeaves(prev) >= 8) { idRef.current--; return prev; }
      if (kind === 'camera' && collectLeaves(prev, BOUNDS, null).some((l) => l.kind === 'camera')) { idRef.current--; return prev; }
      if (kind === 'help' && collectLeaves(prev, BOUNDS, null).some((l) => l.kind === 'help')) { idRef.current--; return prev; }
      const leaf = createLeaf(id, kind);
      if (!prev) return leaf;
      const targetId = activeId ?? getFirstLeafId(prev);
      const dir = (getLeafDepth(prev, targetId) ?? 0) % 2 === 0 ? 'vertical' : 'horizontal';
      return splitNode(prev, targetId, leaf, dir);
    });
    setActiveId(id);
  };

  const closeWindow = (id) => {
    setTree((prev) => {
      const leaves = collectLeaves(prev, BOUNDS, null);
      if (leaves.length <= 1) { setActiveId(null); return null; }
      const idx = leaves.findIndex((l) => l.id === id);
      setActiveId((leaves[idx + 1] ?? leaves[idx - 1]).id);
      return removeNode(prev, id);
    });
  };

  const saveFile = (name, data) =>
    setFiles((prev) => {
      const i = prev.findIndex((f) => f.name === name);
      const entry = { name, ...(typeof data === 'string' ? { text: data } : data) };
      if (i !== -1) { const next = [...prev]; next[i] = entry; return next; }
      return [...prev, entry];
    });

  useEffect(() => {
    const handler = (e) => {
      if (!e.altKey) return;
      if (e.key === 'Enter') { e.preventDefault(); openWindow('cli'); }
      else if (e.key.toLowerCase() === 'n') { e.preventDefault(); openWindow('notepad'); }
      else if (e.key.toLowerCase() === 'c') { e.preventDefault(); openWindow('camera'); }
      else if (e.key.toLowerCase() === 'd') { e.preventDefault(); if (activeId != null) closeWindow(activeId); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeId, tree]);

  const windows = collectLeaves(tree, BOUNDS, activeId);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <AnimatePresence mode="popLayout">
        {!tree ? (
          <motion.div key="desktop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
            <Desktop files={files} onDelete={(name) => setFiles((p) => p.filter((f) => f.name !== name))} />
          </motion.div>
        ) : windows.map((win) => (
          <motion.div
            key={win.id} layout
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            onMouseDown={() => setActiveId(win.id)}
            onAuxClick={(e) => e.button === 1 && closeWindow(win.id)}
            className="absolute p-1"
            style={{ left: `${win.bounds.x}%`, top: `${win.bounds.y}%`, width: `${win.bounds.w}%`, height: `${win.bounds.h}%`, zIndex: win.focused ? 40 : 10 }}
          >
            {win.kind === 'notepad' ? <Notepad {...win} onFocus={setActiveId} onClose={closeWindow} onSave={saveFile} />
              : win.kind === 'camera' ? <Camera {...win} onFocus={setActiveId} onClose={closeWindow} onSave={saveFile} />
              : win.kind === 'help' ? <Help {...win} onFocus={setActiveId} onClose={closeWindow} />
              : <Cli {...win} onFocus={setActiveId} onClose={closeWindow} user={user} />}
          </motion.div>
        ))}
      </AnimatePresence>
      <Taskbar onOpen={openWindow} openKinds={windows.map((w) => w.kind)} />
    </div>
  );
}

export default App;
