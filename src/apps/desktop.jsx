import { use, useEffect, useRef, useState } from 'react';
import { getIcon } from '../ui/icons';
import FileViewer from '../ui/viewer';
import ContextMenu from '../ui/contextmenu';
import TextEditor from '../ui/texteditor';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fsDelete, fsRename, fsCopy, fsNextName } from '../utils/fsUtils';

const ICON_WIDTH = 72;
const ICON_HEIGHT = 84;

const E_IMAGE= new Set(['png','jpg','jpeg','gif','bmp','webp']);
const E_VIDEO= new Set(['mp4','webm','ogg']);
const E_AUDIO= new Set(['mp3','wav','ogg']); 





const getFileExtension =(name = '') => {
  const idx=name.lastIndexOf('.');
  if(idx===-1) return '';
  return name.slice(idx+1).toLowerCase();
}

const MediaKind = (e) => {
  if (e.kind === 'photo' || e.kind === 'video' || e.kind === 'audio') {
    return e.kind;
  }
  
  const ext = getFileExtension(e.name);
  if(E_IMAGE.has(ext)) return 'photo';
  if(E_VIDEO.has(ext)) return 'video';
  if(E_AUDIO.has(ext)) return 'audio';
  return null;
}

const isEditable = (e) => {
  if (!e || e.type!=='file') return false;
  if (MediaKind(e)) return false;
  return true;
}


function getAutoPosition(index) {
  return {
    x: 16 + Math.floor(index / 9) * (ICON_WIDTH + 20),
    y: 40 + (index % 9) * (ICON_HEIGHT + 8)
  };
}

function RenameInput({ name, onDone }) {
  const [value, setValue] = useState(name);
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.select();
  }, []);

  const handleSubmit = () => onDone(value);
  const handleCancel = () => onDone(null);

  return (
    <input 
      ref={ref}
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={handleSubmit}
      onKeyDown={e => {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') handleCancel();
      }}
      onMouseDown={e => e.stopPropagation()}
      className="w-full text-center bg-gray-800 border border-gray-600 rounded text-gray-200 font-mono outline-none px-1"
      style={{ fontSize: 9 }}
    />
  );
}

export default function Desktop({ fs, setFs, user, onOpenFolder, onDelete }) {

const [widgetPos,setWidgetPos] = useLocalStorage('suprland-widget-pos', {x:16,y:100});
const[time,setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
const [temp,setTemp]=useState(null);

useEffect(()=>{
  const centerX=(window.innerWidth/2)-68
  const centerY=(window.innerHeight/2)-60
  setWidgetPos({x:centerX,y:centerY});
},[]);

useEffect(()=>{
  const timer=setInterval(() => {
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    return () => clearInterval(timer);
  }, 1000);

},[]);

const handleWidgetMouseDown=(e)=>{
  if (e.button !== 0) return;
  e.stopPropagation();
  
  dragState.current = {
    isWidget: true,
    startMouse: { x: e.clientX, y: e.clientY },
    startPos: {...widgetPos},
    moved: false,
  }

  const handleMove=(me)=>{
    const dx=me.clientX - dragState.current.startMouse.x;
    const dy=me.clientY - dragState.current.startMouse.y;

    if (Math.abs(dx) + Math.abs(dy) > 3) {
      dragState.current.moved = true;
    }

    if (dragState.current.moved) {
      setWidgetPos({
        x: dragState.current.startPos.x + dx,
        y: dragState.current.startPos.y + dy,
      })
    }
  }

  const handleUp=()=>{
    window.removeEventListener('mouseup', handleUp);
    window.removeEventListener('mousemove', handleMove);
    dragState.current=null
  }
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('mousemove', handleMove);

}


  const root = `/home/${user}/`;
  const ref = useRef(null);
  const dragState = useRef(null);
  const bandState = useRef(null);

  const [positions, setPositions] = useLocalStorage(`suprland-desktop-positions-${user}`, {});
  const [selected, setSelected] = useState(new Set());
  const [renaming, setRenaming] = useState(null);
  const [menu, setMenu] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [band, setBand] = useState(null);

  const entries = Object.entries(fs)
    .filter(([path]) => {
      if (path === root) return false;
      const relative = path.slice(root.length).replace(/\/$/, '');
      return path.startsWith(root) && !relative.includes('/');
    })
    .map(([path, data], index) => ({
      path,
      name: path.slice(root.length).replace(/\/$/, ''),
      ...data,
      ...(positions[path] || getAutoPosition(index))
    }));

  const getPosition = (path) => {
    return positions[path] || getAutoPosition(entries.findIndex(e => e.path === path));
  };

  const saveFs = (updater) => {
    setFs(prev => {
      const updated = updater(prev);
      localStorage.setItem('suprland-fs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleIconMouseDown = (e, path) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    const newSelection = e.shiftKey 
      ? new Set([...selected, path])
      : selected.has(path) 
        ? selected 
        : new Set([path]);

    setSelected(newSelection);

    const paths = [...newSelection];
    const startPositions = Object.fromEntries(
      paths.map(p => [p, getPosition(p)])
    );

    dragState.current = {
      paths,
      startMouse: { x: e.clientX, y: e.clientY },
      startPositions,
      moved: false
    };

    const handleMove = (me) => {
      const dx = me.clientX - dragState.current.startMouse.x;
      const dy = me.clientY - dragState.current.startMouse.y;

      if (Math.abs(dx) + Math.abs(dy) > 3) {
        dragState.current.moved = true;
      }

      if (!dragState.current.moved) return;

      setPositions(prev => ({
        ...prev,
        ...Object.fromEntries(
          paths.map(p => [
            p,
            {
              x: startPositions[p].x + dx,
              y: startPositions[p].y + dy
            }
          ])
        )
      }));
    };

    const handleUp = (ue) => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);

      if (!dragState.current?.moved) return;

      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;

      const dropX = ue.clientX - rect.left;
      const dropY = ue.clientY - rect.top;

      const target = entries.find(e => {
        if (e.type !== 'dir') return false;
        if (paths.includes(e.path)) return false;
        return dropX >= e.x && 
               dropX <= e.x + ICON_WIDTH && 
               dropY >= e.y && 
               dropY <= e.y + ICON_HEIGHT;
      });

      if (target) {
        saveFs(prev => {
          let updated = { ...prev };
          paths.forEach(p => {
            const name = p.slice(root.length).replace(/\/$/, '');
            const isDir = prev[p]?.type === 'dir';
            const newPath = target.path + name + (isDir ? '/' : '');
            updated = fsRename(updated, p, newPath);
          });
          return updated;
        });

        setPositions(prev => {
          const updated = { ...prev };
          paths.forEach(p => delete updated[p]);
          return updated;
        });

        setSelected(new Set());
      }

      dragState.current = null;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const handleBackgroundMouseDown = (e) => {
    if (e.button !== 0) return;

    setMenu(null);
    if (!e.shiftKey) setSelected(new Set());
    setRenaming(null);

    const rect = ref.current.getBoundingClientRect();
    const x0 = e.clientX - rect.left;
    const y0 = e.clientY - rect.top;

    bandState.current = { x0, y0 };

    const handleMove = (me) => {
      const x2 = me.clientX - rect.left;
      const y2 = me.clientY - rect.top;

      setBand({
        x: Math.min(x0, x2),
        y: Math.min(y0, y2),
        w: Math.abs(x2 - x0),
        h: Math.abs(y2 - y0)
      });

      const minX = Math.min(x0, x2);
      const maxX = Math.max(x0, x2);
      const minY = Math.min(y0, y2);
      const maxY = Math.max(y0, y2);

      const hit = new Set(
        entries
          .filter(en => 
            en.x + ICON_WIDTH > minX && 
            en.x < maxX && 
            en.y + ICON_HEIGHT > minY && 
            en.y < maxY
          )
          .map(en => en.path)
      );

      setSelected(e.shiftKey ? new Set([...selected, ...hit]) : hit);
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      setBand(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const deleteSelected = () => {
    if (onDelete) {
      [...selected].forEach(p => onDelete(p));
    } else {
      saveFs(prev => {
        let updated = { ...prev };
        [...selected].forEach(p => {
          updated = fsDelete(updated, p);
        });
        return updated;
      });
    }

    setPositions(prev => {
      const updated = { ...prev };
      [...selected].forEach(p => delete updated[p]);
      return updated;
    });

    setSelected(new Set());
  };

  const renameFile = (path, newName) => {
    setRenaming(null);
    if (!newName || newName === path.slice(root.length).replace(/\/$/, '')) {
      return;
    }

    const isDir = fs[path]?.type === 'dir';
    const newPath = root + newName + (isDir ? '/' : '');

    saveFs(prev => fsRename(prev, path, newPath));

    setPositions(prev => {
      const updated = { ...prev };
      updated[newPath] = updated[path];
      delete updated[path];
      return updated;
    });

    setSelected(new Set([newPath]));
  };

  const copyFiles = (paths) => {
    setClipboard({ paths: [...paths], op: 'copy' });
    setMenu(null);
  };

  const cutFiles = (paths) => {
    setClipboard({ paths: [...paths], op: 'cut' });
    setMenu(null);
  };

  const pasteFiles = () => {
    if (!clipboard) return;

    saveFs(prev => {
      let updated = { ...prev };

      clipboard.paths.forEach(path => {
        const fullName = path.slice(root.length).replace(/\/$/, '');
        const isDir = prev[path]?.type === 'dir';
        const ext = !isDir && fullName.includes('.') 
          ? '.' + fullName.split('.').pop() 
          : '';
        const base = ext 
          ? fullName.slice(0, fullName.length - ext.length) 
          : fullName;
        const dest = fsNextName(updated, root, base, ext) + (isDir ? '/' : '');

        updated = fsCopy(updated, path, dest);

        if (clipboard.op === 'cut') {
          updated = fsDelete(updated, path);
        }
      });

      return updated;
    });

    setClipboard(null);
    setMenu(null);
  };

  const openEntry = (entry) => {
    if (entry.type === 'dir') {
      onOpenFolder?.(entry.path);
      return;
    }
    if (entry.type!=='file') {
      setViewing(entry);
      return;
    }

    const mediaKind = MediaKind(entry);
    if (mediaKind) {
      setViewing({...entry,kind: mediaKind});
      return;
    }

    setEditing({
      path:entry.path,
      name:entry.name,
      text: entry.text || '',
    })
  };

  const createNewFile = () => {
    const newPath = fsNextName(fs, root, 'file', '.txt');
    saveFs(p => ({ ...p, [newPath]: { type: 'file', text: '' } }));
    setMenu(null);
  };

  const createNewFolder = () => {
    const newPath = fsNextName(fs, root, 'folder') + '/';
    saveFs(p => ({ ...p, [newPath]: { type: 'dir' } }));
    setMenu(null);
  };

  const handleEditSave = (file) => {
    saveFs(prev => ({
      ...prev,
      [file.path]: {...prev[file.path], type: 'file', text: file.text }
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (renaming || selected.size === 0) return;

      if (e.key === 'Delete') {
        e.preventDefault();
        deleteSelected();
      }
      if (e.key === 'F2' && selected.size === 1) {
        e.preventDefault();
        setRenaming([...selected][0]);
      }
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        copyFiles(selected);
      }
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        cutFiles(selected);
      }
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        pasteFiles();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, clipboard, fs, renaming]);

  return (
    <div 
      ref={ref}
      className="relative w-full h-full overflow-hidden select-none"
      onMouseDown={handleBackgroundMouseDown}
      onContextMenu={e => {
        e.preventDefault();
        setMenu({ x: e.clientX, y: e.clientY, kind: 'bg' });
      }}
    >
      <div
        className='absolute top-0 left-0 right-0 h-10 bg-gray-900/80 border radius-lg border-gray-700 flex items-center justify-between px-4 z-40'
      >
        <div className='font-mono text-xs text-gray-400 tracking-widset'>
          {user}
        </div>
        <div className='font-mono text-xs text-gray-500'>{new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}
          &emsp;
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          
          
        </div>
      </div>
      
      <div
        onMouseDown={handleWidgetMouseDown}
        className='absolute w-34 p-4   border-gray-700 rounded-lg cursor-move z-30 '
        style={{
          left:widgetPos.x,
          top:widgetPos.y,
          transform:'scale(2.7  )'
        }}
      >
        <div className='font-mono text-sm text-gray-100 text-center font-bold mb-2'>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div> 

        <div className='font-mono text-sm text-gray-100 text-center mb-2'>
          {temp ? `${temp}°C` : '27°C'}
        </div> 
        
        <div className='font-mono text-xs text-gray-500 text-center'>
         {new Date().toLocaleDateString([], {weekday:'short', month: 'short', day: 'numeric' })}
        </div>
        
      </div>  
      {entries.map(entry => {
        const isSelected = selected.has(entry.path);

        return (
          <div 
            key={entry.path}
            className="desktop-icon"
            style={{ 
              left: entry.x, 
              top: entry.y, 
              width: ICON_WIDTH, 
              height: ICON_HEIGHT, 
              zIndex: isSelected ? 20 : 10 
            }}
            onMouseDown={e => handleIconMouseDown(e, entry.path)}
            onDoubleClick={() => openEntry(entry)}
            onContextMenu={e => {
              e.preventDefault();
              e.stopPropagation();
              if (!isSelected) setSelected(new Set([entry.path]));
              setMenu({ x: e.clientX, y: e.clientY, kind: 'icon', path: entry.path });
            }}
          >
            <div className={isSelected ? 'desktop-icon-bg-selected' : 'desktop-icon-bg'}>
              {getIcon(entry, 36)}
            </div>

            {renaming === entry.path ? (
              <RenameInput 
                name={entry.name} 
                onDone={name => renameFile(entry.path, name)} 
              />
            ) : (
              <span className={isSelected ? 'desktop-icon-label-selected' : 'desktop-icon-label'}>
                {entry.name}
              </span>
            )}
          </div>
        );
      })}

      {band && (
        <div 
          className="absolute pointer-events-none rounded border border-blue-500/40 bg-blue-500/10"
          style={{ 
            left: band.x, 
            top: band.y, 
            width: band.w, 
            height: band.h, 
            zIndex: 50 
          }}
        />
      )}

      {menu?.kind === 'bg' && (
        <ContextMenu 
          x={menu.x} 
          y={menu.y}
          onNewFile={createNewFile}
          onNewFolder={createNewFolder}
          onPaste={clipboard ? pasteFiles : null}
          onClose={() => setMenu(null)}
        />
      )}

      {menu?.kind === 'icon' && (
        <div 
          className="context-menu"
          style={{ left: menu.x, top: menu.y, minWidth: 140 }}
          onMouseDown={e => e.stopPropagation()}
        >
          <button 
            onClick={() => {
              openEntry(entries.find(e => e.path === menu.path));
              setMenu(null);
            }}
            className="context-menu-item"
          >
            Open
          </button>

          {isEditable(entries.find(e => e.path === menu.path)) && (
            <button 
              onClick={() => {
                const entry = entries.find(e => e.path === menu.path);
                setEditing({
                  path: entry.path,
                  name: entry.name,
                  text: entry.text || ''
                });
                setMenu(null);
              }}
              className="context-menu-item"
            >
              Edit
            </button>
          )}

          {selected.size === 1 && (
            <button 
              onClick={() => {
                setRenaming(menu.path);
                setMenu(null);
              }}
              className="context-menu-item"
            >
              Rename
            </button>
          )}

          <button 
            onClick={() => copyFiles(selected)}
            className="context-menu-item"
          >
            Copy
          </button>

          <button 
            onClick={() => cutFiles(selected)}
            className="context-menu-item"
          >
            Cut
          </button>

          <button 
            onClick={() => {
              deleteSelected();
              setMenu(null);
            }}
            className="context-menu-item-danger"
          >
            Delete
          </button>
        </div>
      )}

      <FileViewer 
        file={viewing} 
        onClose={() => setViewing(null)} 
      />

      <TextEditor
        file={editing}
        onSave={handleEditSave}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}
