# Suprland*

Suprland* is a web based Operating System inspired by Hyprland, a popular tiling based operating system. I built the website from an AI template and learned various concepts of react js. I also had a lot of fun building this project. ;D 

## Note:
The 4th icon on the desktop is a help icon; open it to learn all about the shortcut keys used {there is no feature for custom keybinds yet for expect it to be added soon}

## Features

- **Window Management**: The web OS is set to tiling based by default but you can convert a tiled window into a floating window using Alt+Shift+T, windows that are floating can be retiled using the same command 
- **File System**: The website also includes a simple barebone file system; you can create folders and files (only txt for now) edit them and save them (they are persistent as saved to local memory)
- **Terminal**: There is a terminal with a bunch of unique commands to try out 
- **Applications**:I have implemented File Manager, Text Editor, Browser, Camera, Settings, and more (A total of 7 all pinned to the taskbar by default)
- **Customization**: I have also added several stock wallpapers so the user experience is not bland 
- **Keyboard Shortcuts**: The entire project is based on efficiency and keyboard shortcuts so I might have missed some mouse features since shortcuts are the main focus 
- **Persistent Storage**: All data saved to browser localStorage (I have not implemented any cap on the size of the .txt file so please dont crash your broswer!)

## Tech Stack

- React 18
- Vite
- Tailwind CSS v4
- react-icons
- localStorage for persistence

## Getting Started

```bash
npm install
npm run dev
```

## AI Usage Disclosure

This project was developed with AI assistance in the following capacity:

- **AI-Assisted**: The initial project structure *was* built using AI
- **Hand-Written**: All application logics, basic java script and Tailwind CSS classes were hand written
- **Hand-Debugged**: All bugs and issues resolved through manual debugging + AI was used to simplify the code and make it more easier to review to make it easier to debug in the future

NOTE: AI was used to build the 1st softcopy of the website but the js logics were rewritten and optimized by hand. ALso the custom CSS classes were written by hand and applied by hand (except drawing the boxes for contextmenu.jsx)
