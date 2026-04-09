import { useEffect, useRef, useState } from 'react';

export function useCamera(onSave) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [mode, setMode] = useState('photo');
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pending, setPending] = useState(null);
  const [shutter, setShutter] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(s => { streamRef.current = s; if (videoRef.current) videoRef.current.srcObject = s; })
      .catch(() => {});
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const takePhoto = () => {
    const canv = document.createElement('canvas');
    canv.width = videoRef.current.videoWidth;
    canv.height = videoRef.current.videoHeight;
    canv.getContext('2d').drawImage(videoRef.current, 0, 0);
    setShutter(true);
    setTimeout(() => setShutter(false), 200);
    canv.toBlob(blob => setPending({ blob, ext: 'png', label: 'photo' }), 'image/png');
  };

  const startRec = (mimeType, ext, label) => {
    const src = mimeType.includes('audio') ? new MediaStream(streamRef.current.getAudioTracks()) : streamRef.current;
    chunksRef.current = [];
    const mr = new MediaRecorder(src, { mimeType });
    mr.ondataavailable = e => chunksRef.current.push(e.data);
    mr.onstop = () => setPending({ blob: new Blob(chunksRef.current, { type: mimeType }), ext, label });
    mr.start();
    recorderRef.current = mr;
    setRecording(true);
    setPaused(false);
  };

  const togglePause = () => {
    if (!recorderRef.current) return;
    if (paused) { recorderRef.current.resume(); setPaused(false); }
    else { recorderRef.current.pause(); setPaused(true); }
  };

  const action = () => {
    if (mode === 'photo') return takePhoto();
    if (recording) { recorderRef.current?.stop(); setRecording(false); setPaused(false); return; }
    if (mode === 'video') startRec('video/webm', 'webm', 'video');
    if (mode === 'audio') startRec('audio/webm', 'webm', 'audio');
  };

  const save = () => {
    onSave(`${pending.label}-${Date.now()}.${pending.ext}`, { url: URL.createObjectURL(pending.blob), kind: pending.label });
    setPending(null);
  };

  return { videoRef, streamRef, mode, setMode, recording, paused, pending, setPending, shutter, action, togglePause, save };
}
