export default function TextEditor({ file, onSave, onClose }) {
  if (!file) return null;

  const handleSaveClick = () => {
    onSave(file);
    onClose();
  };

  return (
    <div 
      className="editor-modal" 
      onClick={onClose}
    >
      <div 
        className="editor-container" 
        onClick={event => event.stopPropagation()}
      >
        <div className="editor-header">
          <span className="font-mono text-sm text-gray-300">
            {file.name}
          </span>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        <textarea
          value={file.text}
          onChange={event => file.text = event.target.value}
          className="editor-textarea"
          placeholder="Type here..."
          autoFocus
        />

        <div className="editor-footer">
          <button 
            onClick={handleSaveClick} 
            className="btn-primary"
          >
            Save
          </button>
          <button 
            onClick={onClose} 
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
