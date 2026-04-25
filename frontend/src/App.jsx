import { useState, useEffect } from 'react';
import CreateAlarm from './components/CreateAlarm';
import ActiveAlarm from './components/ActiveAlarm';

export default function App() {
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [alarms, setAlarms] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [bgIndex, setBgIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const calculateTimeLeft = (alarmTime) => {
    if (!alarmTime) return '';
    const [alarmH, alarmM] = alarmTime.split(':').map(Number);
    let alarmDate = new Date(currentTime);
    alarmDate.setHours(alarmH, alarmM, 0, 0);
    
    if (alarmDate.getTime() <= currentTime.getTime()) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }
    
    const diffMs = alarmDate.getTime() - currentTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours === 0 && diffMinutes === 0) return 'Ringing < 1m';
    if (diffHours === 0) return `in ${diffMinutes}m`;
    return `in ${diffHours}h ${diffMinutes}m`;
  };

  const images = [
    '/time_importance_1_1775819698316.png',
    '/time_importance_2_1775819719465.png',
    '/time_importance_3_1775819739234.png'
  ];

  useEffect(() => {
    const bgInterval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % images.length);
    }, 1500); // Super fast scrolling background
    return () => clearInterval(bgInterval);
  }, []);

  useEffect(() => {
    document.body.style.backgroundImage = `url(${images[bgIndex]})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.transition = 'background-image 1s ease-in-out';
  }, [bgIndex]);

  const speakWish = (message, lang) => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = lang;
    utterance.rate = 1.6; // Extremely fast speaking rate
    window.speechSynthesis.speak(utterance);
  };

  const determineWishes = () => {
    const hr = new Date().getHours();
    if (hr < 12) return { en: 'Good morning!', te: 'శుభోదయం!' };
    if (hr < 16) return { en: 'Good afternoon!', te: 'శుభ మధ్యాహ్నం!' };
    if (hr < 20) return { en: 'Good evening!', te: 'శుభ సాయంత్రం!' };
    return { en: 'Good night!', te: 'శుభ రాత్రి!' };
  };

  // Fetch alarms from backend on start
  useEffect(() => {
    fetch('/api/alarms')
      .then(res => res.json())
      .then(data => setAlarms(data))
      .catch(console.error);
  }, []);

  // Periodically check constraints to see if any alarm should go off
  useEffect(() => {
    const checkAlarms = () => {
      if (activeAlarm) return; // one is already ringing
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;
      
      const triggered = alarms.find(a => a.isActive && a.time === timeStr);
      if (triggered) {
        setActiveAlarm(triggered);
      }
    };
    
    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, [alarms, activeAlarm]);

  const addAlarm = async (alarmData) => {
    try {
      const res = await fetch('/api/alarms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alarmData)
      });
      const data = await res.json();
      setAlarms([...alarms, data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopAlarm = async (id, scannedObject) => {
    try {
      const res = await fetch(`/api/alarms/${id}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scannedObject })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveAlarm(null);
        const wishes = determineWishes();
        setSuccessMessage(`${wishes.en}\n${wishes.te}\n${data.message}`);
        speakWish(`${wishes.en} ${data.message}`, 'en-US');
        // Minimal delay between English and Telugu
        setTimeout(() => speakWish(wishes.te, 'te-IN'), 800); 
        
        setAlarms(prev => prev.map(a => a._id === id ? { ...a, isActive: false } : a));
        setTimeout(() => setSuccessMessage(''), 3000); // Fast disappear
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (successMessage) {
    return (
      <div className="app-container message-success" style={{ whiteSpace: 'pre-line' }}>
        {successMessage}
      </div>
    );
  }

  if (activeAlarm) {
    return (
      <div className="app-container ringing-animation">
        <ActiveAlarm alarm={activeAlarm} onStop={handleStopAlarm} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1>Smart Wakeup Alarm</h1>
      <CreateAlarm onAdd={addAlarm} />
      <div className="alarms-list">
        {alarms.map((a, i) => (
          <div key={i} className="alarm-item">
            <span className="alarm-time">{a.time}</span>
            <span className="alarm-meta">
              {a.place} {a.isActive ? `(${calculateTimeLeft(a.time)})` : '(Off)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
