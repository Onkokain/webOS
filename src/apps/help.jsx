import Window from '../ui/window';

const CONTENT = `SUPRLAND* — KEYBOARD SHORTCUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WINDOWS
  ctrl + enter    :   open terminal
  ctrl + n        :   open notepad
  ctrl + c        :   open camera
  ctrl + h        :   open help
  ctrl + f        :   open file manager
  ctrl + b        :   open browser
  ctrl + s        :   open settings
  ctrl + d        :   close focused window
  ctrl + shift + f:   toggle float/tile window
  middle click   :   close window

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
  color <color>      :   change text color (green|cyan|white|yellow|red|reset)
  browser <url>      :   open url in browser
  hackertype         :   type like a hacker
  heaven             :   easter egg
  clear / cls        :   clear terminal output

NOTEPAD
  ctrl + s        :   save note to desktop

CAMERA
  photo          :   take a photo
  video          :   record a video clip
  audio          :   record audio only
  [ save ]       :   save capture to desktop
  [ discard ]    :   discard capture

FILE MANAGER
  single click   :   select file/folder
  double click   :   open file or navigate folder
  ctrl + click   :   toggle selection
  shift + click  :   select range
  delete         :   delete selected files
  ctrl + c       :   copy selected files
  ctrl + x       :   cut selected files
  ctrl + v       :   paste files
  right click    :   context menu

DESKTOP
  single click   :   select icon
  double click   :   open file/folder
  drag icons     :   move icons
  shift + drag   :   multi-select with band
  delete         :   delete selected files
  f2             :   rename selected file
  ctrl + c       :   copy selected files
  ctrl + x       :   cut selected files
  ctrl + v       :   paste files
  right click    :   context menu

SETTINGS
  wallpaper      :   change desktop wallpaper
  taskbar        :   configure taskbar position
  auto-hide      :   toggle taskbar auto-hide
  hidden apps    :   hide apps from taskbar
  reset user     :   clear all data and restart`;

 export default function Help({ id, focused, onFocus, onClose }) {
  return (
    <Window id={id} title="help" focused={focused} onFocus={onFocus} onClose={onClose}>
      <pre className="flex-1 min-h-0 overflow-y-auto p-4 font-mono text-gray-400 text-xs hide-scroll">
        {CONTENT}
      </pre>
    </Window>
  );
}
