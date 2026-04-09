import { useEffect } from 'react';

export function useKeyboardShortcuts(shortcutHandlers, dependencies = []) {
  useEffect(() => {
    const handleKeyPress = (event) => {
      shortcutHandlers.forEach(({ key, altKey, shiftKey, ctrlKey, action }) => {
        const keyMatches = key === event.key.toLowerCase() || key === event.key;
        const altMatches = altKey === undefined || altKey === event.altKey;
        const shiftMatches = shiftKey === undefined || shiftKey === event.shiftKey;
        const ctrlMatches = ctrlKey === undefined || ctrlKey === event.ctrlKey;

        if (keyMatches && altMatches && shiftMatches && ctrlMatches) {
          event.preventDefault();
          action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, dependencies);
}
