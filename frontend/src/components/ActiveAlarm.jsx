import { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { SwitchCamera } from 'lucide-react';

export default function ActiveAlarm({ alarm, onStop }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [model, setModel] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // back camera by default
  const [stream, setStream] = useState(null);

  // Initialize Web Audio API to synthesize a loud looping beep
  useEffect(() => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(400, audioCtx.currentTime); 
    
    // Create pulsing effect
    const pulseOsc = audioCtx.createOscillator();
    pulseOsc.type = 'square';
    pulseOsc.frequency.setValueAtTime(2, audioCtx.currentTime);
    const pulseGain = audioCtx.createGain();
    pulseOsc.connect(pulseGain.gain);
    pulseGain.connect(gainNode.gain);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    pulseOsc.start();
    audioRef.current = { ctx: audioCtx, osc: oscillator, pulse: pulseOsc };

    return () => {
      oscillator.stop();
      pulseOsc.stop();
      audioCtx.close();
    };
  }, []);

  // Load COCO-SSD
  useEffect(() => {
    cocoSsd.load().then(loadedModel => {
      setModel(loadedModel);
    });
  }, []);

  // Start Camera
  useEffect(() => {
    const startCamera = async () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode }
        });
        setStream(newStream);
        if (videoRef.current) videoRef.current.srcObject = newStream;
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    };
    startCamera();
    
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [facingMode]);

  // Object Detection Loop
  useEffect(() => {
    let interval;
    if (model && videoRef.current) {
      interval = setInterval(async () => {
        if (videoRef.current.readyState === 4) {
          const predictions = await model.detect(videoRef.current);
          const found = predictions.find(p => p.class === alarm.assignedObject);
          if (found) {
            // STOP THE ALARM
            onStop(alarm._id, alarm.assignedObject);
          }
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [model, stream, alarm, onStop]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div>
      <h1 style={{color: 'var(--error)'}}>WAKE UP!</h1>
      <p className="subtitle">It is time. No snooze button here.</p>
      
      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline muted />
        <div className="overlay-text">
          Scan to dismiss:
          <div className="object-target">{alarm.assignedObject}</div>
        </div>
      </div>

      <button className="btn btn-secondary" onClick={toggleCamera}>
        <SwitchCamera size={20} /> Flip Camera
      </button>
    </div>
  );
}
