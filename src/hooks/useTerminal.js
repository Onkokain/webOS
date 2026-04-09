import { useRef, useState } from 'react';

export function useTerminal(user, fs, setFs, run, HOST) {
  const root = `/home/${user}/`;
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { k: 'dim', t: `Suprland* 0.1 - welcome, ${user}` },
    { k: 'dim', t: 'Type help for available commands' },
    { k: 'dim', t: '-'.repeat(44) },
  ]);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [cwd, setCwd] = useState('/home/');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const shortCwd = cwd === root ? '~' : cwd === '/home/' ? '/home' : '~/' + cwd.slice(root.length).replace(/\/$/, '');
  const scrollBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView(), 0);

  const submit = (e) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    const out = run(cmd, user, cwd, setCwd, fs, setFs);
    if (out[0] === '__CLEAR__') {
      setHistory([]);
    } else if (out[0] === '__HISTORY__') {
      setHistory(h => [...h,
        { k: 'prompt', t: `${user}@${HOST}:${shortCwd}$ ${cmd}` },
        ...cmdHistory.map((c, i) => ({ k: 'out', t: ` ${cmdHistory.length - i} ${c}` })),
      ]);
    } else {
      setHistory(h => [...h,
        { k: 'prompt', t: `${user}@${HOST}:${shortCwd}$ ${cmd}` },
        ...out.map(t => ({ k: 'out', t })),
      ]);
    }
    setCmdHistory(h => [cmd, ...h]);
    setHistIdx(-1);
    setInput('');
    scrollBottom();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const i = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(i);
      setInput(cmdHistory[i] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const i = Math.max(histIdx - 1, -1);
      setHistIdx(i);
      setInput(i === -1 ? '' : cmdHistory[i]);
    }
  };

  return { input, setInput, history, shortCwd, submit, onKeyDown, bottomRef, inputRef };
}
