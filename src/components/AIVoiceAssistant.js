import { useRef, useState } from "react";
import "./AIVoiceAssistant.css";

function AIVoiceAssistant({ pdfText, setActiveWord }) {
  const [voiceType, setVoiceType] = useState("female");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const utteranceRef = useRef(null);
  const currentWordIndexRef = useRef(null);
 
  /* ---------- WAIT FOR VOICES ---------- */
  const waitForVoices = () =>
    new Promise(resolve => {
      let voices = speechSynthesis.getVoices();
      if (voices.length) return resolve(voices);
      speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices());
    });

  const getVoice = (voices) =>
    voices.find(v =>
      voiceType === "female"
        ? v.name.toLowerCase().includes("female")
        : v.name.toLowerCase().includes("male")
    ) || voices[0];

  /* ---------- SPEAK FROM WORD ---------- */
  const speakFromWord = async (startIndex) => {
    if (!pdfText) return;

    const voices = await waitForVoices();
    const words = pdfText.split(" ");
    const remainingText = words.slice(startIndex).join(" ");

    const utterance = new SpeechSynthesisUtterance(remainingText);
    utterance.voice = getVoice(voices);

    let localIndex = startIndex;

    utterance.onboundary = (e) => {
      if (e.name === "word") {
        setActiveWord(localIndex);
        currentWordIndexRef.current = localIndex;
        localIndex++;
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveWord(-1);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  /* ▶ START */
  const startReading = () => {
    if (!pdfText) return;

    speechSynthesis.cancel();
    currentWordIndexRef.current = 0;
    setIsSpeaking(true);
    setIsPaused(false);
    setActiveWord(-1);

    speakFromWord(0);
  };

  /* ⏸ PAUSE */
  const pauseReading = () => {
    if (!isSpeaking) return;

    speechSynthesis.cancel(); // stop current utterance
    setIsSpeaking(false);
    setIsPaused(true);
  };

  /* ▶ RESUME (FIXED) */
  const resumeReading = () => {
    if (!isPaused) return;

    setIsPaused(false);
    setIsSpeaking(true);

    speakFromWord(currentWordIndexRef.current);
  };

  /* ⏹ STOP (RESET) */
  const stopReading = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveWord(-1);
    currentWordIndexRef.current = 0;
  };

  return (
    <div className="ai-panel">

      <select
        onChange={e => setVoiceType(e.target.value)}
        disabled={isSpeaking}
      >
        <option value="female">Female Voice</option>
        <option value="male">Male Voice</option>
      </select>

      <button onClick={startReading} disabled={!pdfText || isSpeaking}>
        ▶ Start
      </button>

      <button onClick={pauseReading} disabled={!isSpeaking}>
        ⏸ Pause
      </button>

      <button onClick={resumeReading} disabled={!isPaused}>
        ▶ Resume
      </button>

      <button onClick={stopReading} disabled={!isSpeaking && !isPaused}>
        ⏹ Stop
      </button>

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
