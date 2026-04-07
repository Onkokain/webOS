import { useState } from 'react';
import Window from './window';

const icons = {
  dir: <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M2 5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>,
  photo: <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" /><circle cx="7" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M2 14l4-4 3 3 3-3 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  video: <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" /><path d="M14 8l4-2v8l-4-2V8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>,
  audio: <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M8 15V5l10-2v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="5" cy="15" r="3" stroke="currentColor" strokeWidth="1.2" /><circle cx="15" cy="13" r="3" stroke="currentColor" strokeWidth="1.2" /></svg>,
  file: <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M4 3h8l4 4v10a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" /><path d="M12 3v4h4" stroke="currentColor" strokeWidth="1.2" /></svg>,
};

function Preview({ file, onClose }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-[#0a0a0f]">
      <div className="flex items-center justify-between px-3 py-2 bg-[#111] border-b border-gray-800 select-none">
        <span className="font-mono text-gray-400 text-xs truncate">{file.name}</span>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-300 text-xs ml-2">✕</button>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center bg-black overflow-auto p-2">
        {file.kind === 'photo' && <img src={file.url} className="max-h-full max-w-full object-contain" />}
        {file.kind === 'video' && <video src={file.url} controls className="max-h-full max-w-full" />}
        {file.kind === 'audio' && <audio src={file.url} controls />}
        {!file.kind && <pre className="w-full h-full font-mono text-gray-300 text-xs whitespace-pre-wrap overflow-auto [&::-webkit-scrollbar]:hidden">{file.text || <span className="text-gray-700">empty</span>}</pre>}
      </div>
    </div>
  );
}

export default function FileManager({ id, focused, onFocus, onClose, fs, setFs, user }) {
  const root = `/home/${user}/`;
  const [cwd, setCwd] = useState(root);
  const [preview, setPreview] = useState(null);

  const entries = Object.keys(fs).filter((k) => {
    if (k === cwd) return false;
    const rel = k.slice(cwd.length);
    return k.startsWith(cwd) && rel.split('/').filter(Boolean).length === 1;
  });

  const name = (path) => path.slice(cwd.length).replace(/\/$/, '');
  const isDir = (path) => fs[path]?.type === 'dir';

  const goUp = () => {
    if (cwd === root) return;
    const parts = cwd.slice(0, -1).split('/').filter(Boolean);
    parts.pop();
    setCwd('/' + parts.join('/') + '/');
  };

  const deleteEntry = (path) =>
    setFs((p) => { const n = { ...p }; Object.keys(n).filter(k => k.startsWith(path)).forEach(k => delete n[k]); return n; });

  const handleContextMenu = (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const existing = Object.keys(fs).filter(k => k.startsWith(cwd) && /folder\d+\//.test(k.slice(cwd.length)));
    const nums = existing.map(k => parseInt(k.slice(cwd.length).match(/folder(\d+)/)?.[1] ?? 0));
    const n = nums.length ? Math.max(...nums) + 1 : 1;
    setFs((p) => ({ ...p, [`${cwd}folder${n}/`]: { type: 'dir' } }));
  };

  return (
    <Window id={id} title="files" focused={focused} onFocus={onFocus} onClose={onClose}>
      <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden" onContextMenu={handleContextMenu}>
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-800 select-none">
          <button onClick={goUp} disabled={cwd === root}
            className="text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors font-mono text-xs">←</button>
          <span className="font-mono text-gray-600 text-[10px] truncate">{cwd}</span>
        </div>

        {entries.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="font-mono text-gray-700 text-xs tracking-widest">empty</span>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full font-mono text-xs border-collapse">
              <thead>
                <tr className="text-gray-700 border-b border-gray-800 select-none">
                  <th className="text-left px-3 py-1.5 font-normal w-8"></th>
                  <th className="text-left px-1 py-1.5 font-normal">name</th>
                  <th className="text-left px-1 py-1.5 font-normal">type</th>
                  <th className="w-6"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((path) => {
                  const dir = isDir(path);
                  const entry = fs[path];
                  const iconKey = dir ? 'dir' : (entry.kind ?? 'file');
                  return (
                    <tr key={path}
                      onClick={() => dir ? setCwd(path) : setPreview({ name: name(path), ...entry })}
                      className="group text-gray-400 hover:text-gray-200 hover:bg-gray-900 cursor-pointer transition-colors">
                      <td className="px-3 py-1.5 text-gray-600">{icons[iconKey] ?? icons.file}</td>
                      <td className="px-1 py-1.5 truncate max-w-[140px]">{name(path)}{dir ? '/' : ''}</td>
                      <td className="px-1 py-1.5 text-gray-600">{dir ? 'dir' : (entry.kind ?? 'text')}</td>
                      <td className="py-1.5 pr-2 text-right">
                        <button onClick={(e) => { e.stopPropagation(); deleteEntry(path); }}
                          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all px-1">✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {preview && <Preview file={preview} onClose={() => setPreview(null)} />}
      </div>
    </Window>
  );
}
