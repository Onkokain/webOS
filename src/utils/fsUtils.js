export function fsDelete(filesystem, targetPath) {
  const updatedFilesystem = { ...filesystem };
  
  const pathsToDelete = Object.keys(updatedFilesystem).filter(path =>
    path === targetPath || path.startsWith(targetPath)
  );
  
  pathsToDelete.forEach(path => {
    delete updatedFilesystem[path];
  });
  
  return updatedFilesystem;
}

export function fsRename(filesystem, oldPath, newPath) {
  const updatedFilesystem = { ...filesystem };
  
  const pathsToRename = Object.keys(updatedFilesystem).filter(path =>
    path === oldPath || path.startsWith(oldPath)
  );
  
  pathsToRename.forEach(path => {
    const relativePath = path.slice(oldPath.length);
    const newFullPath = newPath + relativePath;
    
    updatedFilesystem[newFullPath] = updatedFilesystem[path];
    delete updatedFilesystem[path];
  });
  
  return updatedFilesystem;
}

export function fsCopy(filesystem, sourcePath, destinationPath) {
  const updatedFilesystem = { ...filesystem };
  
  const pathsToCopy = Object.keys(updatedFilesystem).filter(path =>
    path === sourcePath || path.startsWith(sourcePath)
  );
  
  pathsToCopy.forEach(path => {
    const relativePath = path.slice(sourcePath.length);
    const newFullPath = destinationPath + relativePath;
    
    updatedFilesystem[newFullPath] = { ...updatedFilesystem[path] };
  });
  
  return updatedFilesystem;
}

export function fsNextName(filesystem, directory, namePrefix, fileExtension = '') {
  const basePath = `${directory}${namePrefix}${fileExtension}`;
  const basePathWithSlash = `${basePath}/`;
  
  const baseNameExists = filesystem[basePath] || filesystem[basePathWithSlash];
  
  if (!baseNameExists) {
    return basePath;
  }
  
  let counter = 2;
  
  while (true) {
    const numberedPath = `${directory}${namePrefix} (${counter})${fileExtension}`;
    const numberedPathWithSlash = `${numberedPath}/`;
    const numberedNameExists = filesystem[numberedPath] || filesystem[numberedPathWithSlash];
    
    if (!numberedNameExists) {
      return numberedPath;
    }
    
    counter++;
  }
}
