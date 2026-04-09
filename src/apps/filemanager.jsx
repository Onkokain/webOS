import { useState, useEffect } from 'react';
import Window from '../ui/window';
import FileViewer from '../ui/viewer';
import ContextMenu from '../ui/contextmenu';
import { getIcon } from '../ui/icons';
import { fsDelete, fsNextName, fsRename, fsCopy } from '../utils/fsUtils';

export default function FileManager({ id, focused, onFocus, onClose, fs, setFs, user, initialPath }) {
  const root = `/home/${user}/`;
  const [cwd, setCwd] = useState(initialPath ?? root);
  const [viewing, setViewing] = useState(null);
  const [menu, setMenu] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [clipboard, setClipboard] = useState(null);
  const [editing, setEditing] = useState(null);

  const entries = Object.keys(fs).filter(k => {
    if (k === cwd) return false;
    return k.startsWith(cwd) && k.slice(cwd.length).split('/').filter(Boolean).length === 1;
  });

  const entryName = (path) => path.slice(cwd.length).replace(/\/$/, '');
  const isDir = (path) => fs[path]?.type === 'dir';

  const goUp = () => {
    if (cwd === root) return;
    const parts = cwd.slice(0, -1).split('/').filter(Boolean);
    parts.pop();
    setCwd('/' + parts.join('/') + '/');
    setSelected(new Set());
  };

  const deleteSelected = () => {
    setFs(prev => {
      let n = { ...prev };
      [...selected].forEach(path => { n = fsDelete(n, path); });
      localStorage.setItem('suprland-fs', JSON.stringify(n));
      return n;
    });
    setSelected(new Set());
    setMenu(null);
  };

  const doCopy = () => { setClipboard({ paths: [...selected], op: 'copy' }); setMenu(null); };
  const doCut = () => { setClipboard({ paths: [...selected], op: 'cut' }); setMenu(null); };

  const paste = () => {
    if (!clipboard) return;
    setFs(prev => {
      let n = { ...prev };
      clipboard.paths.forEach(path => {
        const fullName = path.split('/').filter(Boolean).pop();
        const isDir = prev[path]?.type === 'dir';
        const ext = !isDir && fullName.includes('.') ? '.' + fullName.split('.').pop() : '';
        const base = ext ? fullName.slice(0, fullName.length - ext.length) : fullName;
        const dest = fsNextName(n, cwd, base, ext) + (isDir ? '/' : '');
        n = fsCopy(n, path, dest);
        if (clipboard.op === 'cut') n = fsDelete(n, path);
      });
      localStorage.setItem('suprland-fs', JSON.stringify(n));
      return n;
    });
    setClipboard(null);
    setMenu(null);
  };

  const newFile = () => { 
    const newPath = fsNextName(fs, cwd, 'file', '.txt');
    setFs(p => {
      const updated = { ...p, [newPath]: { type: 'file', text: '' } };
      localStorage.setItem('suprland-fs', JSON.stringify(updated));
      return updated;
    }); 
    setMenu(null); 
  };
  const newFolder = () => { 
    const newPath = fsNextName(fs, cwd, 'folder') + '/';
    setFs(p => {
      const updated = { ...p, [newPath]: { type: 'dir' } };
      localStorage.setItem('suprland-fs', JSON.stringify(updated));
      return updated;
    }); 
    setMenu(null); 
  };

  useEffect(() => {
    const h = (e) => {
      if (selected.size === 0) return;
      if (e.key === 'Delete') deleteSelected();
      if (e.ctrlKey && e.key === 'c') doCopy();
      if (e.ctrlKey && e.key === 'x') doCut();
      if (e.ctrlKey && e.key === 'v') paste();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selected, clipboard, fs]);

  return (
    <Window id={id} title="files" focused={focused} onFocus={onFocus} onClose={onClose}>
      <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden"
        onContextMenu={e => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, kind: 'bg' }); }}
        onClick={() => setSelected(new Set())}>
        <div className="row gap-2 px-3 py-1.5 border-b border-gray-800 select-none">
          <button onClick={goUp} disabled={cwd === root} className="text-gray-600 hover:text-gray-300 disabled:opacity-20 font-mono text-xs transition-colors">←</button>
          <span className="font-mono text-gray-600 text-[10px] truncate">{cwd}</span>
        </div>

        {entries.length === 0 ? (
          <div className="flex-1 center">
            <span className="mono-xs text-gray-700 tracking-widest">empty</span>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto hide-scroll">
            <table className="w-full font-mono text-xs border-collapse">
              <thead>
                <tr className="text-gray-700 border-b border-gray-800 select-none">
                  <th className="text-left px-3 py-1.5 font-normal w-8" />
                  <th className="text-left px-1 py-1.5 font-normal">name</th>
                  <th className="text-left px-1 py-1.5 font-normal">type</th>
                  <th className="w-6" />
                </tr>
              </thead>
              <tbody>
                {entries.map(path => {
                  const dir = isDir(path);
                  const entry = fs[path];
                  const sel = selected.has(path);
                  return (
                    <tr key={path} 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (e.ctrlKey || e.metaKey) {
                          setSelected(prev => {
                            const next = new Set(prev);
                            if (next.has(path)) next.delete(path);
                            else next.add(path);
                            return next;
                          });
                        } else if (e.shiftKey && selected.size > 0) {
                          const lastSelected = [...selected][selected.size - 1];
                          const lastIdx = entries.indexOf(lastSelected);
                          const currIdx = entries.indexOf(path);
                          const [start, end] = lastIdx < currIdx ? [lastIdx, currIdx] : [currIdx, lastIdx];
                          setSelected(new Set(entries.slice(start, end + 1)));
                        } else {
                          setSelected(new Set([path]));
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (dir) setCwd(path);
                        else if (fs[path].type === 'file') setEditing({ path, name: entryName(path), text: fs[path].text || '' });
                        else setViewing({ name: entryName(path), ...entry });
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!sel) setSelected(new Set([path]));
                        setMenu({ x: e.clientX, y: e.clientY, kind: 'item' });
                      }}
                      className={`group text-gray-400 hover:text-gray-200 cursor-pointer transition-colors ${
                        sel ? 'bg-blue-900/30' : 'hover:bg-gray-900'
                      }`}>
                      <td className="px-3 py-1.5 text-gray-600">{getIcon(entry)}</td>
                      <td className="px-1 py-1.5 truncate max-w-[140px]">{entryName(path)}{dir ? '/' : ''}</td>
                      <td className="px-1 py-1.5 text-gray-600">{dir ? 'dir' : (entry.kind ?? 'text')}</td>
                      <td className="py-1.5 pr-2 text-right">
                        <button onClick={e => { e.stopPropagation(); setSelected(new Set([path])); deleteSelected(); }}
                          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all px-1">✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                value={editing.text}
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
        
        {menu?.kind === 'bg' && (
          <ContextMenu x={menu.x} y={menu.y} onNewFile={newFile} onNewFolder={newFolder} 
            onPaste={clipboard ? paste : null} onClose={() => setMenu(null)} />
        )}
        
        {menu?.kind === 'item' && (
          <div className="fixed z-50 flex flex-col py-1 rounded-xl overflow-hidden" 
            style={{
              left: menu.x,
              top: menu.y,
              background: 'rgba(18,18,18,0.92)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              minWidth: 140
            }}
            onMouseDown={e => e.stopPropagation()}>
            {[
              { label: 'Edit', fn: () => { const path = [...selected][0]; if (fs[path]?.type === 'file') { setEditing({ path, name: entryName(path), text: fs[path].text || '' }); setMenu(null); } }, hide: selected.size !== 1 || !fs[[...selected][0]] || fs[[...selected][0]].type !== 'file' },
              { label: 'Copy', fn: doCopy },
              { label: 'Cut', fn: doCut },
              { label: `Delete (${selected.size})`, fn: deleteSelected, danger: true },
            ].filter(i => !i.hide).map(({ label, fn, danger }) => (
              <button key={label} onClick={fn} 
                className={`px-4 py-2 mono-xs text-left transition-colors hover:bg-white/5 ${
                  danger ? 'text-red-400' : 'text-gray-400 hover:text-gray-200'
                }`}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </Window>
  );
}
