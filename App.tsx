import React, { useState, useRef, useCallback } from 'react';
import HapticScene from './components/HapticScene';
import { DriveMode } from './types';

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [driveMode, setDriveMode] = useState<DriveMode>('SPORT');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleRecordToggle = useCallback(() => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;

      try {
        const stream = (canvas as any).captureStream(60);
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';

        const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 });

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          chunksRef.current = [];
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `bavarian-ux-capture-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 100);
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (err) {
        console.error("Recording error:", err);
      }
    }
  }, [isRecording]);

  const modeColors = {
    SPORT: 'text-orange-500 border-orange-500',
    COMFORT: 'text-white border-white',
    ECO: 'text-cyan-400 border-cyan-400',
  };

  return (
    <div className="w-full h-screen bg-[#050505] flex flex-col items-center justify-center font-sans text-white overflow-hidden">
      <div className="relative w-full h-full">
        
        {/* 3D Scene */}
        <HapticScene mode={driveMode} />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)]" />

        {/* HMI Overlay - Top Left */}
        <div className="absolute top-10 left-10 pointer-events-none select-none">
          <div className={`text-xs font-bold tracking-[0.3em] mb-1 ${modeColors[driveMode].split(' ')[0]}`}>
            INTELLIGENT SENSOR GRID
          </div>
          <h1 className="text-5xl font-light tracking-tighter text-white/90">
            VISION<span className="font-bold">NEXT</span>
          </h1>
        </div>

        {/* Drive Mode Selector - Bottom Center */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto z-20">
          {(['SPORT', 'COMFORT', 'ECO'] as DriveMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setDriveMode(m)}
              className={`
                px-6 py-2 rounded-sm border border-opacity-20 backdrop-blur-md transition-all duration-500
                text-xs font-bold tracking-widest uppercase
                ${driveMode === m 
                  ? `${modeColors[m]} bg-white/5 border-opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.5)] scale-105` 
                  : 'text-gray-500 border-gray-800 hover:text-gray-300 hover:border-gray-600'
                }
              `}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Tech Specs - Top Right */}
        <div className="absolute top-10 right-10 text-right pointer-events-none select-none">
           <div className="flex flex-col gap-1 text-[10px] text-gray-500 font-mono tracking-widest">
             <span>LIDAR_ACTIVE</span>
             <span>TERRAIN_MAPPING: ON</span>
             <span>FPS: 60.0</span>
           </div>
        </div>

        {/* Recorder - Bottom Left */}
        <div className="absolute bottom-10 left-10 pointer-events-auto z-10">
           <button
             onClick={handleRecordToggle}
             className={`
               flex items-center gap-3 px-4 py-2 rounded-sm border 
               transition-all duration-300 backdrop-blur-md
               ${isRecording 
                 ? 'border-red-500 bg-red-500/10 text-red-500' 
                 : 'border-gray-700 bg-black/40 text-gray-400 hover:border-gray-500 hover:text-white'
               }
             `}
           >
             <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
             <span className="text-xs font-bold tracking-widest">REC</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default App;