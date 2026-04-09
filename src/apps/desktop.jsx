import { useEffect, useRef, useState } from 'react';
import { getIcon } from '../ui/icons';
import FileViewer from '../ui/viewer';
import ContextMenu from '../ui/contextmenu';
import { fsDelete, fsRename, fsCopy, fsNextName } from '../utils/fsUtils';

const W = 72, H = 84;
const autoPos = (i) => ({ x: 16 + Math.floor(i / 9) * (W + 20), y: 16 + (i % 9) * (H + 8) });

const glassMenu = {
  background: 'rgba(18,18,18,0.92)', backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', minWidth: 140,
};

function RenameInput({ name, onDone }) {
  const [val, setVal] = useState(name);
  const ref = useRef(null);
  useEffect(() => { ref.current?.select(); }, []);
  return (
    <input ref={ref} value={val} onChange={e => setVal(e.target.value)}
      onBlur={() => onDone(val)}
      onKeyDown={e => { if (e.key === 'Enter') onDone(val); if (e.key === 'Escape') onDone(null); }}
      onMouseDown={e => e.stopPropagation()}
      className="w-full text-center bg-gray-800 border border-gray-600 rounded text-gray-200 font-mono outline-none px-1"
      style={{ fontSize: 9 }} />
  );
}

export default function Desktop({ fs, setFs, user, onOpenFolder, onDelete }) {
  const root = `/home/${user}/`;
  const ref = useRef(null);
  const dragState = useRef(null);
  const bandState = useRef(null);

  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem(`suprland-desktop-positions-${user}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [selected, setSelected] = useState(new Set());
  const [renaming, setRenaming] = useState(null);
  const [menu, setMenu] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [band, setBand] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    localStorage.setItem(`suprland-desktop-positions-${user}`, JSON.stringify(positions));
  }, [positions, user]);

  const entries = Object.entries(fs)
    .filter(([p]) => p.startsWith(root) && p !== root && !p.slice(root.length).replace(/\/$/, '').includes('/'))
    .map(([path, v], i) => ({ path, name: path.slice(root.length).replace(/\/$/, ''), ...v, ...(positions[path] ?? autoPos(i)) }));

  const getPos = (path) => positions[path] ?? autoPos(entries.findIndex(e => e.path === path));

  const onIconMouseDown = (e, path) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const newSel = e.shiftKey ? new Set([...selected, path]) : selected.has(path) ? selected : new Set([path]);
    setSelected(newSel);
    const paths = [...newSel];
    const startPos = Object.fromEntries(paths.map(p => [p, getPos(p)]));
    dragState.current = { paths, startMouse: { x: e.clientX, y: e.clientY }, startPos, moved: false };

    const onMove = (me) => {
      const dx = me.clientX - dragState.current.startMouse.x;
      const dy = me.clientY - dragState.current.startMouse.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragState.current.moved = true;
      if (!dragState.current.moved) return;
      setPositions(prev => ({ ...prev, ...Object.fromEntries(paths.map(p => [p, { x: startPos[p].x + dx, y: startPos[p].y + dy }])) }));
    };

    const onUp = (ue) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (!dragState.current?.moved) return;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const dropX = ue.clientX - rect.left, dropY = ue.clientY - rect.top;
      const target = entries.find(e => e.type === 'dir' && !paths.includes(e.path) && dropX >= e.x && dropX <= e.x + W && dropY >= e.y && dropY <= e.y + H);
      if (target) {
        setFs(prev => {
          let n = { ...prev };
          paths.forEach(p => {
            const name = p.slice(root.length).replace(/\/$/, '');
            const newPath = target.path + name + (prev[p]?.type === 'dir' ? '/' : '');
            n = fsRename(n, p, newPath);
          });
          return n;
        });
        setPositions(prev => { const n = { ...prev }; paths.forEach(p => delete n[p]); return n; });
        setSelected(new Set());
      }
      dragState.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onBgMouseDown = (e) => {
    if (e.button !== 0) return;
    setMenu(null);
    if (!e.shiftKey) setSelected(new Set());
    setRenaming(null);
    const rect = ref.current.getBoundingClientRect();
    const x0 = e.clientX - rect.left, y0 = e.clientY - rect.top;
    bandState.current = { x0, y0 };

    const onMove = (me) => {
      const x2 = me.clientX - rect.left, y2 = me.clientY - rect.top;
      setBand({ x: Math.min(x0, x2), y: Math.min(y0, y2), w: Math.abs(x2 - x0), h: Math.abs(y2 - y0) });
      const [minX, maxX, minY, maxY] = [Math.min(x0, x2), Math.max(x0, x2), Math.min(y0, y2), Math.max(y0, y2)];
      const hit = new Set(entries.filter(en => en.x + W > minX && en.x < maxX && en.y + H > minY && en.y < maxY).map(en => en.path));
      setSelected(e.shiftKey ? new Set([...selected, ...hit]) : hit);
    };

    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); setBand(null); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const deleteSelected = () => {
    if (onDelete) {
      [...selected].forEach(p => onDelete(p));
    } else {
      setFs(prev => { 
        let n = { ...prev }; 
        [...selected].forEach(p => { n = fsDelete(n, p); }); 
        localStorage.setItem('suprland-fs', JSON.stringify(n));
        return n; 
      });
    }
    setPositions(prev => { const n = { ...prev }; [...selected].forEach(p => delete n[p]); return n; });
    setSelected(new Set());
  };

  const rename = (path, newName) => {
    setRenaming(null);
    if (!newName || newName === path.slice(root.length).replace(/\/$/, '')) return;
    const newPath = root + newName + (fs[path]?.type === 'dir' ? '/' : '');
    setFs(prev => {
      const updated = fsRename(prev, path, newPath);
      localStorage.setItem('suprland-fs', JSON.stringify(updated));
      return updated;
    });
    setPositions(prev => { const n = { ...prev }; n[newPath] = n[path]; delete n[path]; return n; });
    setSelected(new Set([newPath]));
  };

  const doCopy = (paths) => { setClipboard({ paths: [...paths], op: 'copy' }); setMenu(null); };
  const doCut = (paths) => { setClipboard({ paths: [...paths], op: 'cut' }); setMenu(null); };

  const paste = () => {
    if (!clipboard) return;
    setFs(prev => {
      let n = { ...prev };
      clipboard.paths.forEach(path => {
        const fullName = path.slice(root.length).replace(/\/$/, '');
        const isDir = prev[path]?.type === 'dir';
        const ext = !isDir && fullName.includes('.') ? '.' + fullName.split('.').pop() : '';
        const base = ext ? fullName.slice(0, fullName.length - ext.length) : fullName;
        const dest = fsNextName(n, root, base, ext) + (isDir ? '/' : '');
        n = fsCopy(n, path, dest);
        if (clipboard.op === 'cut') n = fsDelete(n, path);
      });
      localStorage.setItem('suprland-fs', JSON.stringify(n));
      return n;
    });
    setClipboard(null);
    setMenu(null);
  };

  const openEntry = (entry) => {
    if (entry.type === 'dir') { onOpenFolder?.(entry.path); return; }
    if (entry.type === 'file') { setEditing(entry); return; }
    setViewing(entry);
  };

  useEffect(() => {
    const h = (e) => {
      if (renaming || selected.size === 0) return;
      if (e.key === 'Delete') deleteSelected();
      if (e.key === 'F2' && selected.size === 1) setRenaming([...selected][0]);
      if (e.ctrlKey && e.key === 'c') doCopy(selected);
      if (e.ctrlKey && e.key === 'x') doCut(selected);
      if (e.ctrlKey && e.key === 'v') paste();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selected, clipboard, fs, renaming]);

  const newFile = () => { 
    const newPath = fsNextName(fs, root, 'file', '.txt');
    setFs(p => {
      const updated = { ...p, [newPath]: { type: 'file', text: '' } };
      localStorage.setItem('suprland-fs', JSON.stringify(updated));
      return updated;
    }); 
    setMenu(null); 
  };
  const newFolder = () => { 
    const newPath = fsNextName(fs, root, 'folder') + '/';
    setFs(p => {
      const updated = { ...p, [newPath]: { type: 'dir' } };
      localStorage.setItem('suprland-fs', JSON.stringify(updated));
      return updated;
    }); 
    setMenu(null); 
  };

  return (
    <div ref={ref} className="relative w-full h-full overflow-hidden select-none"
      onMouseDown={onBgMouseDown}
      onContextMenu={e => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, kind: 'bg' }); }}>

{entries.map(entry => {
        const sel = selected.has(entry.path);
        return (
          <div key={entry.path} className="absolute col items-center gap-1 cursor-pointer"
            style={{ left: entry.x, top: entry.y, width: W, height: H, zIndex: sel ? 20 : 10 }}
            onMouseDown={e => onIconMouseDown(e, entry.path)}
            onDoubleClick={() => openEntry(entry)}
            onContextMenu={e => { e.preventDefault(); e.stopPropagation(); if (!sel) setSelected(new Set([entry.path])); setMenu({ x: e.clientX, y: e.clientY, kind: 'icon', path: entry.path }); }}>
            <div className={`p-1.5 rounded-xl transition-colors ${sel ? 'bg-white/10' : 'hover:bg-white/5'}`}>
              {getIcon(entry, 36)}
            </div>
            {renaming === entry.path
              ? <RenameInput name={entry.name} onDone={name => rename(entry.path, name)} />
              : <span className={`font-mono text-[9px] text-center break-all leading-tight px-1 rounded w-full ${sel ? 'bg-blue-900/40 text-gray-200' : 'text-gray-500'}`}>{entry.name}</span>}
          </div>
        );
      })}

      {band && <div className="absolute pointer-events-none rounded border border-blue-500/40 bg-blue-500/10" style={{ left: band.x, top: band.y, width: band.w, height: band.h, zIndex: 50 }} />}

      {menu?.kind === 'bg' && <ContextMenu x={menu.x} y={menu.y} onNewFile={newFile} onNewFolder={newFolder} onPaste={clipboard ? paste : null} onClose={() => setMenu(null)} />}

      {menu?.kind === 'icon' && (
        <div className="fixed z-50 flex flex-col py-1 rounded-xl overflow-hidden" style={glassMenu} onMouseDown={e => e.stopPropagation()}>
          {[
            { label: 'Open', fn: () => { openEntry(entries.find(e => e.path === menu.path)); setMenu(null); } },
            { label: 'Edit', fn: () => { const entry = entries.find(e => e.path === menu.path); if (entry.type === 'file') { setEditing(entry); setMenu(null); } }, hide: entries.find(e => e.path === menu.path)?.type !== 'file' },
            { label: 'Rename', fn: () => { setRenaming(menu.path); setMenu(null); }, hide: selected.size > 1 },
            { label: 'Copy', fn: () => doCopy(selected) },
            { label: 'Cut', fn: () => doCut(selected) },
            { label: 'Delete', fn: () => { deleteSelected(); setMenu(null); }, danger: true },
          ].filter(i => !i.hide).map(({ label, fn, danger }) => (
            <button key={label} onClick={fn} className={`px-4 py-2 mono-xs text-left transition-colors hover:bg-white/5 ${danger ? 'text-red-400' : 'text-gray-400 hover:text-gray-200'}`}>{label}</button>
          ))}
        </div>
      )}

      <FileViewer file={viewing} onClose={() => setViewing(null)} />

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setEditing(null)}>
          <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-[600px] h-[400px] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
              <span className="font-mono text-sm text-gray-300">{editing.name}</span>
              <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-300 transition-colors">✕</button>
            </div>
            <textarea
              value={editing.text || ''}
              onChange={e => setEditing({ ...editing, text: e.target.value })}
              className="flex-1 bg-transparent text-gray-300 font-mono text-sm p-4 outline-none resize-none"
              placeholder="Type here..."
            />
            <div className="flex gap-2 px-4 py-2 border-t border-gray-800">
              <button
                onClick={() => {
                  setFs(prev => {
                    const updated = { ...prev, [editing.path]: { type: 'file', text: editing.text } };
                    localStorage.setItem('suprland-fs', JSON.stringify(updated));
                    return updated;
                  });
                  setEditing(null);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-mono text-xs transition-colors">
                Save
              </button>
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-mono text-xs transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
