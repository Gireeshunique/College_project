import { useState } from "react";
import PDFViewer from "./components/PDFViewer";
import AIVoiceAssistant from "./components/AIVoiceAssistant";

function App() {
  const [pdfText, setPdfText] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [activeWord, setActiveWord] = useState(-1);
  const [words, setWords] = useState([]);

  return (
    <>
      <PDFViewer
        pdfUrl={pdfUrl}
        setPdfUrl={setPdfUrl}
        setPdfText={setPdfText}
        words={words}
        setWords={setWords}
        activeWord={activeWord}
      />

      <AIVoiceAssistant
        pdfText={pdfText}
        setActiveWord={setActiveWord}
      />
    </>
  );
}

export default App;
