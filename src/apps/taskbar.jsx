import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = import.meta.env.BASE_URL;

const ALL_APPS = [
  { kind: 'cli',      label: 'Terminal', icon: <img src={`${BASE}icons/cli.svg`}      width="22" height="22" /> },
  { kind: 'notepad',  label: 'Notepad',  icon: <img src={`${BASE}icons/notepad.svg`}  width="22" height="22" /> },
  { kind: 'camera',   label: 'Camera',   icon: <img src={`${BASE}icons/camera.svg`}   width="22" height="22" /> },
  { kind: 'help',     label: 'Help',     icon: <img src={`${BASE}icons/help.svg`}     width="22" height="22" /> },
  { kind: 'files',    label: 'Files',    icon: <img src={`${BASE}icons/files.svg`}    width="22" height="22" /> },
  { kind: 'browser',  label: 'Browser',  icon: <img src={`${BASE}icons/browser.svg`}  width="22" height="22" /> },
  { kind: 'settings', label: 'Settings', icon: <img src={`${BASE}icons/settings.svg`} width="22" height="22" /> },
];

const glassStyle = {
  background: 'rgba(20,20,20,0.55)',
  backdropFilter: 'blur(28px) saturate(180%)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
};

const positionStyles = {
  bottom: { 
    container: 'absolute bottom-0 left-0 right-0 flex justify-center items-end pb-3', 
    containerFixed: 'fixed bottom-0 left-0 right-0 flex justify-center items-end pb-3 h-[85px]',
    trigger: 'absolute bottom-0 left-0 right-0 h-4', 
    axis: 'flex items-end gap-2 px-4 py-2.5 rounded-2xl', 
    anim: { initial: { y: 80, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 80, opacity: 0 } } 
  },
  top: { 
    container: 'absolute top-0 left-0 right-0 flex justify-center items-start pt-3', 
    containerFixed: 'fixed top-0 left-0 right-0 flex justify-center items-start pt-3 h-[85px]',
    trigger: 'absolute top-0 left-0 right-0 h-4', 
    axis: 'flex items-start gap-2 px-4 py-2.5 rounded-2xl', 
    anim: { initial: { y: -80, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -80, opacity: 0 } } 
  },
  left: { 
    container: 'absolute left-0 top-0 bottom-0 flex justify-start items-center pl-3', 
    containerFixed: 'fixed left-0 top-0 bottom-0 flex justify-start items-center pl-3 w-[105px]',
    trigger: 'absolute left-0 top-0 bottom-0 w-4', 
    axis: 'flex flex-col items-center gap-2 px-2.5 py-4 rounded-2xl', 
    anim: { initial: { x: -80, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -80, opacity: 0 } } 
  },
  right: { 
    container: 'absolute right-0 top-0 bottom-0 flex justify-end items-center pr-3', 
    containerFixed: 'fixed right-0 top-0 bottom-0 flex justify-end items-center pr-3 w-[105px]',
    trigger: 'absolute right-0 top-0 bottom-0 w-4', 
    axis: 'flex flex-col items-center gap-2 px-2.5 py-4 rounded-2xl', 
    anim: { initial: { x: 80, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 80, opacity: 0 } } 
  },
};

export default function Taskbar({ onOpen, openKinds, settings }) {
  const [visible, setVisible] = useState(!settings.autoHide);
  const [hovered, setHovered] = useState(null);

  const pos = positionStyles[settings.taskbarPos] ?? positionStyles.bottom;
  const apps = ALL_APPS.filter(a => !settings.hiddenApps.includes(a.kind));
  const isVertical = settings.taskbarPos === 'left' || settings.taskbarPos === 'right';
  const tooltipClass = isVertical
    ? settings.taskbarPos === 'left' ? 'absolute left-full ml-2 top-1/2 -translate-y-1/2' : 'absolute right-full mr-2 top-1/2 -translate-y-1/2'
    : 'absolute -top-8 left-1/2 -translate-x-1/2';

  const show = () => setVisible(true);
  const hide = () => { if (settings.autoHide) { setVisible(false); setHovered(null); } };

  return (
    <div className={`${settings.autoHide ? pos.container : pos.containerFixed} z-50 pointer-events-none`}>
      <div className={`${pos.trigger} pointer-events-auto`} onMouseEnter={show} />
      <AnimatePresence>
        {(visible || !settings.autoHide) && (
          <motion.div {...pos.anim} transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`${pos.axis} pointer-events-auto`} style={glassStyle}
            onMouseEnter={show} onMouseLeave={hide}>
            {apps.map(({ kind, label, icon }) => {
              const active = openKinds.includes(kind);
              const isHov = hovered === kind;
              return (
                <div key={kind} className="flex flex-col items-center gap-1 relative">
                  <AnimatePresence>
                    {isHov && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`absolute whitespace-nowrap font-mono text-[10px] text-gray-300 px-2 py-0.5 rounded-md pointer-events-none ${tooltipClass}`}
                        style={{ background: 'rgba(30,30,30,0.85)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <motion.button onClick={() => onOpen(kind)} onMouseEnter={() => setHovered(kind)} onMouseLeave={() => setHovered(null)}
                    animate={{ scale: isHov ? 1.25 : 1, ...(isVertical ? { x: isHov ? (settings.taskbarPos === 'left' ? 6 : -6) : 0 } : { y: isHov ? -6 : 0 }) }}
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
