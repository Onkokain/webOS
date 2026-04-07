import { useRef, useState } from 'react';
import Window from './window';

const HOST = 'suprland';

const run = (cmd, user) => {
  const [base, ...rest] = cmd.trim().split(/\s+/);
  switch (base.toLowerCase()) {
    case 'help': return [
      'available commands:',
      '  help          show this message',
      '  echo <text>   print text',
      '  date          print date and time',
      '  whoami        print current user',
      '  hostname      print hostname',
      '  clear         clear terminal',
      '  uname         print system info',
      '  uptime        print session uptime',
    ];
    case 'echo': return [rest.join(' ')];
    case 'date': return [new Date().toString()];
    case 'whoami': return [user];
    case 'hostname': return [HOST];
    case 'uname': return ['Suprland* 1.0.0 (web-os) x86_64'];
    case 'uptime': return [`up ${Math.floor(performance.now() / 60000)} min`];
    case 'clear': return ['__CLEAR__'];
    default: return [`${base}: command not found`];
  }
};

const BOOT = (user) => [
  { k: 'dim', t: `Suprland* 1.0.0 — welcome, ${user}` },
  { k: 'dim', t: 'type help for available commands' },
  { k: 'dim', t: '─'.repeat(36) },
];

export default function Cli({ id, focused, onFocus, onClose, user }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState(BOOT(user));
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const prompt = `${user}@${HOST}:~$`;

  const scrollBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView(), 0);

  const submit = (e) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    const out = run(cmd, user);
    if (out[0] === '__CLEAR__') {
      setHistory([]);
    } else {
      setHistory((h) => [
        ...h,
        { k: 'prompt', t: `${prompt} ${cmd}` },
        ...out.map((t) => ({ k: 'out', t })),
      ]);
    }
    setCmdHistory((h) => [cmd, ...h]);
    setHistIdx(-1);
    setInput('');
    scrollBottom();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(idx);
      setInput(cmdHistory[idx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? '' : cmdHistory[idx]);
    }
  };

  return (
    <Window id={id} title={`${user}@${HOST}`} focused={focused} onFocus={onFocus} onClose={onClose}>
      <div
        className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-1 font-mono [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ fontSize: 'clamp(0.65rem, 4cqw, 0.8rem)' }}
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((l, i) => (
          <div key={i} className={
            l.k === 'prompt' ? 'text-green-400' :
            l.k === 'dim' ? 'text-gray-600' :
            'text-gray-300'
          }>
            {l.t}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={submit} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-t border-gray-800">
        <span className="text-green-400 font-mono whitespace-nowrap" style={{ fontSize: 'clamp(0.65rem, 4cqw, 0.8rem)' }}>
          <span className="text-cyan-500">{user}</span>
          <span className="text-gray-600">@</span>
          <span className="text-purple-400">{HOST}</span>
          <span className="text-gray-500">:~$</span>
        </span>
        <input
          ref={(el) => { inputRef.current = el; if (focused) el?.focus(); }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent outline-none text-gray-200 font-mono min-w-0"
          style={{ fontSize: 'clamp(0.65rem, 4cqw, 0.8rem)' }}
          spellCheck="false" autoComplete="off"
        />
      </form>
    </Window>
  );
}
