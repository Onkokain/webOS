import Window from './window';

const CONTENT = `SUPRLAND* — KEYBOARD SHORTCUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WINDOWS
  alt + enter    open terminal
  alt + n        open notepad
  alt + c        open camera
  alt + h        open help
  alt + f        open file manager
  alt + d        close focused window
  middle click   close window

TERMINAL COMMANDS
  help               show all commands
  echo <text>        print text
  date               print date and time
  whoami             print current user
  hostname           print hostname
  uname              print system info
  uptime             print session uptime
  pwd                print working directory
  ls                 list terminal files
  cat <file>         print file contents
  rm <file>          delete a file
  touch <file>       create empty file
  history            show command history
  cal                print current month calendar
  env                print environment variables
  banner <text>      print large ascii text
  clear              clear terminal output

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
