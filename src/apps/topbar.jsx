export default function Topbar({ openwindow, setBrowserUrl, user }) {
  return (
    <div className="fixed top-0 left-0 right-0 h-10 z-50 bg-gray-900/80 border border-gray-700 rounded-lg">
      <div className="h-full flex flex-row items-center justify-between px-4 z-40">
        <div className="font-mono text-xs text-gray-400 tracking-widest">
          {user}
        </div>

        <div className="font-mono text-xs text-gray-500 scale-[0.8] md:scale-100">
          {new Date().toLocaleDateString([], {
            month: "short",
            day: "numeric",
          })}
          &emsp;
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.6] md:scale-[0.8] flex flex-row gap-3 md:gap-10 text-gray-300 text-xs  ">
        <div
          className="hover:scale-[1.2] cursor-pointer"
          onClick={() => {
            setBrowserUrl("https://yarrlist.net/");
            openwindow("browser");
          }}
        >
          Websites
        </div>
        <div
          className="hover:scale-[1.2] cursor-pointer"
          onClick={() => openwindow("faq")}
        >
          FAQ
        </div>
        <div
          className="hover:scale-[1.2] cursor-pointer"
          onClick={() => openwindow("help")}
        >
          Help
        </div>
        <div
          className="hover:scale-[1.2] cursor-pointer"
          onClick={() => {
            setBrowserUrl(
              "https://playclassic.games/games/first-person-shooter-dos-games-online/play-doom-online/play/",
            );
            openwindow("browser");
          }}
        >
          DOOM
        </div>
      </div>
    </div>
  );
}
