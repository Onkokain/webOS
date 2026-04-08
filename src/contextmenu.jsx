import { useEffect } from 'react';

export default function ContextMenu({ x, y, onNewFile, onNewFolder, onPaste, onClose }) {
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="fixed z-50 flex flex-col py-1 rounded-xl overflow-hidden"
      style={{ left: x, top: y, background: 'rgba(18,18,18,0.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', minWidth: 140 }}
      onMouseDown={e => e.stopPropagation()}>
      <button onClick={onNewFile} className="menu-btn">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
          <path d="M4 3h8l4 4v10a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M12 3v4h4" stroke="currentColor" strokeWidth="1.4"/>
        </svg>
        New File
      </button>
      <button onClick={onNewFolder} className="menu-btn">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
          <path d="M2 5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        </svg>
        New Folder
      </button>
      {onPaste && (
        <button onClick={onPaste} className="menu-btn">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <rect x="6" y="4" width="10" height="13" rx="1" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M4 7H3a1 1 0 00-1 1v9a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
          Paste
        </button>
      )}
    </div>
  );
}
