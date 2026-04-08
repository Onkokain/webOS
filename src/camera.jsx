import {useEffect, useRef, useState} from 'react';
import Window from './window';

function AudioVisualizer({stream}) {
  const canvasRef= useRef(null);
  const animation_Ref=useRef(null);

  useEffect(() => {
    if (!stream) return;
    const contex= new AudioContex();
    const src = contex.createMediaStreamSource(stream);
    const analyser=contex.createAnalyser();
    analyser.fftSize=64;
    source.connect(analyser);
    const data= new Unit8Array(analyser.frequencyBinCount);
    const draw= () => {
      rafRef.current=requestAnimationFrame(draw);
      const canvas=canvasRef.current;
      if (!canvas) return;
      const c=canvas.getContex('2d');
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
  }

}