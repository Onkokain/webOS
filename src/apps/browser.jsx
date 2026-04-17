import { useState, useRef, useEffect } from "react";
import Window from "../ui/window";

const DEFAULT_URL = "https://vyntr.com/";
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
function createTab(url = DEFAULT_URL) {
  const iurl =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : "https://" + url;

  return {
    id: crypto.randomUUID(),
    url: iurl,
    input: iurl,
    title: capitalize(
      iurl
        .replace(/(^\w+:|^)\/\//, "")
        .split("/")[0]
        .split(".")[0],
    ),
    backStack: [],
    forwardStack: [],
    reloadId: 0,
  };
}

export default function Browser({
  id,
  focused,
  onFocus,
  onClose,
  initialUrl,
  isDragging,
}) {
  const firstUrl = initialUrl ?? DEFAULT_URL;

  useEffect(() => {
    if (initialUrl && initialUrl !== DEFAULT_URL) {
      const newTab = createTab(initialUrl);
      setTabs([newTab]);
      SetActivetabid(newTab.id);
    }
  }, [initialUrl]);

  const syncIframeUrl = () => {
    const iframe = iframeRef.current;
    if (!iframe || !activeTab) return;
    try {
      const href = iframe.contentWindow.location.href;
      updateTab(activeTab.id, (tab) => ({
        ...tab,
        url: href,
        input: href,
        title: capitalize(
          href
            .replace(/(^\w+:|^)\/\//, "")
            .split("/")[0]
            .split(".")[0],
        ),
      }));
    } catch (e) {
      console.log("woo hoo error go cry!");
    }
  };

  const [tabs, setTabs] = useState(() => {
    const saved = localStorage.getItem("suprland-browser_tabs");
    return saved ? JSON.parse(saved) : [createTab(firstUrl)];
  });

  const [activetabid, SetActivetabid] = useState(() => {
    const saved = localStorage.getItem("suprland-browser_activetabid");
    if (saved) return saved;
    const initialTabs = localStorage.getItem("suprland-browser_tabs");
    if (initialTabs) {
      const parsed = JSON.parse(initialTabs);
      return parsed[0]?.id;
    }
    return createTab(firstUrl).id;
  });

  useEffect(() => {
    localStorage.setItem("suprland-browser_tabs", JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem("suprland-browser_activetabid", activetabid);
  }, [activetabid]);

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("suprland-browser_history");
    return saved ? JSON.parse(saved) : [];
  });
  const iframeRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      "suprland-browser_history",
      JSON.stringify(history.slice(0, 200)),
    );
  }, [history]);

  const activeTab = tabs.find((tab) => tab.id === activetabid) ?? tabs[0];

  const updateTab = (tabId, updater) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? updater(tab) : tab)),
    );
  };

  const navigateActiveTab = (e) => {
    e.preventDefault();

    if (!activeTab) return;

    let targetUrl = activeTab.input.trim();
    const hasProtocol =
      targetUrl.startsWith("http://") || targetUrl.startsWith("https://");

    if (!hasProtocol) {
      targetUrl = "https://" + targetUrl;
    }

    updateTab(activeTab.id, (tab) => ({
      ...tab,
      url: targetUrl,
      input: targetUrl,
      title: capitalize(
        targetUrl
          .replace(/(^\w+:|^)\/\//, "")
          .split("/")[0]
          .split(".")[0],
      ),
      backStack: [...tab.backStack, tab.url],
      forwardStack: [],
    }));

    setHistory((prev) => [
      { url: targetUrl, time: Date.now() },
      ...prev.filter((item) => item.url !== targetUrl),
    ]);
  };

  const addTab = (url = DEFAULT_URL) => {
    const newTab = createTab(url);
    setTabs((prev) => [...prev, newTab]);
    SetActivetabid(newTab.id);
  };

  const closeTab = (tabId) => {
    setTabs((prev) => {
      const idx = prev.findIndex((tab) => tab.id === tabId);
      const next = prev.filter((tab) => tab.id !== tabId);

      if (next.length === 0) {
        const fallback = createTab(DEFAULT_URL);
        SetActivetabid(fallback.id);
        return [fallback];
      }

      if (tabId === activetabid) {
        const fallbackIndex = Math.max(0, idx - 1);
        SetActivetabid(next[fallbackIndex].id);
      }

      return next;
    });
  };

  const goBack = () => {
    if (!activeTab || activeTab.backStack.length === 0) return;

    updateTab(activeTab.id, (tab) => {
      const previousUrl = tab.backStack[tab.backStack.length - 1];
      const nextBack = tab.backStack.slice(0, -1);
      return {
        ...tab,
        url: previousUrl,
        input: previousUrl,
        title: capitalize(
          previousUrl
            .replace(/(^\w+:|^)\/\//, "")
            .split("/")[0]
            .split(".")[0],
        ),
        backStack: nextBack,
        forwardStack: [tab.url, ...tab.forwardStack],
      };
    });
  };

  const goForward = () => {
    if (!activeTab || activeTab.forwardStack.length === 0) return;

    updateTab(activeTab.id, (tab) => {
      const nextUrl = tab.forwardStack[0];
      const nextForward = tab.forwardStack.slice(1);
      return {
        ...tab,
        url: nextUrl,
        input: nextUrl,
        title: capitalize(
          nextUrl
            .replace(/(^\w+:|^)\/\//, "")
            .split("/")[0]
            .split(".")[0],
        ),
        backStack: [...tab.backStack, tab.url],
        forwardStack: nextForward,
      };
    });
  };

  const handlemiddleclick = (e, tabId) => {
    if (e.button == 1) {
      e.preventDefault();
      closeTab(tabId);
    }
  };
  return (
    <Window
      id={id}
      title="browser"
      focused={focused}
      onFocus={onFocus}
      onClose={onClose}
    >
      <div className="flex items-center gap-1 px-2 py-1 bg-[#0d0d0d] border-b border-gray-800 overflow-x-auto hide-scroll">
        {tabs.map((tab) => {
          const isActive = tab.id === activetabid;
          return (
            <div
              key={tab.id}
              onMouseDown={(e) => handlemiddleclick(e, tab.id)}
              className={`flex items-center gap-2 min-w-0 max-w-[180px] px-2 py-1 rounded-md border ${
                isActive
                  ? "bg-gray-800 border-gray-600"
                  : "bg-[#151515] border-gray-800 hover:border-gray-700"
              } `}
            >
              <button
                type="button"
                onClick={() => {
                  SetActivetabid(tab.id);
                }}
                className="truncate text-xs font-mono text-gray-300 text-left"
                title={tab.url}
              >
                {tab.title}
              </button>
              <button
                type="button"
                onClick={() => {
                  closeTab(tab.id);
                }}
                className="text-[10px] text-gray-500 hover:text-gray-300 hover:scale-110 transition-transform"
                aria-label="Close tab"
              >
                x
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => {
            addTab(DEFAULT_URL);
          }}
          className="px-2 py-1 rounded-md border border-gray-700 text-xs font-mono text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
        >
          +
        </button>
      </div>

      <form
        onSubmit={navigateActiveTab}
        className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-[#111] border-b border-gray-800"
      >
        <button
          type="button"
          onClick={goBack}
          disabled={!activeTab || activeTab.backStack.length === 0}
          className="text-gray-600 hover:text-gray-300 disabled:opacity-30 font-mono text-xs transition-colors px-1 "
        >
          ←
        </button>

        <button
          type="button"
          onClick={goForward}
          disabled={!activeTab || activeTab.forwardStack.length === 0}
          className="text-gray-600 hover:text-gray-300 disabled:opacity-30 font-mono text-xs transition-colors px-1 "
        >
          →
        </button>

        <button
          type="button"
          onClick={() => {
            if (!activeTab) return;
            updateTab(activeTab.id, (tab) => ({
              ...tab,
              reloadId: tab.reloadId + 1,
            }));
          }}
          className="text-gray-600 hover:text-gray-300 font-mono text-xs transition-colors px-1 hover:scale-110 "
        >
          ↺
        </button>

        <input
          value={activeTab?.input ?? ""}
          onChange={(event) => {
            if (!activeTab) return;
            updateTab(activeTab.id, (tab) => ({
              ...tab,
              input: event.target.value,
            }));
          }}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1 text-gray-300 font-mono text-xs outline-none focus:border-gray-500 transition-colors"
          spellCheck="false"
        />
      </form>

      <div className="flex-1 min-h-0 relative">
        {tabs.map((tab) => (
          <iframe
            ref={tab.id === activetabid ? iframeRef : null}
            key={`${tab.id}-${tab.reloadId}`}
            allowFullScreen
            src={tab.url}
            onLoad={tab.id === activetabid ? syncIframeUrl : undefined}
            className={`w-full h-full border-none absolute inset-0 ${tab.id === activetabid ? "block" : "hidden"} ${isDragging ? "pointer-events-none" : ""}`}
            sandbox={`allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-top-navigation-by-user-activation  `}
            title={tab.title}
          />
        ))}
      </div>
    </Window>
  );
}
