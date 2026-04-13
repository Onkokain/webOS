import { useState,useEffect,useRef } from 'react';
import Window from '../ui/window';

export default function Browser({ id, focused, onFocus, onClose, initialUrl }) {
  const defaultUrl = initialUrl ?? 'https://www.youtube.com/embed/dQw4w9WgXcQ'; // this is either a rick roll or heavenly jumpstyle i forgot which
  const [input, setInput] = useState(defaultUrl);
  const [url, setUrl] = useState(defaultUrl);
  const [error,setError] = useState(false);
  // const timerRef=useRef(null);

  // useEffect(() => {
  //   setError(false);
  //   timerRef.current = setTimeout(() => setError(true),3000);
  //   return () => clearTimeout(timerRef.current);
  // }, [url]);

  const navigate = (event) => {
    event.preventDefault();
    
    let targetUrl = input.trim();
    const httpcheck = targetUrl.startsWith('http://') || targetUrl.startsWith('https://');
    
    if (!httpcheck) {
      targetUrl = 'https://' + targetUrl;
    }
    
    setUrl(targetUrl);
    setInput(targetUrl);
  };

  return (
    <Window id={id} title="browser" focused={focused} onFocus={onFocus} onClose={onClose}>
      <form onSubmit={navigate} className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-[#111] border-b border-gray-800">
        <button type="button" onClick={() => { setUrl(url); }} className="text-gray-600 hover:text-gray-300 font-mono text-xs transition-colors px-1">↺</button>
        <input
          value={input}
          onChange={event => setInput(event.target.value)}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1 text-gray-300 font-mono text-xs outline-none focus:border-gray-500 transition-colors"
          spellCheck="false" // removes the ugly red lines
          autoComplete="off" // idk why i added this idt it even auto completes on
        />
        <button type="submit" className="text-gray-600 hover:text-gray-300 font-mono text-xs transition-colors px-1">→</button>
      </form>
      <div className="flex-1 min-h-0 relative">
        {/* {error && (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-400 font-mono text-sm z-10">
      <div className="text-center">
        <p>Failed to load: {url}</p>
        <p className="text-xs mt-2">Site may block embedding</p>
      </div>
    </div>
  )} */}
        <iframe
          // onLoad={() => {
          //   setError(false);
          //   clearTimeout(timerRef.current);
          // }}
          key={url}
          src={url}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title="browser"
        />
      </div>
    </Window>
  );
}
