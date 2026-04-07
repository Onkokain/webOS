import { useEffect, useRef, useState } from 'react';
import Window from './window';

function SavePrompt({ label, onSave, onDiscard }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="flex flex-col items-center gap-3 px-6 py-5 rounded-2xl border border-gray-700 bg-[#111]">
        <p className="text-gray-300 font-mono text-xs tracking-wider">Save {label}?</p>
        <div className="flex gap-3">
          <button onClick={onSave} className="px-4 py-1.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 font-mono text-xs transition-colors">Save</button>
          <button onClick={onDiscard} className="px-4 py-1.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-500 font-mono text-xs transition-colors">Discard</button>
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
  const [mode, setMode] = useState('photo');
  const [recording, setRecording] = useState(false);
  const [pending, setPending] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((s) => { streamRef.current = s; if (videoRef.current) videoRef.current.srcObject = s; })
      .catch(() => {});
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const takePhoto = () => {
    const c = document.createElement('canvas');
    c.width = videoRef.current.videoWidth;
    c.height = videoRef.current.videoHeight;
    c.getContext('2d').drawImage(videoRef.current, 0, 0);
    c.toBlob((blob) => setPending({ blob, ext: 'png', label: 'photo' }), 'image/png');
  };

  const startRec = (mimeType, ext, label) => {
    const src = mimeType.includes('audio')
      ? new MediaStream(streamRef.current.getAudioTracks())
      : streamRef.current;
    chunksRef.current = [];
    const mr = new MediaRecorder(src, { mimeType });
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = () => setPending({ blob: new Blob(chunksRef.current, { type: mimeType }), ext, label });
    mr.start();
    recorderRef.current = mr;
    setRecording(true);
  };

  const action = () => {
    if (mode === 'photo') return takePhoto();
    if (recording) { recorderRef.current?.stop(); setRecording(false); return; }
    if (mode === 'video') startRec('video/webm', 'webm', 'video');
    if (mode === 'audio') startRec('audio/webm', 'webm', 'audio');
  };

  const save = () => {
    const url = URL.createObjectURL(pending.blob);
    const name = `${pending.label}-${Date.now()}.${pending.ext}`;
    onSave(name, { url, kind: pending.label });
    setPending(null);
  };

  return (
    <Window id={id} title="camera" focused={focused} onFocus={onFocus} onClose={onClose}>
      <div className="flex-1 min-h-0 flex items-center justify-center bg-black overflow-hidden relative">
        <video ref={videoRef} autoPlay playsInline muted className="max-h-full max-w-full object-contain" style={{ transform: 'scaleX(-1)' }} />
        {recording && <span className="absolute top-2 right-2 flex items-center gap-1.5 font-mono text-[10px] text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />REC</span>}
      </div>
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 bg-[#0d0d0d] border-t border-gray-800">
        <div className="flex gap-1">
          {['photo', 'video', 'audio'].map((m) => (
            <button key={m} onClick={() => !recording && setMode(m)}
              className={`font-mono text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg transition-colors ${mode === m ? 'bg-gray-700 text-gray-200' : 'text-gray-600 hover:text-gray-400'}`}>
              {m}
            </button>
          ))}
        </div>
        <button onClick={action} className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors ${recording ? 'border-red-500 bg-red-500/20' : 'border-gray-500 bg-gray-800 hover:bg-gray-700'}`}>
          {mode === 'photo' ? <span className="w-4 h-4 rounded-full bg-gray-300" /> : recording ? <span className="w-3 h-3 rounded-sm bg-red-400" /> : <span className="w-3 h-3 rounded-full bg-gray-400" />}
        </button>
      </div>
      {pending && <SavePrompt label={pending.label} onSave={save} onDiscard={() => setPending(null)} />}
    </Window>
  );
}
