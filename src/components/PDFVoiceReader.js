import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import "./PDFVoiceReader.css";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

function PDFVoiceReader({ pdfUrl, setPdfUrl,setPdfText })
 {
  const canvasRef = useRef(null);

  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const [activeWord, setActiveWord] = useState(-1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTextReady, setIsTextReady] = useState(false);

  /* ===== LOAD PDF (VISUAL) ===== */
  useEffect(() => {
    if (!pdfUrl) return;

    const loadPdf = async () => {
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      // ✅ Fetch text AFTER PDF is rendered
      fetchPdfText();
    };

    loadPdf();
  }, [pdfUrl]);

  /* ===== FETCH PAGE-WISE TEXT ===== */
  const fetchPdfText = async () => {
    try {
      const res = await fetch("http://localhost:5000/pdf_text_pages");
      const pages = await res.json();

      if (!pages || pages.length === 0) return;

      const fullText = pages.map(p => p.text).join(" ");
      setText(fullText);
      setWords(fullText.split(/\s+/));
      setIsTextReady(true);
      setPdfText(fullText);
    } catch (err) {
      console.error("Failed to fetch PDF text", err);
    }
  };

  /* ===== AI READ + WORD HIGHLIGHT ===== */
  const startReading = () => {
    // ✅ Correct condition
    if (!pdfUrl) {
      alert("Upload a PDF first");
      return;
    }

    if (!isTextReady || words.length === 0) {
      alert("Preparing text, please wait...");
      return;
    }

    speechSynthesis.cancel();
    setIsSpeaking(true);
    setActiveWord(-1);

    const utterance = new SpeechSynthesisUtterance(text);
    let wordIndex = 0;

    utterance.onboundary = (e) => {
      if (e.name === "word") {
        setActiveWord(wordIndex++);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveWord(-1);
    };

    speechSynthesis.speak(utterance);
  };

  /* ===== AUTO SCROLL TEXT ===== */
  useEffect(() => {
    if (activeWord >= 0) {
      document
        .getElementById(`word-${activeWord}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeWord]);

  return (
    <div>
      <div className="pdf-container">
        <canvas ref={canvasRef} />
      </div>

      <button
        onClick={startReading}
        disabled={!pdfUrl || isSpeaking}
      >
        ▶ Read PDF
      </button>

      {pdfUrl && !isTextReady && (
        <p style={{ color: "#666" }}>Preparing text for reading…</p>
      )}

      <div className="pdf-text">
        {words.map((w, i) => (
          <span
            key={i}
            id={`word-${i}`}
            className={i === activeWord ? "highlight" : ""}
          >
            {w}{" "}
          </span>
        ))}
      </div>
    </div>
  );
}

export default PDFVoiceReader;
