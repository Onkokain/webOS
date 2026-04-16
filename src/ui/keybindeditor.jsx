import { useEffect,useState } from "react";

export default function KeybindEditor({keybinds,setKeybinds,onClose}){
    const [buffer,setBuffer]=useState('');
    const [isDirty,setIsDirty]=useState(false);

    useEffect(()=> {
        const formatKeybinds=() => {
            let text='';
            text+='';

            for (const action in keybinds) {
                const kb=keybinds[action];
                const keys=[];

                if (kb.ctrlKey) keys.push('Ctrl');
                if (kb.altKey) keys.push('Alt');
                if (kb.shiftKey) keys.push('Shift');
                keys.push(kb.key);
                text+=`${action}=${keys.join('+')}\n`;
            }
            return text;
        };
        setBuffer(formatKeybinds());
    }, [keybinds]);

    const handleSave =() => {
        const newKeybinds={...keybinds};
        const lines=buffer.split('\n');

        lines.forEach(line => {
            if (line.startsWith('#') || line.trim()==='') return;

            const [action,combo]=line.split('=');

            if (newKeybinds[action]) {
                const parts=combo.split('+');
                const newKb={
                    key: parts.pop(),
                    ctrlKey: parts.includes('Ctrl'),
                    altKey: parts.includes('Alt'),
                    shiftKey: parts.includes('Shift'),
                    label: newKeybinds[action].label
                };
                newKeybinds[action]=newKb;
            }
        });
        setKeybinds(newKeybinds);
        setIsDirty(false);
    }

    useEffect(() => {
        const handleKeyDown=(e) => {
            if (e.altKey && e.key.toLowerCase()==='s') {
                e.preventDefault();
                handleSave();
            }

            if (e.altKey && e.key.toLowerCase()==='x') {
                e.preventDefault();
                onClose();
            }

        }
        window.addEventListener('keydown',handleKeyDown);
        return () => {window.removeEventListener('keydown',handleKeyDown)};

    },[buffer,onClose]);

    return(
        <div className="absolute border border-blue rounded-sm inset-0 bg-black/95 z-[100] flex flex-col font-mono">
            <div className="bg-black text-black px-2 py-1 flex justify-between flex-col">
                <div className='w-full items-center justify-center flex '>Suprland Keybind Editor</div>
                <span>‎ </span>
                <span>#Suprland Keybinds</span>
                <span># Press Alt+S to Save, Alt+X to Exit</span>

                <span>{isDirty ? '(modified)' : ''}</span>
            </div>
            <textarea
                className="flex-1 bg-transparent text-white p-2 outline-none resize-none"
                value={buffer}
                onChange={(e) => {
                    setBuffer(e.target.value);
                    setIsDirty(true);
                }}
                spellCheck={false}
                autoComplete='off'
            />
            <div className="bg-black text-black px-2 py-1 flex gap-4">
                <span>Alt+S Save</span>
                <span>Alt+X Exit</span>
            </div>

        </div>
    )

}
