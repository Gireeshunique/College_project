import {
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";
import axios from "axios";
import "./PDFViewer.css";

function PDFViewer({ setPdfText, words = [], activeWord = -1 }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [isPdfReady, setIsPdfReady] = useState(false);

  const pdfFrameRef = useRef(null);
  const wordRefs = useRef([]);
  const prevWordRef = useRef(null);

  /* ---------------- PDF UPLOAD ---------------- */
  const uploadPDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsPdfReady(false);
    setExtractedText("");
    setPdfText("");
    wordRefs.current = [];

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // ✅ USE pdf_url DIRECTLY (NO MANUAL CONCAT)
      if (!res.data.pdf_url) {
        throw new Error("pdf_url missing from backend");
      }

      setPdfUrl(res.data.pdf_url);

      // optional: backend may or may not send text
      if (res.data.pages) {
        const fullText = res.data.pages
          .map(p => p.text)
          .join(" ");

        setExtractedText(fullText);
        setPdfText(fullText);
        setIsPdfReady(true);
      } else {
        // still allow PDF viewing
        setIsPdfReady(true);
      }

    } catch (err) {
      console.error("PDF upload failed:", err);
      setIsPdfReady(false);
    }
  };

  /* ---------------- WINDOWED WORD RENDERING ---------------- */
  const WINDOW = 300;
  const HALF = WINDOW / 2;

  const start = Math.max(activeWord - HALF, 0);
  const end = start + WINDOW;

  const visibleWords = extractedText
    ? extractedText.split(/\s+/).slice(start, end)
    : [];

  /* ---------------- PDF AUTO SCROLL ---------------- */
  const scrollPdfByProgress = useCallback(() => {
    if (!pdfFrameRef.current || activeWord < 0) return;

    const iframe = pdfFrameRef.current;
    const iframeWindow = iframe.contentWindow;
    const iframeDoc = iframeWindow?.document;
    if (!iframeDoc) return;

    const totalHeight = iframeDoc.documentElement.scrollHeight;
    const viewportHeight = iframeDoc.documentElement.clientHeight;

    const progress = activeWord / Math.max(words.length, 1);

    iframeWindow.scrollTo({
      top: progress * (totalHeight - viewportHeight),
      behavior: "smooth"
    });
  }, [activeWord, words.length]);

  /* ---------------- WORD HIGHLIGHT + SCROLL ---------------- */
  useEffect(() => {
    if (!isPdfReady || activeWord < 0) return;

    const currentEl = wordRefs.current[activeWord];
    if (!currentEl) return;

    prevWordRef.current?.classList.remove("word-highlight");
    currentEl.classList.add("word-highlight");

    currentEl.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    prevWordRef.current = currentEl;

    scrollPdfByProgress();
  }, [activeWord, scrollPdfByProgress, isPdfReady]);

  return (
    <>
      {/* ================= PDF VIEW ================= */}
      <div className="pdf-container">
        <h2>📄 AI PDF Viewer</h2>

        <input
          type="file"
          accept=".pdf,.ppt,.pptx,.doc,.docx"
          onChange={uploadPDF}
        />

        {!isPdfReady && pdfUrl && (
          <p style={{ marginTop: "8px", color: "#555" }}>
            ⏳ Preparing document…
          </p>
        )}

        <div className="pdf-inner">
          {pdfUrl ? (
            <iframe
              ref={pdfFrameRef}
              src={pdfUrl}
              title="PDF"
              className="pdf-frame"
            />
          ) : (
            <div className="pdf-placeholder">
              Upload a PDF to preview here
            </div>
          )}
        </div>
      </div>

      {/* ================= EXTRACTED TEXT ================= */}
      {isPdfReady && extractedText && (
        <div className="pdf-text-outside">
          {visibleWords.map((word, i) => {
            const actualIndex = start + i;
            return (
              <span
                key={actualIndex}
                ref={el => (wordRefs.current[actualIndex] = el)}
              >
                {word}&nbsp;
              </span>
            );
          })}
        </div>
      )}
    </>
  );
}

export default PDFViewer;
