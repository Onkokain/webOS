import Window from '../ui/window';

const faq_text=`FAQ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. What is Suprland*?
-> Suprland* is a web-based desktop environment that mimics the look and feel of a traditional operating system. It allows you to open multiple windows, run apps, and manage files, all within your web browser.

2. How do I open apps?
-> You can open apps using the keyboard shortcuts listed in the Help window, or by clicking on the app names in the center of the desktop.

3. Can I have multiple windows open at the same time?
-> Yes! You can open multiple windows and switch between them. Some apps are single-instance, meaning only one window can be open at a time (like Camera, Help, Settings, Files, and FAQ).

4. How do I manage files?
-> You can use the File Manager app to browse, create, delete, and manage files and folders. You can also open folders directly from the desktop.

5. Can I customize the desktop?
-> Currently, customization options are limited, but you can rearrange windows and manage your files as you like. Future updates may include more customization features.

6. Is my data saved?
-> Yes, your data is saved in the browser's local storage. This means that your files and settings will persist even if you refresh the page or close the browser, as long as you don't clear your browser data.

7. Can I use this on mobile devices?
-> Suprland* is primarily designed for desktop browsers, and the user experience may not be optimal on mobile devices. For the best experience, we recommend using it on a desktop or laptop.

8. Is Suprland* open source?
-> Yes! Suprland* is open source and available on GitHub. Feel free to check out the code, contribute, or report any issues you find.

9. Who created Suprland*?
-> Suprland* was created by Baralekogyan, a software developer and designer. It is a passion project inspired by the desire to create a fun and functional web-based desktop environment.

10. How can I contribute or report issues?
-> You can contribute to the project or report issues by visiting the GitHub repository. Contributions of all kinds are welcome, whether it's code, design, documentation, or bug reports.

11. Are there any known issues or limitations?
-> Yes, as a web-based application, Suprland* has some limitations compared to native operating systems. Performance may vary based on the browser and device, and some features may not work as smoothly as they would in a native environment. Additionally, certain apps may have limited functionality due to the constraints of running in a browser.

12. What are the future plans for Suprland*?
-> Future plans for Suprland* include adding more apps, improving performance, enhancing customization options, and implementing new features based on user feedback. The project is actively being developed, so stay tuned for updates!

13. Can I use Suprland* offline?
-> Yes, once you have loaded Suprland* in your browser, you can use it offline. All data is stored locally in your browser's storage, so you can continue to work with your files and apps even without an internet connection.

14. How do I reset Suprland* to its default state?
-> If you want to reset Suprland* to its default state, you can clear your browser's local storage for the site. This will remove all your files, settings, and app data, giving you a fresh start. Please note that this action is irreversible, so make sure to back up any important data before proceeding.

15. Can I change the appearance of Suprland*?
-> Currently, there are no built-in options to change the appearance of Suprland*. However, since Suprland* is open source, you can modify the CSS and design elements to customize the look and feel to your liking. Future updates may also include more built-in customization options.

16. Is there a way to export my files from Suprland*?
-> Yes, you can export your files from Suprland* by using the File Manager app. Simply select the files you want to export and use the copy or cut functionality, then paste them into a location on your computer. Alternatively, you can also access the files directly from your browser's local storage if you know where to look.

17. Can I use Suprland* on different browsers?
-> Suprland* is designed to work on modern web browsers that support HTML5, CSS3, and JavaScript. It should work on popular browsers like Chrome, Firefox, Edge, and Safari. However, performance and compatibility may vary depending on the browser and its version. For the best experience, we recommend using the latest version of your preferred browser.

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
