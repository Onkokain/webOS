import { useState } from 'react';
import Window from './window';
import FileViewer from './viewer';
import ContextMenu from './contextmenu';
import { getIcon } from './icons';
import { fsDelete, fsNextName } from './fsUtils';

export default function FileManager({ id, focused, onFocus, onClose, fs, setFs, user, initialPath }) {
  const root = `/home/${user}/`;
  const [cwd, setCwd] = useState(initialPath ?? root);
  const [viewing, setViewing] = useState(null);
  const [menu, setMenu] = useState(null);

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
  };

  const del = (path) => setFs(prev => fsDelete(prev, path));

  const newFile = () => { setFs(p => ({ ...p, [fsNextName(p, cwd, 'file', '.txt')]: { type: 'file', text: '' } })); setMenu(null); };
  const newFolder = () => { setFs(p => ({ ...p, [fsNextName(p, cwd, 'folder') + '/']: { type: 'dir' } })); setMenu(null); };

  return (
    <Window id={id} title="files" focused={focused} onFocus={onFocus} onClose={onClose}>
      <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden"
        onContextMenu={e => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY }); }}>
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-800 select-none">
          <button onClick={goUp} disabled={cwd === root} className="text-gray-600 hover:text-gray-300 disabled:opacity-20 font-mono text-xs transition-colors">←</button>
          <span className="font-mono text-gray-600 text-[10px] truncate">{cwd}</span>
        </div>

        {entries.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="font-mono text-gray-700 text-xs tracking-widest">empty</span>
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
                  return (
                    <tr key={path} onClick={() => dir ? setCwd(path) : setViewing({ name: entryName(path), ...entry })}
                      className="group text-gray-400 hover:text-gray-200 hover:bg-gray-900 cursor-pointer transition-colors">
                      <td className="px-3 py-1.5 text-gray-600">{getIcon(entry)}</td>
                      <td className="px-1 py-1.5 truncate max-w-[140px]">{entryName(path)}{dir ? '/' : ''}</td>
                      <td className="px-1 py-1.5 text-gray-600">{dir ? 'dir' : (entry.kind ?? 'text')}</td>
                      <td className="py-1.5 pr-2 text-right">
                        <button onClick={e => { e.stopPropagation(); del(path); }}
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
        {menu && <ContextMenu x={menu.x} y={menu.y} onNewFile={newFile} onNewFolder={newFolder} onClose={() => setMenu(null)} />}
      </div>
    </Window>
  );
}
