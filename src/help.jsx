import Window from './window';

const CONTENT = `SUPRLAND* — KEYBOARD SHORTCUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WINDOWS
  alt + enter    open terminal
  alt + n        open notepad
  alt + c        open camera
  alt + d        close focused window
  middle click   close window

TERMINAL COMMANDS
  help           list commands
  echo <text>    print text
  date           print current date/time
  clear          clear terminal output

NOTEPAD
  alt + s        save note to desktop

CAMERA
  photo          take a photo
  video          record a video clip
  audio          record audio only
  [ save ]       save capture to desktop
  [ discard ]    discard capture

DESKTOP
  click file     open file viewer
  hover file     reveal delete button`;

export default function Help({ id, focused, onFocus, onClose }) {
  return (
    <Window id={id} title="help" focused={focused} onFocus={onFocus} onClose={onClose}>
      <pre className="flex-1 min-h-0 overflow-auto p-4 font-mono text-gray-400 text-xs whitespace-pre-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {CONTENT}
      </pre>
    </Window>
  );
}
