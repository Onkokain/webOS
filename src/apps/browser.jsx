import { useState } from 'react';
import Window from '../ui/window';

export default function Browser({ id, focused, onFocus, onClose, initialUrl }) {
  const defaultUrl = initialUrl ?? 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  const [input, setInput] = useState(defaultUrl);
  const [url, setUrl] = useState(defaultUrl);

  const navigate = (e) => {
    e.preventDefault();
    let target = input.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) target = 'https://' + target;
    setUrl(target);
    setInput(target);
  };

  return (
    <Window id={id} title="browser" focused={focused} onFocus={onFocus} onClose={onClose}>
      <form onSubmit={navigate} className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-[#111] border-b border-gray-800">
        <button type="button" onClick={() => { setUrl(url); }} className="text-gray-600 hover:text-gray-300 font-mono text-xs transition-colors px-1">↺</button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1 text-gray-300 font-mono text-xs outline-none focus:border-gray-500 transition-colors"
          spellCheck="false"
          autoComplete="off"
        />
        <button type="submit" className="text-gray-600 hover:text-gray-300 font-mono text-xs transition-colors px-1">→</button>
      </form>
      <div className="flex-1 min-h-0 relative">
        <iframe
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
