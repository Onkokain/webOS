import { AnimatePresence, motion } from 'framer-motion';

function Viewer({ file, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="flex flex-col w-[500px] max-w-[90vw] max-h-[75vh] rounded-2xl overflow-hidden border border-gray-700 bg-[#0e0e0e]">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#111] border-b border-gray-800 select-none">
          <span className="font-mono text-gray-400 text-xs truncate">{file.name}</span>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-300 text-xs ml-2">✕</button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center bg-black p-2">
          {file.kind === 'photo' && <img src={file.url} className="max-h-full max-w-full object-contain" />}
          {file.kind === 'video' && <video src={file.url} controls className="max-h-full max-w-full" />}
          {file.kind === 'audio' && <audio src={file.url} controls />}
          {!file.kind && (
            <pre className="w-full h-full p-2 font-mono text-gray-300 text-xs whitespace-pre-wrap overflow-auto [&::-webkit-scrollbar]:hidden">
              {file.text || <span className="text-gray-700">empty</span>}
            </pre>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FileViewer({ file, onClose }) {
  return (
    <AnimatePresence>
      {file && <Viewer file={file} onClose={onClose} />}
    </AnimatePresence>
  );
}
