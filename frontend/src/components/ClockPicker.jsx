import { useState } from 'react';
import './ClockPicker.css';

export default function ClockPicker({ value, onChange }) {
  // value is expected to be "HH:mm" in 24hr format
  const [mode, setMode] = useState('12'); // '12' or '24'
  const [selecting, setSelecting] = useState('hours'); // 'hours' or 'minutes'
  
  const parseTime = (timeStr) => {
    if (!timeStr) return { h: 6, m: 0, currentPeriod: 'am' };
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr || 0, 10);
    let p = 'am';
    if (h >= 12) {
      if (h > 12) h -= 12;
      p = 'pm';
    } else if (h === 0) {
      h = 12;
    }
    return { h, m, currentPeriod: p };
  };

  const timeParts = parseTime(value);
  const [currentPeriod, setCurrentPeriod] = useState(timeParts.currentPeriod);

  const displayHours = typeof value === 'string' && value.includes(':') 
    ? (mode === '12' ? timeParts.h : parseInt(value.split(':')[0], 10))
    : (mode === '12' ? 6 : 6);
    
  const displayMinutes = typeof value === 'string' && value.includes(':') 
    ? String(parseInt(value.split(':')[1], 10)).padStart(2, '0')
    : '00';

  const updateTime = (newH, newM, period) => {
    let finalH24 = newH;
    
    if (mode === '12') {
      if (period === 'pm' && newH < 12) finalH24 += 12;
      if (period === 'am' && newH === 12) finalH24 = 0;
    }

    const hh = String(finalH24).padStart(2, '0');
    const mm = String(newM).padStart(2, '0');
    onChange(`${hh}:${mm}`);
  };

  const handleHourClick = (h) => {
    updateTime(h, parseInt(displayMinutes, 10), currentPeriod);
    setSelecting('minutes');
  };

  const handleMinuteClick = (m) => {
    let h = mode === '12' ? timeParts.h : parseInt(value?.split(':')[0] || '6', 10);
    updateTime(h, m, currentPeriod);
  };

  const togglePeriod = (p) => {
    setCurrentPeriod(p);
    let h = timeParts.h;
    updateTime(h, parseInt(displayMinutes, 10), p);
  };

  const hours12 = Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i);
  const hours24Outer = Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i);
  const hours24Inner = Array.from({ length: 12 }, (_, i) => i === 0 ? 24 : i + 12);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const renderDial = (numbers, isInner = false) => {
    return numbers.map((num, i) => {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const radius = isInner ? 35 : 45;
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);
      const isActive = selecting === 'hours' 
        ? mode === '12' ? timeParts.h === num : parseInt(value?.split(':')[0], 10) === num || (num === 24 && parseInt(value?.split(':')[0], 10) === 0)
        : parseInt(displayMinutes, 10) === num;
        
      return (
        <div 
          key={num} 
          className={`clock-number ${isActive ? 'active' : ''}`}
          style={{ left: `${x}%`, top: `${y}%` }}
          onClick={() => selecting === 'hours' ? handleHourClick(num === 24 ? 0 : num) : handleMinuteClick(num)}
        >
          {String(num).padStart(selecting === 'minutes' ? 2 : 1, '0')}
        </div>
      );
    });
  };

  return (
    <div className="clock-picker">
      <div className="clock-header">
        <div className="time-display">
          <span 
            className={`time-part ${selecting === 'hours' ? 'active' : ''}`}
            onClick={() => setSelecting('hours')}
          >
            {selecting === 'hours' && mode === '12' ? timeParts.h : (mode === '24' ? String(parseInt(value?.split(':')[0] || 6, 10)).padStart(2, '0') : timeParts.h)}
          </span>
          :
          <span 
            className={`time-part ${selecting === 'minutes' ? 'active' : ''}`}
            onClick={() => setSelecting('minutes')}
          >
            {displayMinutes}
          </span>
        </div>
        
        {mode === '12' && (
          <div className="ampm-toggle">
            <button type="button" className={currentPeriod === 'am' ? 'active' : ''} onClick={() => togglePeriod('am')}>AM</button>
            <button type="button" className={currentPeriod === 'pm' ? 'active' : ''} onClick={() => togglePeriod('pm')}>PM</button>
          </div>
        )}
      </div>

      <div className="mode-tabs">
        <button type="button" className={mode === '12' ? 'active' : ''} onClick={() => { setMode('12'); setSelecting('hours'); }}>12 Hr</button>
        <button type="button" className={mode === '24' ? 'active' : ''} onClick={() => { setMode('24'); setSelecting('hours'); }}>24 Hr</button>
      </div>

      <div className="clock-face">
        {selecting === 'hours' && mode === '12' && renderDial(hours12)}
        {selecting === 'hours' && mode === '24' && (
          <>
            {renderDial(hours24Outer, false)}
            {renderDial(hours24Inner, true)}
          </>
        )}
        {selecting === 'minutes' && renderDial(minutes)}
        
        <div className="clock-center"></div>
      </div>
    </div>
  );
}
