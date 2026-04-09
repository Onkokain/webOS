import {useEffect, useRef, useState} from 'react';
import Window from '../ui/window';

function AudioVisualizer({stream}) {
  const canvasRef= useRef(null);
  const animation_Ref=useRef(null);

  useEffect(() => {
    if (!stream) return;
    const contex= new AudioContext();
    const src = contex.createMediaStreamSource(stream);
    const analyser=contex.createAnalyser();
    analyser.fftSize=64;
    src.connect(analyser);
    const data= new Uint8Array(analyser.frequencyBinCount);
    const draw= () => {
      animation_Ref.current=requestAnimationFrame(draw);
      const canvas=canvasRef.current;
      if (!canvas) return;
      const c=canvas.getContext('2d');
      const {width:w, height:h}=canvas;
      c.clearRect(0,0,w,h);
      analyser.getByteFrequencyData(data);
      const bars=14, gap=3, barW=(w-gap*(bars-1))/bars;
      for (let i=0; i<bars; i++) {
        const val= data[Math.floor(i*data.length/bars)]/255;
        const barH = Math.max(3,val*h*0.85);
        c.fillStyle='blue';
        c.beginPath();
        c.roundRect(i*(barW+gap),(h-barH)/2, barW,barH,2);
        c.fill();
      }
    };
    draw();
    return () => {
      cancelAnimationFrame(animation_Ref.current);
      contex.close();
    };
},[stream]);

  return <canvas ref={canvasRef} className='w-full h-full'/>
}

function SavePrompt({label,onSave, onDiscard}) {
  return (
    <div className="absolute inset-0 z-10 center bg-gray-1200/75 backdrop-blur-sm">
      <div className='col items-center gap-3 px-6 py-5 rounded-2xl border border-gray-700 bg-[#111111]'>
        <p className='text-gray-300 mono-xs tracking-wider'>
Save {label}?
        </p>
        <div className='row gap-3'>
          <button onClick={onSave} className='prompt-btn bg-gray-700 hover:bg-gray-600 hover:scale-105 text-gray-200'>
Save
          </button>

          <button onClick={onDiscard} className="prompt-btn border border-gray-700 hover:bg-gray-800 hover:scale-105 text-gray-500">
Discard
          </button>
        </div>
      </div>
    </div>
  );  
}

export default function Camera({id,focused,onFocus,onClose,onSave}) {
  const videoRef=useRef(null);
  const streamRef=useRef(null);
  const recorderRef=useRef(null);
  const chunksRef=useRef([]);

  const [recording,setRecording]=useState(false);
  const [mode,setMode]=useState('photo');
  const [paused,setPaused]=useState(false);
  const [pending,setPending]=useState(null);
  const [shutter,setShutter]=useState(false);

  useEffect(()=> {
    navigator.mediaDevices.getUserMedia({
      video:true,
      audio:true,
    })
    .then(s => {
      streamRef.current=s;
      if (videoRef.current)
        videoRef.current.srcObject=s;
    })
    .catch(() => {});
    return () => {
      streamRef.current?.getTracks().forEach(t =>t.stop());
    };
  }, []);

  const takePhoto=() => {
    const canv=document.createElement('canvas');
    canv.width=videoRef.current.videoWidth;
    canv.height=videoRef.current.videoHeight;
    canv.getContext('2d').drawImage(videoRef.current,0,0);
    setShutter(true);
    setTimeout(() => setShutter(false), 200);
    canv.toBlob(blob=> setPending({blob,ext:'png',label:'photo'}),'image/png');
   };

   const startRec=(mimeType,ext,label) => {
    const src=mimeType.includes('audio') ? new MediaStream(streamRef.current.getAudioTracks()) : streamRef.current;
    chunksRef.current=[];
    const mr=new MediaRecorder(src, {mimeType});
    mr.ondataavailable=e => chunksRef.current.push(e.data);
    mr.onstop=() => setPending({
      blob: new Blob(chunksRef.current, {type: mimeType}), ext,label
    });
    mr.start();
    recorderRef.current=mr;
    setRecording(true);
    setPaused(false);
   };

   const togglePause=() => {
    if (!recorderRef.current) return;
    if (paused) 
      {recorderRef.current.resume();
      setPaused(false);}
    else {
      recorderRef.current.pause();
      setPaused(true);
    }
   };

   const action = () => {
    if (mode==='photo') return takePhoto();
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      setPaused(false);
      return;
    }
    if (mode==='video') startRec('video/webm', 'webm', 'video');
    if (mode==='audio') startRec('audio/webm','webm', 'audio');
   }

   const save =() => {
    onSave(`${pending.label}-${Date.now()}.${pending.ext}`,{url: URL.createObjectURL(pending.blob), kind: pending.label});
    setPending(null);
   };

   return (
    <Window
        id={id}
        title='camera'
        focused={focused}
        onFocus={onFocus}
        onClose={onClose}
      >
        <div className='flex-1 min-h-0 center bg-black overflow-hidden relative'>

          {mode=== 'audio' ? (
          <div className='w-full h-full col center gap-4 px-6'>
            <div className='w-full h-[80px]'>
              <AudioVisualizer stream={streamRef.current}/>
            </div>
            {recording &&
              <span className='font-mono text-[10px] text-gray-500 tracking-widset'>
                {paused ? 'Paused' : "Recording"}
              </span>
            }
          </div>
           ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className='max-h-full max-w-full object-contain scale-x-[-1]'
              />
              {recording &&
              (
                <span className='absolute top-2 right-2 row gap-1.5 font-mono text-[10px] text-red-400'>
                  <span className={`w-1.5 h-1.5 rounded-full bg-red-500 ${!paused && 'animate-pulse'}`}/>
                  {paused? 'Paused' : 'Recording'}
                </span>
              )}
            </>
          )}
          {
            shutter &&
              <div className='absolute inset-0 bg-white pointer-events-none opacity-[0.85] transition-opacity duration-150'/>
          }
        </div>

      <div className="cam-bar">
        <div className="row gap-1">
          {['photo', 'video', 'audio'].map(m => (
            <button key={m} onClick={() => !recording && setMode(m)}
              className={`mono-tag px-3 py-1 rounded-lg transition-colors ${mode === m ?
               'bg-gray-700 text-gray-200' 
               :
                'text-gray-600 hover:text-gray-400'}`}>
              {m}
            </button>
          ))}
        </div>
        <div className="row gap-2">
          {recording && (
            <button 
            onClick={togglePause} 
            className="mono-tag px-3 py-1 rounded-lg border border-gray-700 text-gray-500 hover:text-gray-300 transition-colors">
              {paused ? 'resume' : 'pause'}
            </button>
          )}
          <button
           onClick={action} 
           className={`w-9 h-9 rounded-full border-2 center transition-colors ${recording ? 
           'border-red-500 bg-red-500/20' 
           : 
           'border-gray-500 bg-gray-800 hover:bg-gray-700'}`}>
            {mode === 'photo' ?
             <span className="w-4 h-4 rounded-full bg-gray-300" />
              :
               recording ?
                <span className="w-3 h-3 rounded-sm bg-red-400" />
              : 
              <span className="w-3 h-3 rounded-full bg-gray-400" />}
          </button>
        </div>
      </div>
      {pending &&
        <SavePrompt
          label={pending.label}
          onSave={save}
          onDiscard={() => setPending(null)}
        />
        }
      </Window>
   );
}
