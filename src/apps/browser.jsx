import { useState,useEffect,useRef } from 'react';
import Window from '../ui/window';

export default function Browser({ id, focused, onFocus, onClose, initialUrl }) {
  const defaultUrl = initialUrl ?? 'https://vyntr.com/'; // currently using this as my browser
  const [input, setInput] = useState(defaultUrl);
  const [url, setUrl] = useState(defaultUrl);
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
          spellCheck="false" 

        />
        <button type="submit" className="text-gray-600 hover:text-gray-300 font-mono text-xs transition-colors px-1">→</button>
      </form>
      <div className="flex-1 min-h-0 relative">

        <iframe
          key={url}
          src={url}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms "
          title="browser"
        />
      </div>
    </Window>
  );
}
