import { askVoice } from "../api";

function VoiceInput() {
  const record = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    let data = [];

    recorder.ondataavailable = e => data.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(data, { type: "audio/wav" });
      await askVoice(blob);
    };

    recorder.start();
    setTimeout(() => recorder.stop(), 5000);
  };

  return <button onClick={record}>🎤 Speak</button>;
}

export default VoiceInput;
