import { useEffect, useRef, useState } from 'react';
import Window from './window';

export default function Notepad({ id, focused, onFocus, onClose, onSave }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const ref = useRef(null);

  useEffect(() => { if (focused) ref.current?.focus(); }, [focused]);

  useEffect(() => {
    if (!focused) return;
    const handler = (e) => {
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        onSave(`note-${id}.txt`, text);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focused, text, id]);

  const title = <>notepad-{id}{saved && <span className="text-green-500 ml-2 text-[9px]">saved!</span>}</>;

  return (
    <Window id={id} title={title} focused={focused} onFocus={onFocus} onClose={onClose}>
      <textarea ref={ref} value={text} onChange={(e) => setText(e.target.value)}
        className="flex-1 min-h-0 bg-transparent outline-none text-white font-mono p-3 resize-none hide-scroll"
       spellCheck="false" autoComplete="off" />
    </Window>
  );
}
