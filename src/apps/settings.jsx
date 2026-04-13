import { useState } from 'react';
import Window from '../ui/window';
import CuteButton from '../utils/cutebutton';
import { text } from 'motion/react-client';
const ALL_APPS = ['cli', 'notepad', 'camera', 'help', 'files', 'browser', 'settings'];

const BASE = import.meta.env.BASE_URL;

const WALLPAPERS = [
  { label: 'Black', value: 'color:bg-black', preview: null },
  { label: 'Dark Gray', value: 'color:bg-gray-950', preview: null },
  { label: 'Deep Blue', value: 'color:bg-[#020818]', preview: null },
  { label: 'Deep Purple', value: 'color:bg-[#0d0010]', preview: null },
  { label: 'Dark Green', value: 'color:bg-[#001a0d]', preview: null },
  { label: 'Dark Red', value: 'color:bg-[#1a0000]', preview: null },
  { label: 'Ocean', value: `img:${BASE}wallpapers/adrien-olichon-RCAhiGJsUUE-unsplash.jpg`, preview: null },
  { label: 'Twilight', value: `img:${BASE}wallpapers/boicu-andrei-LgJsrwAYU8k-unsplash.jpg`, preview: null },
  { label: 'Desert', value: `img:${BASE}wallpapers/clay-banks-TQYTWfN1b7M-unsplash.jpg`, preview: null },
  { label: 'Mountain', value: `img:${BASE}wallpapers/daniel-leone-g30P1zcOzXo-unsplash.jpg`, preview: null },
  { label: 'Autumn', value: `img:${BASE}wallpapers/fairuz-isni-CoWsg5McHac-unsplash.jpg`, preview: null },
  { label: 'Beach', value: `img:${BASE}wallpapers/samuel-sng-MNzVgkiJk9Q-unsplash.jpg`, preview: null },
  { label: 'Abstract', value: `img:${BASE}wallpapers/sebastian-svenson-d2w-_1LJioQ-unsplash.jpg`, preview: null },
];

const POSITIONS = ['bottom', 'top', 'left', 'right'];

export default function Settings({ id, focused, onFocus, onClose, settings, onSettings, onResetUser }) {
  const [tab, setTab] = useState('wallpaper');

  const tabs = ['wallpaper', 'taskbar', 'Personalize','system'];

  return (
    <Window id={id} title="settings" focused={focused} onFocus={onFocus} onClose={onClose}>
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex flex-col gap-1 p-2 border-r border-gray-800 w-28 flex-shrink-0">
          {tabs.map(tabName => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              className={`text-left px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
                tab === tabName
                  ? 'bg-gray-800 text-gray-200'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {tabName}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0 overflow-y-auto p-4 hide-scroll">

          {tab === 'wallpaper' && (
            <div className="flex flex-col gap-3">
              <p className="font-mono text-gray-500 text-[15px] tracking-widest uppercase">Wallpaper</p>
              <div className="grid grid-cols-3 gap-2">
                {WALLPAPERS.map(wallpaper => (
                  <button
                    key={wallpaper.value}
                    onClick={() => onSettings({ ...settings, wallpaper: wallpaper.value })}
                    className={`h-16 rounded-xl border-2 overflow-hidden transition-colors relative ${
                      settings.wallpaper === wallpaper.value
                        ? 'border-cyan-400'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {wallpaper.preview ? (
                      <img
                        src={wallpaper.preview}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width="120"
                        height="64"
                        style={{ contentVisibility: 'auto' }}
                      />
                    ) : (
                      <div className={`w-full h-full ${wallpaper.value.replace('color:', '')}`} />
                    )}
                    <span className="absolute bottom-0 left-0 right-0 text-center font-mono text-[8px] text-gray-300 bg-black/50 py-0.5">
                      {wallpaper.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'taskbar' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="font-mono text-gray-500 text-[15px] tracking-widest uppercase">Visible Apps</p>
                {ALL_APPS.map(appKind => (
                  <label key={appKind} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => {
                        const isCurrentlyHidden = settings.hiddenApps.includes(appKind);
                        const updatedHiddenApps = isCurrentlyHidden
                          ? settings.hiddenApps.filter(kind => kind !== appKind)
                          : [...settings.hiddenApps, appKind];
                        
                        onSettings({ ...settings, hiddenApps: updatedHiddenApps });
                      }}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        !settings.hiddenApps.includes(appKind)
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'border-gray-600 bg-transparent'
                      }`}
                    >
                      {!settings.hiddenApps.includes(appKind) && (
                        <span className="text-black text-[10px] font-bold">✓</span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-gray-400 group-hover:text-gray-200 transition-colors capitalize">
                      {appKind}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-mono text-gray-500 text-[10px] tracking-widest uppercase">Position</p>
                <div className="grid grid-cols-2 gap-2">
                  {POSITIONS.map(position => (
                    <button
                      key={position}
                      onClick={() => onSettings({ ...settings, taskbarPos: position })}
                      className={`py-1.5 rounded-lg font-mono text-xs transition-colors capitalize ${
                        settings.taskbarPos === position
                          ? 'bg-gray-700 text-gray-200'
                          : 'text-gray-600 border border-gray-800 hover:text-gray-400'
                      }`}
                    >
                      {position}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => onSettings({ ...settings, autoHide: !settings.autoHide })}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    settings.autoHide
                      ? 'bg-cyan-500 border-cyan-500'
                      : 'border-gray-600'
                  }`}
                >
                  {settings.autoHide && (
                    <span className="text-black text-[10px] font-bold">✓</span>
                  )}
                </div>
                <span className="font-mono text-xs text-gray-400">Auto-hide taskbar</span>
              </label>
            </div>
          )}

          {tab === 'system' && (
            <div className="flex flex-col gap-3">
              <p className="font-mono text-gray-500 text-[15px] tracking-widest uppercase">System</p>
              <button
                onClick={onResetUser}
                className="py-2 rounded-lg border border-red-900 text-red-500 hover:bg-red-900/20 font-mono text-xs transition-colors"
              >
                Reset User Data
              </button>
              <p className="font-mono text-gray-700 text-[10px]">Clears saved user and files, returns to login</p>
            </div>
          )}

          {tab === 'Personalize' && (
            <div className="flex flex-col gap-3">
              <p className="font-mono text-gray-500 text-[15px] tracking-widest uppercase">Personalize</p>
              <div className='flex gap-20 py-10'> 
            <div className='flex-col flex'> 
              <p className="font-mono text-gray-500 text-[12px] tracking-widest uppercase hover:scale-110 hover:text-white">Font Size  </p>
              <CuteButton  text={'07'} onclick={() => onSettings({...settings, fontSize: '07px'})} />
              <CuteButton  text={'10'} onclick={() => onSettings({...settings, fontSize: '10px'})} />
              <CuteButton  text={'13'} onclick={() => onSettings({...settings, fontSize: '13px'})} />
              <CuteButton  text={'17'} onclick={() => onSettings({...settings, fontSize: '17px'})} />
              <CuteButton  text={'21'} onclick={() => onSettings({...settings, fontSize: '21px'})} />
              <CuteButton  text={'32'} onclick={() => onSettings({...settings, fontSize: '32px'})} />
              <CuteButton  text={'default'} onclick={() => onSettings({...settings, fontSize: '16px'})} />

            </div>

              
           
            <div className='flex-col flex'> 
              <p className="font-mono text-gray-500 text-[12px] tracking-widest uppercase hover:scale-110 hover:text-white">Font Color  </p>
              <CuteButton  text={'red'} onclick={()=>onSettings({
                ...settings,
                textColor:'rgb(248, 113, 113)'
              })

              }/>
              <CuteButton  text={'blue'} onclick={()=>onSettings({
                ...settings,
                textColor:'rgb(0, 217, 255)'
              })

              }/>
              <CuteButton  text={'green'} onclick={()=>onSettings({
                ...settings,
                textColor:'rgb(0, 255, 136)'
              })}/>
              <CuteButton  text={'yellow'} onclick={()=>onSettings({
                ...settings,
                textColor:'rgb(255, 215, 0)'
              })}/>
              <CuteButton  text={'purple'} onclick={()=>onSettings({
                ...settings,
                textColor:'rgb(218, 112, 214)'
              })}/>
              <CuteButton  text={'orange'} onclick={()=>onSettings({
                ...settings,
                textColor:'rgb(255, 140, 66)'
              })}/>
              <CuteButton  text={'default'} onclick={()=>onSettings({
                ...settings,
                textColor:'rgb(200, 202, 202)'
              })}/>

            </div>            <div className='flex-col flex'> 
              <p className="font-mono text-gray-500 text-[12px] tracking-widest uppercase hover:scale-110 hover:text-white">Font Style  </p>
              <CuteButton  text={'mono'} onclick={() => onSettings({...settings, fontFamily: 'monospace'})} />
              <CuteButton  text={'sans'} onclick={() => onSettings({...settings, fontFamily: 'sans-serif'})} />
              <CuteButton  text={'serif'} onclick={() => onSettings({...settings, fontFamily: 'serif'})} />
              <CuteButton  text={'cursive'} onclick={() => onSettings({...settings, fontFamily: 'cursive'})} />
              <CuteButton  text={'fantasy'} onclick={() => onSettings({...settings, fontFamily: 'fantasy'})} />
              <CuteButton  text={'hacker'} onclick={() => onSettings({...settings, fontFamily: 'Saira Stencil'})} />
              <CuteButton  text={'default'} onclick={() => onSettings({...settings, fontFamily:'sans-serif'})} />

              

            </div>
              </div>
                        

            </div>
          )}
        </div>
      </div>
    </Window>
  );
}
