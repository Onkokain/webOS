import { useEffect, useRef, useState } from "react";
import Window from "../ui/window";

function AudioVisualizer({ stream, recording }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [color, setColor] = useState("gray");

  const smoothItRef = useRef(new Array(200).fill(0));

  useEffect(() => {
    setColor(recording ? "red" : "gray");
  }, [recording]);

  useEffect(() => {
    if (!stream) {
      return;
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    const drawVisualization = () => {
      animationRef.current = requestAnimationFrame(drawVisualization);

      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const context = canvas.getContext("2d");
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      analyser.getByteFrequencyData(frequencyData);

      const barCount = 200;
      const barGap = 3;
      const barWidth = (canvasWidth - barGap * (barCount - 1)) / barCount;

      for (let barIndex = 0; barIndex < barCount; barIndex++) {
        const dataIndex = Math.floor(
          (barIndex * frequencyData.length) / barCount,
        );
        const normalizedValue = Math.pow(frequencyData[dataIndex] / 255, 0.2);

        const smoothed = smoothItRef.current;
        smoothed[barIndex] = smoothed[barIndex] * 0.7 + normalizedValue * 0.3;
        const barHeight = Math.max(3, smoothed[barIndex] * canvasHeight * 0.85);

        const gradient = context.createLinearGradient(
          0,
          (canvasHeight - barHeight) / 2,
          0,
          (canvasHeight + barHeight) / 2,
        );
        gradient.addColorStop(0, color === "red" ? "#ff6b6b" : "#94a3b8");
        gradient.addColorStop(1, color === "red" ? "#dc2626" : "#64748b");

        context.fillStyle = color;
        context.shadowBlur = 10;
        context.shadowColor = color;
        context.beginPath();
        // context.roundRect(
        //   barIndex * (barWidth + barGap),
        //   (canvasHeight - barHeight) / 2,
        //   barWidth,
        //   barHeight,
        //   2
        // );

        if (barIndex === 0) {
          context.beginPath();
          context.moveTo(0, (canvasHeight - barHeight) / 2);
        } else {
          context.lineTo(
            barIndex * (barWidth + barGap) + barWidth / 2,
            (canvasHeight - barHeight) / 2,
          );
        }

        if (barIndex === barCount - 1) {
          context.lineWidth = 2;
          context.lineCap = "round";
          context.lineJoin = "round";
          context.stroke();
        }
      }
    };

    drawVisualization();

    return () => {
      cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [stream, color]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

function SavePrompt({ label, onSave, onDiscard }) {
  return (
    <div className="absolute inset-0 z-10 center bg-gray-1200/75 backdrop-blur-sm">
      <div className="col items-center gap-3 px-6 py-5 rounded-2xl border border-gray-700 bg-[#111111]">
        <p className="text-gray-300 mono-xs tracking-wider">Save {label}?</p>
        <div className="row gap-3">
          <button
            onClick={onSave}
            className="prompt-btn bg-gray-700 hover:bg-gray-600 hover:scale-105 text-gray-200"
          >
            Save
          </button>
          <button
            onClick={onDiscard}
            className="prompt-btn border border-gray-700 hover:bg-gray-800 hover:scale-105 text-gray-500"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Camera({ id, focused, onFocus, onClose, onSave }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [recording, setRecording] = useState(false);
  const [mode, setMode] = useState("photo");
  const [paused, setPaused] = useState(false);
  const [pending, setPending] = useState(null);
  const [shutter, setShutter] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((mediaStream) => {
        streamRef.current = mediaStream;

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(() => {});

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const takePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    setShutter(true);
    setTimeout(() => setShutter(false), 200);

    canvas.toBlob((blob) => {
      setPending({ blob, ext: "png", label: "photo" });
    }, "image/png");
  };

  const startRecording = (mimeType, extension, label) => {
    const isAudioOnly = mimeType.includes("audio");
    const mediaSource = isAudioOnly
      ? new MediaStream(streamRef.current.getAudioTracks())
      : streamRef.current;

    chunksRef.current = [];

    const mediaRecorder = new MediaRecorder(mediaSource, { mimeType });

    mediaRecorder.ondataavailable = (event) => {
      chunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      setPending({
        blob: new Blob(chunksRef.current, { type: mimeType }),
        ext: extension,
        label,
      });
    };

    mediaRecorder.start();
    recorderRef.current = mediaRecorder;
    setRecording(true);
    setPaused(false);
  };

  const togglePause = () => {
    if (!recorderRef.current) {
      return;
    }

    if (paused) {
      recorderRef.current.resume();
      setPaused(false);
    } else {
      recorderRef.current.pause();
      setPaused(true);
    }
  };

  const handleAction = () => {
    if (mode === "photo") {
      return takePhoto();
    }

    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      setPaused(false);
      return;
    }

    if (mode === "video") {
      startRecording("video/webm", "webm", "video");
    }

    if (mode === "audio") {
      startRecording("audio/webm", "webm", "audio");
    }
  };

  const handleSave = () => {
    const fileName = `${pending.label}-${Date.now()}.${pending.ext}`;
    const fileData = {
      url: URL.createObjectURL(pending.blob),
      kind: pending.label,
    };

    onSave(fileName, fileData);
    setPending(null);
  };

  return (
    <Window
      id={id}
      title="camera"
      focused={focused}
      onFocus={onFocus}
      onClose={onClose}
    >
      <div className="flex-1 min-h-0 center bg-black overflow-hidden relative">
        {mode === "audio" ? (
          <div className="w-full h-full col center gap-4 px-6">
            <div className="w-full h-[80px]">
              <AudioVisualizer
                stream={streamRef.current}
                recording={recording}
              />
            </div>
            {recording && (
              <span className="font-mono text-[10px] text-gray-500 tracking-widset">
                {paused ? "Paused" : "Recording"}
              </span>
            )}
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-h-full max-w-full object-contain scale-x-[-1]"
            />
            {recording && (
              <span className="absolute top-2 right-2 row gap-1.5 font-mono text-[10px] text-red-400">
                <span
                  className={`w-1.5 h-1.5 rounded-full bg-red-500 ${!paused && "animate-pulse"}`}
                />
                {paused ? "Paused" : "Recording"}
              </span>
            )}
          </>
        )}
        {shutter && (
          <div className="absolute inset-0 bg-white pointer-events-none opacity-[0.85] transition-opacity duration-150" />
        )}
      </div>

      <div className="cam-bar">
        <div className="row gap-1">
          {["photo", "video", "audio"].map((modeOption) => (
            <button
              key={modeOption}
              onClick={() => !recording && setMode(modeOption)}
              className={`mono-tag px-3 py-1 rounded-lg transition-colors ${
                mode === modeOption
                  ? "bg-gray-700 text-gray-200"
                  : "text-gray-600 hover:text-gray-400"
              }`}
            >
              {modeOption}
            </button>
          ))}
        </div>
        <div className="row gap-2">
          {recording && (
            <button
              onClick={togglePause}
              className="mono-tag px-3 py-1 rounded-lg border border-gray-700 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {paused ? "resume" : "pause"}
            </button>
          )}
          <button
            onClick={handleAction}
            className={`w-9 h-9 rounded-full border-2 center transition-colors ${
              recording
                ? "border-red-500 bg-red-500/20"
                : "border-gray-500 bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {mode === "photo" ? (
              <span className="w-4 h-4 rounded-full bg-gray-300" />
            ) : recording ? (
              <span className="w-3 h-3 rounded-sm bg-red-400" />
            ) : (
              <span className="w-3 h-3 rounded-full bg-gray-400" />
            )}
          </button>
        </div>
      </div>
      {pending && (
        <SavePrompt
          label={pending.label}
          onSave={handleSave}
          onDiscard={() => setPending(null)}
        />
      )}
    </Window>
  );
}
