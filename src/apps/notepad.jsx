import { useEffect, useRef, useState } from 'react';
import Window from '../ui/window';

export default function Notepad({ id, focused, onFocus, onClose, onSave }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (focused) {
      textareaRef.current?.focus();
    }
  }, [focused]);

  useEffect(() => {
    if (!focused) {
      return;
    }
    
    const handleKeyDown = (event) => {
      const ctrlKeyPressed = event.ctrlKey;
      const sKeyPressed = event.key === 's';
      
      if (ctrlKeyPressed && sKeyPressed) {
        event.preventDefault();
        
        const fileName = `note-${id}.txt`;  
        onSave(fileName, text);
        setSaved(true);
        
        setTimeout(() => setSaved(false), 2000);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focused, text, id, onSave]);

  const windowTitle = (
    <>
      notepad-{id}
      {saved && <span className="text-green-500 ml-2 text-[9px]">saved!</span>}
    </>
  );

  return (
    <Window id={id} title={windowTitle} focused={focused} onFocus={onFocus} onClose={onClose}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="flex-1 min-h-0 bg-transparent outline-none text-white font-mono p-3 resize-none hide-scroll"
        spellCheck="false"
        autoComplete="off"
      />
    </Window>
  );
}
