import { useRef, useState } from "react";

import PDFViewer from "./components/PDFViewer";
import AIVoiceAssistant from "./components/AIVoiceAssistant";

function App() {
  const textLayerRef = useRef(null);
  const [pdfText, setPdfText] = useState("");

  return (
    <div className="layout">

      {/* PDF Viewer */}
      <PDFViewer
        setPdfText={setPdfText}     // 🔥 MUST be used inside PDFViewer
        textLayerRef={textLayerRef}
      />

      {/* AI Voice Assistant */}
      <AIVoiceAssistant
        pdfText={pdfText}          // 🔥 This is what AI reads
        textLayerRef={textLayerRef}
      />

    </div>
  );
}

export default App;
