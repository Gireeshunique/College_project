import { useRef, useState } from "react";
import "./AIVoiceAssistant.css";

function AIVoiceAssistant({ pdfText }) {
  const [voiceType, setVoiceType] = useState("female");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const utteranceRef = useRef(null);

  /* ---------------- WAIT FOR VOICES (CHROME FIX) ---------------- */
  const waitForVoices = () =>
    new Promise(resolve => {
      let voices = speechSynthesis.getVoices();
      if (voices.length) return resolve(voices);

      speechSynthesis.onvoiceschanged = () => {
        voices = speechSynthesis.getVoices();
        resolve(voices);
      };
    });

  const getVoice = (voices) =>
    voices.find(v =>
      voiceType === "female"
        ? v.name.toLowerCase().includes("female")
        : v.name.toLowerCase().includes("male")
    ) || voices[0];

  /* ---------------- TEXT CHUNKING ---------------- */
  const chunkText = (text, size = 1200) => {
    const chunks = [];
    let i = 0;
    while (i < text.length) {
      chunks.push(text.slice(i, i + size));
      i += size;
    }
    return chunks;
  };

  /* ▶ START (CORRECT, SINGLE VERSION) */
  const startReading = async () => {
    if (!pdfText || pdfText.trim().length === 0) {
      return; // silently ignore if clicked too early
    }

    speechSynthesis.cancel();
    setIsSpeaking(true);
    setIsPaused(false);

    const voices = await waitForVoices();
    const chunks = chunkText(pdfText);
    let chunkIndex = 0;

    const speakChunk = () => {
      if (chunkIndex >= chunks.length) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
      utterance.voice = getVoice(voices);

      utterance.onend = () => {
        chunkIndex++;
        speakChunk();
      };

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    };

    speakChunk();
  };

  /* ⏸ PAUSE */
  const pauseReading = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  /* ▶ RESUME */
  const resumeReading = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  /* ⏹ STOP */
  const stopReading = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <div className="ai-panel">

      {/* CONTROLS */}
      <select onChange={e => setVoiceType(e.target.value)}>
        <option value="female">Female Voice</option>
        <option value="male">Male Voice</option>
      </select>

      <button onClick={startReading}>
        ▶ Start
      </button>

      <button onClick={pauseReading} disabled={!isSpeaking || isPaused}>
        ⏸ Pause
      </button>

      <button onClick={resumeReading} disabled={!isPaused}>
        ▶ Resume
      </button>

      <button onClick={stopReading}>
        ⏹ Stop
      </button>

      {/* AI AVATAR */}
      <div className={`ai-icon-wrapper ${isSpeaking ? "ai-speaking" : ""}`}>
        <div className="ai-icon">
          <img
            src="/teacher-avatar.png"
            alt="AI Teacher"
            className="teacher-avatar"
          />
        </div>
      </div>

    </div>
  );
}

export default AIVoiceAssistant;
