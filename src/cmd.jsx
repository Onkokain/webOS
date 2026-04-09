import { useEffect, useState,useRef } from "react";
import Window from './window';
import {fsDelete} from './fsUtils';

const HOST='Suprland';

const run=(cmd,user,cwd,setCwd,fs,setFs)=> {
    const root=`/home/${user}/`;
    const [base,...rest]=cmd.trim().split(/\s+/);
    const arg=rest.join(' ');

    const resolvePath=(p) => {
        if (!p || p==='~') return root;
        if (p.startsWith('/')) return p.endsWith('/') ? p : p+"/";
        const parts = [...cwd.split('/').filter(Boolean), ...p.split('/').filter(Boolean)];
        const resolved=[];
        for (const part of parts) {
            if (part==='..') resolved.pop();
            else resolved.push(part);
        }
        return '/'+resolved.join('/')+'/';
        }

    switch (base.toLowerCase()) {
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
      '  clear              :   clear terminal',   
      '  color <color>      :   change text color', 
      '  kill <pid>         :   kill a process',
      '  hackertype         :   type like a hacker',
      '  browser <url>      :   open url in browser',
        ]

        case 'cd': {
            const target=resolvePath(arg);
            if (!target.startsWith(root)) return [`cd: permission denied: cannot go above /home/${user}`];
            if (target!==root && !fs[target]) return [`cd: ${arg}: no such directory`];
            setCwd(target);
            return [];
        }

        case 'ls': {
            const dir=arg ? resolvePath(arg) : cwd;
            const entries=Object.keys(fs).filter((k) => {
                if (k === dir) return false;
                const rel = k.slice(dir.length);
                return k.startsWith(dir) && rel.split('/').filter(Boolean).length === 1;
            });
            return entries.length ? entries.map((k) => k.slice(dir.length).replace(/\/$/, '') + (fs[k].type === 'dir' ? '/' : '')) : ['(empty)'];
        }

        case 'mkdir': {
            if (!arg) return ['usage: mkdir <dir>'];
            const path= resolvePath(arg);
            if (fs[path]) return [`mkdir: ${arg}: already exists`];
            setFs(p => ({...p, [path]: {type: 'dir'}}));
            return [];
        }

        case 'touch': {
            if (!arg) return ['usage: touch <file>'];
            const path=`${cwd}${arg}`;
            setFs(p => (
                {
                    ...p, [path]: p[path] ?? {type: 'file', text: ''}
                }
            ));
            return [];
            

        }

        case 'cat': {
            if (!arg) return ['usage: cat <file>'];
            const path=`${cwd}${arg}`;
            if (!fs[path]) return [`cat: ${arg}: no such file`];
            if (fs[path].type==='dir') return [`cat: ${arg}: is a directory`];
            return (fs[path].text || '').split('\n');

        }

        case 'rm' : {
            if (!arg) return ['usage: rm <path>'];
            const path= arg.endsWith('/') ? resolvePath(arg) :
            `${cwd}${arg}`;
            if (!fs[path]) return [`rm: ${arg}: no such file or directory`];
            setFs(p => fsDelete(p,path));
            return[];
        }

        case 'pwd' : {
            return [cwd.slice(0,-1)];
        }

        case 'echo' : {
            return[arg||''];
        }

        case 'date' : {
            return [new Date().toString()];
        }

        case 'whoami' : {
            return [user];
        }

        case 'hostname' : {
            return [HOST];
        }

        case 'uname' : {
            return['Suprland* 0.1 (web-os)']
        }

        case 'uptime' : {
            return 
                [
                    `up ${Math.floor(performance.now() / 3600000)}h ${Math.floor((performance.now() % 3600000) / 60000)}m ${Math.floor((performance.now() % 60000) / 1000)}s`
                ]
            
        }    

        case 'history' : {
            return ['__HISTORY__'];
        }

        case 'cal' : {
            return['cal: under developement'];
        }

        case 'hackertype' : {
            return['hackertype: under developement'];
            
        }

        case 'color' : {
            return['color: under developement'];
            
        }

        case 'kill' : {
            return['kill: under developement'];
            
        }
        case 'env' : {
            return['env: under developement'];
            
        }

        case 'browser' : {
            return['browser: under developement'];
            
        }

        case 'clear' :
        case 'cls' : {
            return['__CLEAR__'];                
        }
        default: return [`${base}: command not found`];
    }
};

const BOOT= (user) => [
    {k: 'dim', t:`Suprland* 0.1 - welcome, ${user}`},
    {k: 'dim', t:'Type help for available commands'},
    {k: 'dim', t:'-'.repeat(44)},
];

export default function Cli({id,focused,onFocus,onClose,user,fs,setFs}) {
    const root=`/home/${user}/`;
    const [input,setInput]=useState('');
    const [history,setHistory]=useState(BOOT(user));
    const [cmdHistory,setCmdHistory]=useState([]);
    const [histIdx,setHistIdx]=useState(-1);
    const [cwd,setCwd]=useState('/home/');
    const bottomRef=useRef(null);
    const inputRef=useRef(null);

    const shortCwd=cwd===root ? '~' : cwd==='/home/' ? '/home' : '~/' + cwd.slice(root.length).replace(/\/$/,'');

    const scrollBottom= () => setTimeout(() => bottomRef.current?.scrollIntoView(),0);

    const submit=(e) => {
        e.preventDefault();
        const cmd=input.trim();
        if (!cmd) return;
        const out=run(cmd,user,cwd,setCwd,fs,setFs);
        if (out[0]==='__CLEAR__') {
            setHistory([]);
        }
        else if (out[0]==='__HISTORY__') {
            setHistory((h) => [...h,
                {k: 'prompt', 
                 t: `${user}@${HOST}:${shortCwd}$ ${cmd}`
                },
                ...cmdHistory.map((c,i) => ({k : 'out', t: ` ${cmdHistory.length-i} ${c}`}))
            ]);
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
            setInput(i===-1 ? '' : cmdHistory[i]);
        }
    };

    return (
        <>
            <Window id={id} title={`${user}@${HOST}`} focused={focused} onFocus={onFocus} onClose={onClose}>
            <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-1 font-mono hide-scroll text-[clamp(0.65rem,4cqw,0.8rem)]"
                onClick={() => inputRef.current?.focus()}>
                {history.map((l, i) => (
                <div key={i} className={l.k === 'prompt' ? 'text-green-400' : l.k === 'dim' ? 'text-gray-600' : 'text-gray-300'}>{l.t}</div>
                ))}
                <div ref={bottomRef} />
            </div>
            <form onSubmit={submit} className="flex-shrink-0 row gap-2 px-3 py-2 border-t border-gray-800">
                <span className="font-mono whitespace-nowrap text-[clamp(0.65rem,4cqw,0.8rem)]" >
                <span className="text-cyan-500">{user}</span>
                <span className="text-gray-600">@</span>
                <span className="text-purple-400">{HOST}</span>
                <span className="text-gray-500">:{shortCwd}$</span>
                </span>
                <input ref={(el) => { inputRef.current = el; if (focused) el?.focus(); }}
                value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown}
                className="flex-1 bg-transparent outline-none text-gray-200 font-mono min-w-0 text-[clamp(0.65rem,4cqw,0.8rem)]"
                spellCheck="false" autoComplete="off" />
            </form>
            </Window>
        
        
        </>
    )
}