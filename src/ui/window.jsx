export default function Window({ id, title, focused, onFocus, onClose, children }) {
  const handleMouseDown = () => {
    onFocus(id);
  };
  
  const handleCloseClick = (event) => {
    event.stopPropagation();
    onClose(id);
  };
  
  const borderColor = focused ? 'border-cyan-400' : 'border-gray-600';
  const focusIndicator = focused ? ' • focused' : '';
  
  return (
    <div
      onMouseDown={handleMouseDown}
      className={`flex h-full w-full flex-col overflow-hidden border-2 rounded-3xl bg-[#0a0a0f] transition-colors duration-200 relative ${borderColor}`}
      style={{ backdropFilter: 'blur(10px)', containerType: 'size' }}
    >
      <div className="flex-shrink-0 row justify-between px-3 py-2 bg-[#111] select-none">
        <div className="row gap-1.5">
          <button
            onClick={handleCloseClick}
            className="h-3 w-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
            type="button"
          />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <span
          className="text-gray-400 font-mono truncate ml-2"
          style={{ fontSize: 'clamp(0.5rem, 3cqw, 0.75rem)' }}
        >
          {title}{focusIndicator}
        </span>
      </div>
      {children}
    </div>
  );
}
