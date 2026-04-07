import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const APPS = [
  { kind: 'cli', label: 'Terminal', icon: <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><polyline points="3,6 8,10 3,14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><line x1="10" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> },
  { kind: 'notepad', label: 'Notepad', icon: <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" /><line x1="7" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="7" y1="13" x2="10" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> },
  { kind: 'camera', label: 'Camera', icon: <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect x="1" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" /><polyline points="15,8 19,6 19,14 15,12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" /></svg> },
  { kind: 'help', label: 'Help', icon: <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" /><path d="M7.5 7.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="10" cy="15" r="0.75" fill="currentColor" /></svg> },
  { kind: 'files', label: 'Files', icon: <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M2 5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg> },
];

const glassStyle = {
  background: 'rgba(20,20,20,0.55)',
  backdropFilter: 'blur(28px) saturate(180%)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
};

export default function Taskbar({ onOpen, openKinds }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(null);

  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end pb-3 z-50"
      onMouseEnter={() => setVisible(true)} onMouseLeave={() => { setVisible(false); setHovered(null); }}>
      <div className="absolute bottom-0 left-0 right-0 h-4" />
      <AnimatePresence>
        {visible && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="flex items-end gap-2 px-4 py-2.5 rounded-2xl" style={glassStyle}>
            {APPS.map(({ kind, label, icon }) => {
              const active = openKinds.includes(kind);
              const isHov = hovered === kind;
              return (
                <div key={kind} className="flex flex-col items-center gap-1 relative">
                  <AnimatePresence>
                    {isHov && (
                      <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-gray-300 px-2 py-0.5 rounded-md pointer-events-none"
                        style={{ background: 'rgba(30,30,30,0.85)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <motion.button onClick={() => onOpen(kind)} onMouseEnter={() => setHovered(kind)} onMouseLeave={() => setHovered(null)}
                    animate={{ scale: isHov ? 1.25 : 1, y: isHov ? -6 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="flex items-center justify-center w-11 h-11 rounded-2xl"
                    style={{ background: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: active ? '#d1d5db' : '#6b7280' }}>
                    {icon}
                  </motion.button>
                  {active && <span className="w-1 h-1 rounded-full bg-gray-400" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
