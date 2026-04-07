import { useEffect, useRef } from 'react';

function Cli({
  win,
  focused,
  onFocus,
  onClose,
  onInputChange,
  onSubmitCommand,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (focused) inputRef.current?.focus();
  }, [focused]);

  return (
    <div
      onMouseDown={() => onFocus(win.id)}
      className={`absolute border-2 rounded-xl flex flex-col overflow-hidden
      ${focused ? 'border-cyan-400' : 'border-gray-600'}`}
      style={{
        left: `${win.x * 100}%`,
        top: `${win.y * 100}%`,
        width: `${win.w * 100}%`,
        height: `${win.h * 100}%`,
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
      }}
    >
      {/* HEADER */}
      <div className="bg-[#111] px-3 py-2 text-xs text-gray-400 flex justify-between">
        <span>cli-{win.id}</span>
        <button onClick={onClose}>x</button>
      </div>

      {/* OUTPUT */}
      <div className="flex-1 p-3 overflow-y-auto text-white font-mono text-sm">
        {win.history.map((line, i) => (
          <div key={i}>{line.text}</div>
        ))}
      </div>

      {/* INPUT */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitCommand(win.id);
        }}
        className="p-2 border-t border-gray-700 flex gap-2"
      >
        <span className="text-green-400">{'>'}</span>
        <input
          ref={inputRef}
          value={win.input}
          onChange={(e) => onInputChange(win.id, e.target.value)}
          className="flex-1 bg-transparent outline-none text-white"
        />
      </form>
    </div>
  );
}

export default Cli;