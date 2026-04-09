import { useState } from 'react';
import Window from '../ui/window';

const ALL_APPS = ['cli', 'notepad', 'camera', 'help', 'files', 'browser', 'settings'];

const BASE = import.meta.env.BASE_URL;

const WALLPAPERS = [
  { label: 'Black', value: 'color:bg-black', preview: null },
  { label: 'Dark Gray', value: 'color:bg-gray-950', preview: null },
  { label: 'Deep Blue', value: 'color:bg-[#020818]', preview: null },
  { label: 'Deep Purple', value: 'color:bg-[#0d0010]', preview: null },
  { label: 'Dark Green', value: 'color:bg-[#001a0d]', preview: null },
  { label: 'Dark Red', value: 'color:bg-[#1a0000]', preview: null },
  { label: 'Photo 1', value: `img:${BASE}wallpapers/adrien-olichon-RCAhiGJsUUE-unsplash.jpg`, preview: `${BASE}wallpapers/adrien-olichon-RCAhiGJsUUE-unsplash.jpg` },
  { label: 'Photo 2', value: `img:${BASE}wallpapers/boicu-andrei-LgJsrwAYU8k-unsplash.jpg`, preview: `${BASE}wallpapers/boicu-andrei-LgJsrwAYU8k-unsplash.jpg` },
  { label: 'Photo 3', value: `img:${BASE}wallpapers/clay-banks-TQYTWfN1b7M-unsplash.jpg`, preview: `${BASE}wallpapers/clay-banks-TQYTWfN1b7M-unsplash.jpg` },
  { label: 'Photo 4', value: `img:${BASE}wallpapers/daniel-leone-g30P1zcOzXo-unsplash.jpg`, preview: `${BASE}wallpapers/daniel-leone-g30P1zcOzXo-unsplash.jpg` },
  { label: 'Photo 5', value: `img:${BASE}wallpapers/fairuz-isni-CoWsg5McHac-unsplash.jpg`, preview: `${BASE}wallpapers/fairuz-isni-CoWsg5McHac-unsplash.jpg` },
  { label: 'Photo 6', value: `img:${BASE}wallpapers/samuel-sng-MNzVgkiJk9Q-unsplash.jpg`, preview: `${BASE}wallpapers/samuel-sng-MNzVgkiJk9Q-unsplash.jpg` },
  { label: 'Photo 7', value: `img:${BASE}wallpapers/sebastian-svenson-d2w-_1LJioQ-unsplash.jpg`, preview: `${BASE}wallpapers/sebastian-svenson-d2w-_1LJioQ-unsplash.jpg` },
];

const POSITIONS = ['bottom', 'top', 'left', 'right'];

export default function Settings({ id, focused, onFocus, onClose, settings, onSettings, trash, onRestoreTrash, onEmptyTrash, onResetUser }) {
  const [tab, setTab] = useState('wallpaper');

  const tabs = ['wallpaper', 'taskbar', 'trash', 'system'];

  return (
    <Window id={id} title="settings" focused={focused} onFocus={onFocus} onClose={onClose}>
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex flex-col gap-1 p-2 border-r border-gray-800 w-28 flex-shrink-0">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-left px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${tab === t ? 'bg-gray-800 text-gray-200' : 'text-gray-600 hover:text-gray-400'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0 overflow-y-auto p-4 hide-scroll">

          {tab === 'wallpaper' && (
            <div className="flex flex-col gap-3">
              <p className="font-mono text-gray-500 text-[10px] tracking-widest uppercase">Wallpaper</p>
              <div className="grid grid-cols-3 gap-2">
                {WALLPAPERS.map(w => (
                  <button key={w.value} onClick={() => onSettings({ ...settings, wallpaper: w.value })}
                    className={`h-16 rounded-xl border-2 overflow-hidden transition-colors relative ${settings.wallpaper === w.value ? 'border-cyan-400' : 'border-gray-700 hover:border-gray-500'}`}>
                    {w.preview
                      ? <img
                          src={w.preview}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          width="120"
                          height="64"
                          style={{ contentVisibility: 'auto' }}
                        />
                      : <div className={`w-full h-full ${w.value.replace('color:', '')}`} />}
                    <span className="absolute bottom-0 left-0 right-0 text-center font-mono text-[8px] text-gray-300 bg-black/50 py-0.5">{w.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'taskbar' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="font-mono text-gray-500 text-[10px] tracking-widest uppercase">Visible Apps</p>
                {ALL_APPS.map(kind => (
                  <label key={kind} className="flex items-center gap-3 cursor-pointer group">
                    <div onClick={() => onSettings({ ...settings, hiddenApps: settings.hiddenApps.includes(kind) ? settings.hiddenApps.filter(k => k !== kind) : [...settings.hiddenApps, kind] })}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${!settings.hiddenApps.includes(kind) ? 'bg-cyan-500 border-cyan-500' : 'border-gray-600 bg-transparent'}`}>
                      {!settings.hiddenApps.includes(kind) && <span className="text-black text-[10px] font-bold">✓</span>}
                    </div>
                    <span className="font-mono text-xs text-gray-400 group-hover:text-gray-200 transition-colors capitalize">{kind}</span>
                  </label>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-mono text-gray-500 text-[10px] tracking-widest uppercase">Position</p>
                <div className="grid grid-cols-2 gap-2">
                  {POSITIONS.map(pos => (
                    <button key={pos} onClick={() => onSettings({ ...settings, taskbarPos: pos })}
                      className={`py-1.5 rounded-lg font-mono text-xs transition-colors capitalize ${settings.taskbarPos === pos ? 'bg-gray-700 text-gray-200' : 'text-gray-600 border border-gray-800 hover:text-gray-400'}`}>
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => onSettings({ ...settings, autoHide: !settings.autoHide })}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${settings.autoHide ? 'bg-cyan-500 border-cyan-500' : 'border-gray-600'}`}>
                  {settings.autoHide && <span className="text-black text-[10px] font-bold">✓</span>}
                </div>
                <span className="font-mono text-xs text-gray-400">Auto-hide taskbar</span>
              </label>
            </div>
          )}

          {tab === 'trash' && (
            <div className="flex flex-col gap-3">
              <p className="font-mono text-gray-500 text-[10px] tracking-widest uppercase">Recycle Bin</p>
              {trash.length === 0 ? (
                <p className="font-mono text-gray-700 text-xs">empty</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {trash.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-gray-900">
                      <span className="font-mono text-xs text-gray-400 truncate">{item.name}</span>
                      <button onClick={() => onRestoreTrash(i)} className="font-mono text-[10px] text-gray-600 hover:text-gray-300 transition-colors ml-2">restore</button>
                    </div>
                  ))}
                  <button onClick={onEmptyTrash} className="mt-2 py-1.5 rounded-lg border border-red-900 text-red-500 hover:bg-red-900/20 font-mono text-xs transition-colors">
                    Empty Trash
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'system' && (
            <div className="flex flex-col gap-3">
              <p className="font-mono text-gray-500 text-[10px] tracking-widest uppercase">System</p>
              <button onClick={onResetUser}
                className="py-2 rounded-lg border border-red-900 text-red-500 hover:bg-red-900/20 font-mono text-xs transition-colors">
                Reset User Data
              </button>
              <p className="font-mono text-gray-700 text-[10px]">clears saved user and files, returns to login</p>
            </div>
          )}

        </div>
      </div>
    </Window>
  );
}
