export function fsDelete(fs, path) {
  const n = { ...fs };
  Object.keys(n).filter(k => k === path || k.startsWith(path)).forEach(k => delete n[k]);
  return n;
}

export function fsRename(fs, oldPath, newPath) {
  const n = { ...fs };
  Object.keys(n).filter(k => k === oldPath || k.startsWith(oldPath)).forEach(k => {
    n[newPath + k.slice(oldPath.length)] = n[k];
    delete n[k];
  });
  return n;
}

export function fsCopy(fs, srcPath, destPath) {
  const n = { ...fs };
  Object.keys(n).filter(k => k === srcPath || k.startsWith(srcPath)).forEach(k => {
    n[destPath + k.slice(srcPath.length)] = { ...n[k] };
  });
  return n;
}

export function fsNextName(fs, dir, prefix, ext = '') {
  if (!fs[`${dir}${prefix}${ext}`] && !fs[`${dir}${prefix}${ext}/`]) return `${dir}${prefix}${ext}`;
  let n = 2;
  while (fs[`${dir}${prefix} (${n})${ext}`] || fs[`${dir}${prefix} (${n})${ext}/`]) n++;
  return `${dir}${prefix} (${n})${ext}`;
}
