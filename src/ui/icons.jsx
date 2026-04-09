const s = { stroke: '#555', strokeWidth: '1.2', fill: '#1a1a1a' };

export const FileIcons = {
  dir: (size = 22) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" {...s} />
    </svg>
  ),
  photo: (size = 22) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="2" {...s} />
      <circle cx="8" cy="10" r="2" stroke="#555" strokeWidth="1" fill="none" />
      <path d="M2 16l5-5 4 4 3-3 5 5" stroke="#555" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  ),
  video: (size = 22) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="14" height="16" rx="2" {...s} />
      <path d="M16 9l5-3v12l-5-3V9z" {...s} />
    </svg>
  ),
  audio: (size = 22) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="2" {...s} />
      <path d="M8 15V9l8-2v6" stroke="#555" strokeWidth="1" strokeLinecap="round" fill="none" />
      <circle cx="6" cy="15" r="2" stroke="#555" strokeWidth="1" fill="none" />
      <circle cx="14" cy="13" r="2" stroke="#555" strokeWidth="1" fill="none" />
    </svg>
  ),
  file: (size = 22) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 4h10l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" {...s} />
      <path d="M14 4v4h4" stroke="#555" strokeWidth="1.2" fill="none" />
      <line x1="7" y1="11" x2="15" y2="11" stroke="#444" strokeWidth="1" strokeLinecap="round" />
      <line x1="7" y1="14" x2="13" y2="14" stroke="#444" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
};

export function getIcon(entry, size = 22) {
  const key = entry.type === 'dir' ? 'dir' : (entry.kind ?? 'file');
  return (FileIcons[key] ?? FileIcons.file)(size);
}
