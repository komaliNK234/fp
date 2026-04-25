import { useState } from 'react';
import { Mic, Plus } from 'lucide-react';
import ClockPicker from './ClockPicker';

export default function CreateAlarm({ onAdd }) {
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('Home');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (time && place) {
      onAdd({ time, place });
      setTime('');
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Input. Please enter manually.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      // Very basic parsing: "Set alarm for 7:30 at Home"
      const places = ['home', 'hostel', 'college'];
      let foundPlace = place;
      for (const p of places) {
        if (transcript.includes(p)) foundPlace = p.charAt(0).toUpperCase() + p.slice(1);
      }
      setPlace(foundPlace);
      
      const timeMatch = transcript.match(/(\d{1,2})(?::|.)?(\d{2})?\s*(am|pm)?/i);
      if (timeMatch) {
         let hours = parseInt(timeMatch[1]);
         let mins = timeMatch[2] || '00';
         const period = timeMatch[3];
         if (period === 'pm' && hours < 12) hours += 12;
         if (period === 'am' && hours === 12) hours = 0;
         setTime(`${hours.toString().padStart(2, '0')}:${mins}`);
      }
    };
  };

  return (
    <form onSubmit={handleSubmit}>
      <button 
        type="button" 
        className={`btn btn-voice ${isListening ? 'listening' : ''}`}
        onClick={startVoiceRecognition}
      >
        <Mic size={20} />
        {isListening ? 'Listening...' : 'Speak to Set Alarm (e.g. 7:30 AM Home)'}
      </button>

      <div className="input-group">
        <label>Time</label>
        <ClockPicker value={time} onChange={setTime} />
      </div>

      <div className="input-group">
        <label>Location</label>
        <select value={place} onChange={(e) => setPlace(e.target.value)}>
          <option value="Home">Home</option>
          <option value="Hostel">Hostel</option>
          <option value="College">College</option>
        </select>
      </div>

      <button type="submit" className="btn btn-primary">
        <Plus size={20} /> Add Alarm
      </button>
    </form>
  );
}
