import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function FileViewer({ file, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-[480px] max-w-[90vw] max-h-[70vh] rounded-2xl overflow-hidden border border-gray-700 bg-[#0e0e0e]">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#111] border-b border-gray-800 select-none">
          <span className="font-mono text-gray-400 text-xs">{file.name}</span>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-300 text-xs">✕</button>
        </div>
        <div className="flex-1 overflow-auto">
          {file.kind === 'photo' && <img src={file.url} className="w-full h-full object-contain" />}
          {file.kind === 'video' && <video src={file.url} controls className="w-full h-full" />}
          {file.kind === 'audio' && <div className="p-4"><audio src={file.url} controls className="w-full" /></div>}
          {!file.kind && (
            <pre className="p-4 font-mono text-gray-300 text-xs whitespace-pre-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {file.text || <span className="text-gray-700">empty</span>}
            </pre>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Desktop({ files = [], onDelete }) {
  const [viewing, setViewing] = useState(null);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center select-none gap-4">
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <polygon points="26,4 48,14 48,38 26,48 4,38 4,14" stroke="#2a2a2a" strokeWidth="1.5" fill="none" />
        <polygon points="26,12 40,19 40,33 26,40 12,33 12,19" stroke="#333" strokeWidth="1" fill="none" />
        <circle cx="26" cy="26" r="3" fill="#3a3a3a" />
      </svg>
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-gray-600 font-mono text-sm tracking-[0.3em]">Suprland*</p>
      </div>

      {files.length > 0 && (
        <div className="absolute top-4 left-4 flex flex-wrap gap-4 max-w-[40%]">
          <AnimatePresence>
            {files.map((f) => (
              <motion.div key={f.name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-1.5 cursor-pointer group w-16" onClick={() => setViewing(f)}>
                <div className="relative">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h10l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="#444" strokeWidth="1.2" fill="#1a1a1a" />
                    <path d="M14 4v4h4" stroke="#444" strokeWidth="1.2" />
                    <line x1="7" y1="11" x2="15" y2="11" stroke="#555" strokeWidth="1" strokeLinecap="round" />
                    <line x1="7" y1="14" x2="15" y2="14" stroke="#555" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(f.path); }}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-gray-800 border border-gray-600 text-gray-500 hover:text-red-400 text-[8px] hidden group-hover:flex items-center justify-center">✕</button>
                </div>
                <span className="text-gray-600 font-mono text-[9px] text-center break-all">{f.name}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {viewing && <FileViewer file={viewing} onClose={() => setViewing(null)} />}
      </AnimatePresence>
    </div>
  );
}
