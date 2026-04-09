import { useState, useEffect } from 'react';
import Window from '../ui/window';
import FileViewer from '../ui/viewer';
import ContextMenu from '../ui/contextmenu';
import TextEditor from '../ui/texteditor';
import { getIcon } from '../ui/icons';
import { fsDelete, fsNextName, fsCopy } from '../utils/fsUtils';

export default function FileManager({ id, focused, onFocus, onClose, fs, setFs, user, initialPath }) {
  const root = `/home/${user}/`;
  
  const [cwd, setCwd] = useState(initialPath || root);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [menu, setMenu] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [clipboard, setClipboard] = useState(null);

  const entries = Object.keys(fs).filter(key => {
    if (key === cwd) return false;
    const relative = key.slice(cwd.length);
    return key.startsWith(cwd) && relative.split('/').filter(Boolean).length === 1;
  });

  const getEntryName = (path) => path.slice(cwd.length).replace(/\/$/, '');
  const isDirectory = (path) => fs[path]?.type === 'dir';

  const saveFs = (updater) => {
    setFs(prev => {
      const updated = updater(prev);
      localStorage.setItem('suprland-fs', JSON.stringify(updated));
      return updated;
    });
  };

  const navigateUp = () => {
    if (cwd === root) return;
    const parts = cwd.slice(0, -1).split('/').filter(Boolean);
    parts.pop();
    setCwd('/' + parts.join('/') + '/');
    setSelected(new Set());
  };

  const deleteSelected = () => {
    saveFs(prev => {
      let updated = { ...prev };
      [...selected].forEach(path => {
        updated = fsDelete(updated, path);
      });
      return updated;
    });
    setSelected(new Set());
    setMenu(null);
  };

  const copyFiles = () => {
    setClipboard({ paths: [...selected], op: 'copy' });
    setMenu(null);
  };

  const cutFiles = () => {
    setClipboard({ paths: [...selected], op: 'cut' });
    setMenu(null);
  };

  const pasteFiles = () => {
    if (!clipboard) return;

    saveFs(prev => {
      let updated = { ...prev };

      clipboard.paths.forEach(path => {
        const fullName = path.split('/').filter(Boolean).pop();
        const isDir = prev[path]?.type === 'dir';
        const ext = !isDir && fullName.includes('.') 
          ? '.' + fullName.split('.').pop() 
          : '';
        const base = ext 
          ? fullName.slice(0, fullName.length - ext.length) 
          : fullName;
        const dest = fsNextName(updated, cwd, base, ext) + (isDir ? '/' : '');

        updated = fsCopy(updated, path, dest);

        if (clipboard.op === 'cut') {
          updated = fsDelete(updated, path);
        }
      });

      return updated;
    });

    setClipboard(null);
    setMenu(null);
  };

  const createNewFile = () => {
    const newPath = fsNextName(fs, cwd, 'file', '.txt');
    saveFs(p => ({ ...p, [newPath]: { type: 'file', text: '' } }));
    setMenu(null);
  };

  const createNewFolder = () => {
    const newPath = fsNextName(fs, cwd, 'folder') + '/';
    saveFs(p => ({ ...p, [newPath]: { type: 'dir' } }));
    setMenu(null);
  };

  const handleRowClick = (e, path) => {
    e.stopPropagation();

    if (e.ctrlKey || e.metaKey) {
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(path)) {
          next.delete(path);
        } else {
          next.add(path);
        }
        return next;
      });
    } else if (e.shiftKey && selected.size > 0) {
      const lastSelected = [...selected][selected.size - 1];
      const lastIdx = entries.indexOf(lastSelected);
      const currIdx = entries.indexOf(path);
      const [start, end] = lastIdx < currIdx 
        ? [lastIdx, currIdx] 
        : [currIdx, lastIdx];
      setSelected(new Set(entries.slice(start, end + 1)));
    } else {
      setSelected(new Set([path]));
    }
  };

  const handleRowDoubleClick = (e, path) => {
    e.stopPropagation();

    if (isDirectory(path)) {
      setCwd(path);
      return;
    }

    if (fs[path].type === 'file') {
      setEditing({
        path,
        name: getEntryName(path),
        text: fs[path].text || ''
      });
      return;
    }

    setViewing({
      name: getEntryName(path),
      ...fs[path]
    });
  };

  const handleEditSave = (file) => {
    saveFs(prev => ({
      ...prev,
      [file.path]: { type: 'file', text: file.text }
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selected.size === 0) return;

      if (e.key === 'Delete') deleteSelected();
      if (e.ctrlKey && e.key === 'c') copyFiles();
      if (e.ctrlKey && e.key === 'x') cutFiles();
      if (e.ctrlKey && e.key === 'v') pasteFiles();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, clipboard, fs]);

  return (
    <Window 
      id={id} 
      title="files" 
      focused={focused} 
      onFocus={onFocus} 
      onClose={onClose}
    >
      <div 
        className="relative flex-1 min-h-0 flex flex-col overflow-hidden"
        onContextMenu={e => {
          e.preventDefault();
          setMenu({ x: e.clientX, y: e.clientY, kind: 'bg' });
        }}
        onClick={() => setSelected(new Set())}
      >
        <div className="row gap-2 px-3 py-1.5 border-b border-gray-800 select-none">
          <button 
            onClick={navigateUp}
            disabled={cwd === root}
            className="text-gray-600 hover:text-gray-300 disabled:opacity-20 font-mono text-xs transition-colors"
          >
            ←
          </button>
          <span className="font-mono text-gray-600 text-[10px] truncate">
            {cwd}
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="flex-1 center">
            <span className="mono-xs text-gray-700 tracking-widest">
              empty
            </span>
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
                  const isDir = isDirectory(path);
                  const entry = fs[path];
                  const isSelected = selected.has(path);

                  return (
                    <tr 
                      key={path}
                      onClick={e => handleRowClick(e, path)}
                      onDoubleClick={e => handleRowDoubleClick(e, path)}
                      onContextMenu={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isSelected) setSelected(new Set([path]));
                        setMenu({ x: e.clientX, y: e.clientY, kind: 'item' });
                      }}
                      className={isSelected ? 'table-row-selected' : 'table-row'}
                    >
                      <td className="px-3 py-1.5 text-gray-600">
                        {getIcon(entry)}
                      </td>
                      <td className="px-1 py-1.5 truncate max-w-[140px]">
                        {getEntryName(path)}{isDir ? '/' : ''}
                      </td>
                      <td className="px-1 py-1.5 text-gray-600">
                        {isDir ? 'dir' : (entry.kind || 'text')}
                      </td>
                      <td className="py-1.5 pr-2 text-right">
                        <button 
                          onClick={e => {
                            e.stopPropagation();
                            setSelected(new Set([path]));
                            deleteSelected();
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all px-1"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <FileViewer 
          file={viewing} 
          onClose={() => setViewing(null)} 
        />

        <TextEditor
          file={editing}
          onSave={handleEditSave}
          onClose={() => setEditing(null)}
        />

        {menu?.kind === 'bg' && (
          <ContextMenu 
            x={menu.x} 
            y={menu.y}
            onNewFile={createNewFile}
            onNewFolder={createNewFolder}
            onPaste={clipboard ? pasteFiles : null}
            onClose={() => setMenu(null)}
          />
        )}

        {menu?.kind === 'item' && (
          <div 
            className="context-menu"
            style={{ left: menu.x, top: menu.y, minWidth: 140 }}
            onMouseDown={e => e.stopPropagation()}
          >
            {selected.size === 1 && fs[[...selected][0]]?.type === 'file' && (
              <button 
                onClick={() => {
                  const path = [...selected][0];
                  setEditing({
                    path,
                    name: getEntryName(path),
                    text: fs[path].text || ''
                  });
                  setMenu(null);
                }}
                className="context-menu-item"
              >
                Edit
              </button>
            )}

            <button 
              onClick={copyFiles}
              className="context-menu-item"
            >
              Copy
            </button>

            <button 
              onClick={cutFiles}
              className="context-menu-item"
            >
              Cut
            </button>

            <button 
              onClick={deleteSelected}
              className="context-menu-item-danger"
            >
              Delete ({selected.size})
            </button>
          </div>
        )}
      </div>
    </Window>
  );
}
