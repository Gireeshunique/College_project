import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./PDFViewer.css";

/* ===============================
   TEXT CLEANER (PUT HERE)
================================ */
const cleanExtractedText = (text) => {
  return text
    .replace(/\r?\n+/g, " ")   // remove line breaks
    .replace(/\s{2,}/g, " ")   // collapse spaces
    .replace(/-\s+/g, "")      // fix hyphen breaks
    .replace(/\f/g, " ")       // remove page breaks
    .trim();
};

function PDFViewer({
  pdfUrl,
  setPdfUrl,
  setPdfText,
  words,
  setWords,
  activeWord
}) {
  const [isReady, setIsReady] = useState(false);

  const pdfFrameRef = useRef(null);
  const wordRefs = useRef([]);
  const prevWordRef = useRef(null);

  /* ========== UPLOAD PDF ========== */
  const uploadPDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsReady(false);
    setPdfText("");
    setWords([]);
    wordRefs.current = [];

    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "http://localhost:5000/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setPdfUrl(res.data.pdf_url);

    const rawText = res.data.pages.map(p => p.text).join(" ");
    const cleanedText = cleanExtractedText(rawText);

    setPdfText(cleanedText);
    setWords(cleanedText.split(" "));


    setIsReady(true);
  };  

  /* ========== WORD HIGHLIGHT + SCROLL ========== */
 useEffect(() => {
  if (!isReady || activeWord < 0 || words.length === 0) return;

  const el = wordRefs.current[activeWord];
  if (!el) return;

  prevWordRef.current?.classList.remove("word-highlight");
  el.classList.add("word-highlight");
  prevWordRef.current = el;

  el.scrollIntoView({ behavior: "smooth", block: "center" });

  if (pdfFrameRef.current) {
    const iframe = pdfFrameRef.current;
    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const progress = activeWord / words.length;
    const maxScroll =
      doc.documentElement.scrollHeight -
      doc.documentElement.clientHeight;

    iframe.contentWindow.scrollTo({
      top: progress * maxScroll,
      behavior: "smooth"
    });
  }
}, [activeWord, isReady, words.length]);


  return (
    <div className="pdf-container">
      <h2>📄 AI PDF Reader</h2>

      <input type="file" accept=".pdf,.docx,.ppt,.pptx" onChange={uploadPDF} />

      <div className="pdf-inner">
  {pdfUrl ? (
    pdfUrl.endsWith(".pdf") ? (
      <iframe
        ref={pdfFrameRef}
        src={pdfUrl}
        title="Document Preview"
        className="pdf-frame"
      />
    ) : (
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pdfUrl)}`}
        title="Office Preview"
        className="pdf-frame"
      />
    )
  ) : (
    <div className="pdf-placeholder">
      Upload a document to preview
    </div>
  )}
</div>


      {isReady && (
        <div className="pdf-text-outside">
          {words.map((word, i) => (
            <span
              key={i}
              ref={(el) => (wordRefs.current[i] = el)}
            >
              {word}{" "}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default PDFViewer;
