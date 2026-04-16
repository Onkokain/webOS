import Window from '../ui/window';

const faq_text=`Welcome to Suprland FAQ!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0. Is it Suprland or Suprland*?
-> The correct name is Suprland* (with an asterisk). The asterisk represents that the idea is create something limited yet limitless. A desktop environment that runs in a browser has many limations but my goal with this project is to overcome those limits and create a fun yet functional webiste.


1. What is Suprland*?
-> Suprland* is a tiling based Web OS, one of it's kind. It is a desktop environment running entirely on your browser with many fun features. It is heavily inspired by Hyprland, a tiling window manager in Linux. SUprland is meant to be my take on a tiling based OS, right here on the web.

2. How do I open apps?
-> You can open apps using the taskbar at the bottom. Alternatively (and recommended), you can use the default keybinds to open and close apps quickly. Open the Help app for more information!

3. Can I have multiple windows open at the same time?
-> You can have up to 6 windows open at the same time. Through ~30hours of total development, I have deemed 6 to be the perfect number for efficiency and actually being able to see what is going on on the screen.

4. How do I manage files?
-> Any and all files you created currently go to the Desktop (also the File Manager). You can open they dirrectly from the Desktop or open the File Manager and open them from there. I currently have support built for .txt files, audio, video and images. This will surely be extended soon.

5. Can I customize the desktop?
-> While being limited, there are a ton of fun backgrounds you can choose from! Open the settings app (Ctrl + S) and click on the wallpaper you deem worthy.

6. Is my data saved?
-> Yes and No! I don't have access to any of your data, the website is PURELY frontend. But, all your files are stored in the browser's local storage, aka you'll still have access to all your files even if you reload the site or open and close it.

7. Can I use this on mobile devices?
-> Suprland* is built to be used on desktop devices. While the barebone features work on mobile as well the UI/UX has not been implemented for Mobile (yet). I recommend using Suprland* on desktop for the best user experience. That being said, nobody is stopping for from trying it out on mobile! Please go ahead and hit me will all your feedback and suggestions. Criticisms are much much appreciated.

8. Is Suprland* open source?
-> Suprland* is 100% completely open source with a MIT license. Feel free to check it out, contribute to it, fork it or do anything you want with it!

9. Who created Suprland*?
-> Uh if you're asking this, hi I'm Yaman, I created this as a fun project to learn and experiment with web development. 

10. How can I contribute or report issues?
-> Hey if you're interested in helping please contact me at @korahontoni@gmail.com. Any feedback or suggestions are much appreciated! 

11. Are there any known issues or limitations?
-> Being a web based OS, there are more limitations than features but yet I've made clever workarounds for them. Worry not as when there's a will there's a way! 

12. What are the future plans for Suprland*?
-> We live in the present, why worry about the future? Suprland* is in the present and it's development will be in the present; new features, bug fixes and improvements everyday!

13. Can I use Suprland* offline?
-> Load it once, use it forever. Nothing more nothing less.

14. How do I reset Suprland* to its default state?
-> Open terminal and type 'reset confirm'. Optionally, open Settings, navigate to System and click on Reset User Data.


17. Can I use Suprland* on different browsers?
-> Suprland* supports most, if not all browsers that have HTML5 and modern JS support. I natively run Comet (A Chromium based browser) and it works perfectly. Please let me know if you encounter any browser specific issues!

More questions? I'm always available to answer them! Contact me at @korahontoni@gmail.com and Finally thank you for using Suprland*! I hope you have as much fun using it as I had building it!

`


 export default function Help({ id, focused, onFocus, onClose }) {
  return (
    <Window id={id} title="FAQ" focused={focused} onFocus={onFocus} onClose={onClose}>
      <pre className="flex-1 min-h-0 overflow-y-auto p-4 font-mono text-gray-400 text-xs hide-scroll overflow-x-auto text-wrap">

{faq_text}
        
      </pre>
    </Window>
  );
}
