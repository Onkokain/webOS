import { useEffect, useRef, useState } from 'react';
import './index.css';
import Cli from './cmd.jsx';

function App() {
  const [windows, setWindows] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const nextId = useRef(1);

  const starterHistory = () => ([
    { kind: 'system', text: 'Starting Operating System' },
    { kind: 'system', text: 'Initializing test...' },
    { kind: 'system', text: 'Type "help"' },
  ]);

  // 🚀 CREATE WINDOW (SPLIT LOGIC)
  const openWindow = () => {
    const id = nextId.current++;

    setWindows(prev => {
      // first window
      if (prev.length === 0) {
        setActiveId(id);
        return [{
          id,
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          input: '',
          history: starterHistory(),
        }];
      }

      return prev.flatMap(win => {
        if (win.id !== activeId) return win;

        // split ACTIVE window
        const newWin = {
          id,
          x: win.x + win.w / 2,
          y: win.y,
          w: win.w / 2,
          h: win.h,
          input: '',
          history: starterHistory(),
        };

        // shrink current
        return [
          { ...win, w: win.w / 2 },
          newWin
        ];
      });
    });

    setActiveId(id);
  };

  // ❌ CLOSE WINDOW
  const closeActiveWindow = () => {
    setWindows(prev => {
      const index = prev.findIndex(w => w.id === activeId);
      if (index === -1) return prev;

      const next = prev.filter(w => w.id !== activeId);

      if (next.length === 0) {
        setActiveId(null);
        return [];
      }

      const fallback = next[Math.max(0, index - 1)];
      setActiveId(fallback.id);

      return next;
    });
  };

  // 🎯 KEYBINDS
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        openWindow();
      }

      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        closeActiveWindow();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeId]);

  // ✍️ INPUT
  const changeInput = (id, value) => {
    setWindows(prev =>
      prev.map(w => w.id === id ? { ...w, input: value } : w)
    );
  };

  // 🧠 COMMAND ENGINE
  const runCommand = (cmd) => {
    const parts = cmd.split(' ');
    const base = parts[0];

    switch (base) {
      case 'help':
        return ['help, clear, echo, date'];

      case 'echo':
        return [parts.slice(1).join(' ')];

      case 'date':
        return [new Date().toString()];

      case 'clear':
        return ['__CLEAR__'];

      default:
        return ['command not found'];
    }
  };

  const submitCommand = (id) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id !== id) return w;

        const cmd = w.input.trim();
        if (!cmd) return { ...w, input: '' };

        const out = runCommand(cmd);

        if (out[0] === '__CLEAR__') {
          return { ...w, input: '', history: [] };
        }

        return {
          ...w,
          input: '',
          history: [
            ...w.history,
            { kind: 'user', text: '> ' + cmd },
            ...out.map(t => ({ kind: 'system', text: t }))
          ]
        };
      })
    );
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {windows.map(win => (
        <Cli
          key={win.id}
          win={win}
          focused={win.id === activeId}
          onFocus={setActiveId}
          onClose={closeActiveWindow}
          onInputChange={changeInput}
          onSubmitCommand={submitCommand}
        />
      ))}
    </div>
  );
}

export default App;