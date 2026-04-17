import Window from '../ui/window';

const CONTENT = `SUPRLAND* — KEYBOARD SHORTCUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DESKTOP:
Middle Click Drag  : Move Wallpaper
Ctrl + Left Click  : Move Widget
Right Click        : Create New Files/Folders
F2                 : Rename Selected File/Folder
Ctrl + C           : Copy Selected Files/Folders
Ctrl + X           : Cut Selected Files/Folders
Ctrl + V           : Paste Files/Folders
Delete             : Delete Selected Files/Folders
Shift + Click      : Multi-select Files/Folders
Double Click       : Open File/Folder

WINDOWS:
  Ctrl + enter    :   open terminal
  Ctrl + n        :   open notepad
  Ctrl + c        :   open camera
  Ctrl + h        :   open help
  Ctrl + f        :   open file manager
  Ctrl + b        :   open browser
  Ctrl + s        :   open settings
  Ctrl + d        :   close focused window
  middle click    :   close window (middle click on title bar)
  Ctrl + arrow keys : change focused windows

TERMINAL COMMANDS
  help               :   show all commands
  echo <text>        :   print text
  date               :   print date and time
  whoami             :   print current user
  hostname           :   print hostname
  uname              :   print system info
  uptime             :   print session uptime
  pwd                :   print working directory
  cd <dir>           :   change directory
  ls [dir]           :   list directory contents
  mkdir <dir>        :   create a directory
  touch <file>       :   create empty file
  cat <file>         :   print file contents
  rm <path>          :   delete file or directory
  history            :   show command history
  cal                :   print current month calendar
  env                :   print environment variables
  color <color>      :   change text color
  browser <url>      :   open url in browser
  hackertype         :   type like a hacker
  heaven             :   easter egg
  clear / cls        :   clear terminal output
  keybinds           :  edit default keybinds


NOTEPAD
  Ctrl + s        :   save note to desktop

CAMERA
  photo          :   take a photo
  video          :   record a video clip
  audio          :   record audio only
  [ save ]       :   save capture to desktop
  [ discard ]    :   discard capture

FILE MANAGER
  single click   :   select file/folder
  double click   :   open file or navigate folder
  Ctrl + click   :   toggle selection
  Shift + click  :   select range
  delete         :   delete selected files
  Ctrl + c       :   copy selected files
  Ctrl + x       :   cut selected files
  Ctrl + v       :   paste files
  right click    :   context menu

SETTINGS
  wallpaper      :   change desktop wallpaper
  taskbar        :   configure taskbar position
  Personalize    :   customize size, color and font
  System         :   Reset User Data
`;

 export default function Help({ id, focused, onFocus, onClose }) {
  return (
    <Window id={id} title="help" focused={focused} onFocus={onFocus} onClose={onClose}>
      <pre className="flex-1 min-h-0 overflow-y-auto p-4 font-mono text-gray-400 text-xs hide-scroll">
        {CONTENT}
      </pre>
    </Window>
  );
}
