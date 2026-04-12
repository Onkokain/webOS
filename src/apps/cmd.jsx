import { useEffect, useState,useRef } from "react";
import Window from '../ui/window';
import {fsDelete} from '../utils/fsUtils';
const HOST='Suprland';

const run = (command, user, currentWorkingDirectory, setCurrentWorkingDirectory, filesystem, setFilesystem) => {

    const userHomeDirectory = `/home/${user}/`;
    const commandParts = command.trim().split(/\s+/);
    const baseCommand = commandParts[0];
    const commandArguments = commandParts.slice(1).join(' ');

    const resolvePath = (inputPath) => {
        const isHomeShortcut = !inputPath || inputPath === '~';
        
        if (isHomeShortcut) {
            return userHomeDirectory;
        }
        
        const isAbsolutePath = inputPath.startsWith('/');
        
        if (isAbsolutePath) {
            return inputPath.endsWith('/') ? inputPath : inputPath + "/";
        }
        
        const currentPathParts = currentWorkingDirectory.split('/').filter(Boolean);
        const inputPathParts = inputPath.split('/').filter(Boolean);
        const allPathParts = [...currentPathParts, ...inputPathParts];
        const resolvedPathParts = [];
        
        for (const pathPart of allPathParts) {
            const isParentDirectory = pathPart === '..';
            
            if (isParentDirectory) {
                resolvedPathParts.pop();
            } else {
                resolvedPathParts.push(pathPart);
            }
        }
        
        return '/' + resolvedPathParts.join('/') + '/';
    }

    switch (baseCommand.toLowerCase()) {
        case 'help': return [
      'available commands:',
      '  help               :   show this message',
      '  echo <text>        :   print text',
      '  date               :   print date and time',
      '  whoami             :   print current user',
      '  hostname           :   print hostname',
      '  uname              :   print system info',
      '  uptime             :   print session uptime',
      '  pwd                :   print working directory',
      '  cd <dir>           :   change directory',
      '  ls [dir]           :   list directory contents',
      '  mkdir <dir>        :   create a directory',
      '  touch <file>       :   create empty file',
      '  cat <file>         :   print file contents',
      '  rm <path>          :   delete file or directory',
      '  history            :   show command history',
      '  cal                :   print current month calendar',
      '  env                :   print environment variables',
      '  color <color>      :   change text color',
      '                         (green|cyan|white|yellow|red|reset)',
      '  browser <url>      :   open url in browser',
      '  hackertype         :   type like a hacker',
      '  heaven             :   easter egg',
      '  clear / cls        :   clear terminal',
        ]

        case 'cd': {
            const target = resolvePath(commandArguments);
            if (!target.startsWith(userHomeDirectory)) return [`cd: permission denied: cannot go above /home/${user}`];
            if (target !== userHomeDirectory && !filesystem[target]) return [`cd: ${commandArguments}: no such directory`];
            setCurrentWorkingDirectory(target);
            return [];
        }

        case 'ls': {
            const dir = commandArguments ? resolvePath(commandArguments) : currentWorkingDirectory;
            const entries = Object.keys(filesystem).filter((k) => {
                if (k === dir) return false;
                const rel = k.slice(dir.length);
                return k.startsWith(dir) && rel.split('/').filter(Boolean).length === 1;
            });
            return entries.length ? entries.map((k) => k.slice(dir.length).replace(/\/$/, '') + (filesystem[k].type === 'dir' ? '/' : '')) : ['(empty)'];
        }

        case 'mkdir': {
            if (!commandArguments) return ['usage: mkdir <dir>'];
            const path = resolvePath(commandArguments);
            if (filesystem[path]) return [`mkdir: ${commandArguments}: already exists`];
            setFilesystem(p => ({...p, [path]: {type: 'dir'}}));
            return [];
        }

        case 'touch': {
            if (!commandArguments) return ['usage: touch <file>'];
            const path = `${currentWorkingDirectory}${commandArguments}`;
            setFilesystem(p => ({
                ...p, [path]: p[path] ?? {type: 'file', text: ''}
            }));
            return [];
        }

        case 'cat': {
            if (!commandArguments) return ['usage: cat <file>'];
            const path = `${currentWorkingDirectory}${commandArguments}`;
            if (!filesystem[path]) return [`cat: ${commandArguments}: no such file`];
            if (filesystem[path].type === 'dir') return [`cat: ${commandArguments}: is a directory`];
            return (filesystem[path].text || '').split('\n');
        }

        case 'rm': {
            if (!commandArguments) return ['usage: rm <path>'];
            const path = commandArguments.endsWith('/') ? resolvePath(commandArguments) : `${currentWorkingDirectory}${commandArguments}`;
            if (!filesystem[path]) return [`rm: ${commandArguments}: no such file or directory`];
            setFilesystem(p => fsDelete(p, path));
            return [];
        }

        case 'pwd': {
            return [currentWorkingDirectory.slice(0, -1)];
        }

        case 'echo': {
            return [commandArguments || ''];
        }

        case 'date': {
            return [new Date().toString()];
        }

        case 'whoami': {
            return [user];
        }

        case 'hostname': {
            return [HOST];
        }

        case 'uname': {
            return ['Suprland* 0.1 (web-os)'];
        }

        case 'uptime': {
            return [`up ${Math.floor(performance.now() / 3600000)}h ${Math.floor((performance.now() % 3600000) / 60000)}m ${Math.floor((performance.now() % 60000) / 1000)}s`];
        }

        case 'history': {
            return ['__HISTORY__'];
        }

        case 'cal': {
            const now = new Date();
            const y = now.getFullYear(), m = now.getMonth();
            const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            const first = new Date(y, m, 1).getDay();
            const days = new Date(y, m + 1, 0).getDate();
            const lines = [`   ${months[m]} ${y}`, 'Su Mo Tu We Th Fr Sa'];
            let row = '   '.repeat(first);
            for (let d = 1; d <= days; d++) {
                row += String(d).padStart(2) + ' ';
                if ((first + d) % 7 === 0) { lines.push(row.trimEnd()); row = ''; }
            }
            if (row.trim()) lines.push(row.trimEnd());
            return lines;
        }

        case 'hackertype':
            case 'hacktype': {
            return ['__HACKERTYPE__'];
        }

        case 'color': {
            if (!commandArguments) return ['usage: color <green|cyan|white|yellow|red|reset>'];
            const valid = ['green','cyan','white','yellow','red','reset'];
            if (!valid.includes(commandArguments)) return [`color: invalid color. choose: ${valid.join(', ')}`];
            return [`__COLOR__:${commandArguments}`];
        }

        case 'size': {
            if (!commandArguments) return ['usage: size <font size in px (default:14)>'];
            if (isNaN(commandArguments)) return ['Invalid size. Enter a number!'];
            return [`__SIZE__:${commandArguments}`];
        }

        case 'kill': {
            if (!commandArguments) return ['usage: kill <pid>', 'use ps to list processes'];
            return [`kill: ${commandArguments}: no such process`];
        }

        case 'env': {
            return [
                `USER=${user}`,
                `HOME=/home/${user}`,
                `HOSTNAME=${HOST}`,
                `SHELL=/bin/suprsh`,
                `TERM=xterm-256color`,
                `OS=Suprland* 0.1`,
                `PWD=${currentWorkingDirectory}`,
            ];
        }

        case 'browser': {
            if (!commandArguments) return ['usage: browser <url>'];
            const url = commandArguments.startsWith('http') ? commandArguments : 'https://' + commandArguments;
            return [`__BROWSER__:${url}`];
        }

        case 'clear':
        case 'cls': {
            return ['__CLEAR__'];
        }

        case 'sudo': {
            return ['nice try but it ain\'t happening'];
        }

        case 'heaven': {
            const url = 'https://www.youtube.com/embed/QQ80jnUTQEE';
            return [`__BROWSER__:${url}`];
        }

        default: return [`${baseCommand}: command not found`];
    }
};

const BOOT= (user) => [
    {k: 'dim', t:`Suprland* 0.1 - welcome, ${user}`},
    {k: 'dim', t:'Type help for available commands'},
    {k: 'dim', t:'-'.repeat(44)},
];

export default function Cli({id,focused,onFocus,onClose,user,fs,setFs,onOpenApp}) {
    const [fontSize,setFontSize]=useState(14);
    const root=`/home/${user}/`;
    const [input,setInput]=useState('');
    const [history,setHistory]=useState(BOOT(user));
    const [cmdHistory,setCmdHistory]=useState(() => {
        const saved = localStorage.getItem(`suprland-cmd-history-${user}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [histIdx,setHistIdx]=useState(-1);
    const [cwd,setCwd]=useState('/home/');
    const [outputColor,setOutputColor]=useState('text-gray-300');
    const [hackerActive,setHackerActive]=useState(false);
    const bottomRef=useRef(null);
    const inputRef=useRef(null);
    const hackerRef=useRef(null);

    useEffect(() => {
        localStorage.setItem(`suprland-cmd-history-${user}`, JSON.stringify(cmdHistory));
    }, [cmdHistory, user]);

    const shortCwd=cwd===root ? '~' : cwd==='/home/' ? '/home' : '~/' + cwd.slice(root.length).replace(/\/$/,'');

    const scrollBottom= () => setTimeout(() => bottomRef.current?.scrollIntoView(),0);

    const submit=(e) => {
        e.preventDefault();
        if (hackerActive) return;
        const cmd=input.trim();
        if (!cmd) return;
        const out=run(cmd,user,cwd,setCwd,fs,setFs);

        if (out[0]==='__CLEAR__') {
            setHistory([BOOT(user)[0],BOOT(user)[1],BOOT(user)[2]]);
            
        }
        else if (out[0]==='__HISTORY__') {
            setHistory((h) => [...h,
                {k: 'prompt', 
                 t: `${user}@${HOST}:${shortCwd}$ ${cmd}`
                },
                ...cmdHistory.map((c,i) => ({k : 'out', t: ` ${cmdHistory.length-i} ${c}`}))
            ]);
        }
        else if (out[0]==='__HACKERTYPE__') {
            setHistory((h) => [...h, {k: 'prompt', t: `${user}@${HOST}:${shortCwd}$ ${cmd}`}]);
            setOutputColor('text-green-400');
            setHackerActive(true);
            setHistory(h=> [...h,{k:'dim', t:'Hackertype started!'},{k:'dim', t:'Press Esc to end.'}])
            fetch('/webOS/hackertype.txt').then(res => res.text()).then(text => {
                let i=0;
                const handler=(e) => {
                    if (e.key==='Escape') {
                        document.removeEventListener('keydown', handler);
                        setHackerActive(false);
                        return;
                    }

                    if (i>=text.length) i=0;
                    const char=text.slice(i,i+8);
                    i+=8;
                    setHistory(h=> {
                        const last=h[h.length-1];
                        if (char.includes('\n')) {
                            return [...h, {k:'out',t: char.replace('\n','')}]
                        }
                        if (last?.k==='out') 
                            return [...h.slice(0,-1), {k:'out',t: last.t+char}];
                        return [...h, {k:'out',t: char}]
                        
                    })
                    scrollBottom();

                }
                hackerRef.current=handler
                document.addEventListener('keydown', handler);
            })
                
            
        }
        else if (out[0]?.startsWith('__BROWSER__:')) {
            const url = out[0].slice('__BROWSER__:'.length);
            onOpenApp?.('browser', url);
            setHistory((h) => [...h, {k: 'prompt', t: `${user}@${HOST}:${shortCwd}$ ${cmd}`}, {k: 'out', t: `launching browser → ${url}`}]);
        }
        else if (out[0]?.startsWith('__COLOR__:')) {
            const color = out[0].split(':')[1];
            const colorMap = { green:'text-green-400', cyan:'text-cyan-400', white:'text-white', yellow:'text-yellow-400', red:'text-red-400', reset:'text-gray-300' };
            setOutputColor(colorMap[color] ?? 'text-gray-300');
            setHistory((h) => [...h, {k: 'prompt', t: `${user}@${HOST}:${shortCwd}$ ${cmd}`}, {k: 'out', t: `color set to ${color}`}]);
        }

        else if (out[0]?.startsWith('__SIZE__:')) {
            const size = out[0].split(':')[1] + 'px';
            setFontSize(size);
            setHistory((h) => [...h, {k: 'prompt', t: `${user}@${HOST}:${shortCwd}$ ${cmd}`}, {k: 'out', t: `font size set to ${size}`}]);
        }
        else {
            setHistory((h) => [...h,
                {k: 'prompt', t: `${user}@${HOST}:${shortCwd}$ ${cmd}`},
                ...out.map((t) => ({k: 'out', t})),
            ]);
        }

        setCmdHistory((h) => [cmd,...h]);
        setHistIdx(-1);
        setInput('');
        scrollBottom();
    };

    const onKeyDown=(e) => {
        if (e.ctrlKey && e.key === 'c' || e.key === 'Escape') {
            if (hackerActive) { clearInterval(hackerRef.current); setHackerActive(false); setHistory(h => [...h, {k:'dim', t:'Hackertype ended!'}]); }
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const i= Math.min(histIdx+1,cmdHistory.length-1);
            setHistIdx(i);
            setInput(cmdHistory[i] ?? '');
        }
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const i=Math.max(histIdx-1,-1);
            setHistIdx(i);
            if (i === -1) {
                setInput('');
            } else {
                setInput(cmdHistory[i]);
            }
        }
    };

    return (
        <>
            <Window 
            id={id} 
            title={`${user}@${HOST}`}
             focused={focused}
              onFocus={onFocus}
               onClose={onClose}
               >
            <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-1 font-mono hide-scroll]"
                style={{fontSize}}
                onClick={() => inputRef.current?.focus()}>
                {history.map((l, i) => (
                <div key={i} className={l.k === 'prompt' ? 'text-green-400' : l.k === 'dim' ? 'text-gray-600' : outputColor}>{l.t}</div>
                ))}
                <div ref={bottomRef} />
            </div>
            <form onSubmit={submit} className="flex-shrink-0 row gap-2 px-3 py-2 border-t border-gray-800">
                <span className="font-mono whitespace-nowrap "
                style={{fontSize}}
             >
                <span className="text-cyan-500">{user}</span>
                <span className="text-gray-600">@</span>
                <span className="text-purple-400">{HOST}</span>
                <span className="text-gray-500">:{shortCwd}$</span>
                </span>
                <input ref={(el) => { inputRef.current = el; if (focused) el?.focus(); }}
                value={input}
                 onChange={(e) => setInput(e.target.value)} 
                 onKeyDown={onKeyDown}
                 readOnly={hackerActive}
                className="flex-1 bg-transparent outline-none text-gray-200 font-mono min-w-0 "
                spellCheck="false" autoComplete="off" 
                style={{fontSize}}
                />
            </form>
            </Window>
        
        
        </>
    )
}