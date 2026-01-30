import axios from "axios";

export const uploadPDF = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return axios.post("http://localhost:5000/upload", fd);
};

export const askText = (question) =>
  axios.post("http://localhost:5000/ask", { question });

export const askVoice = (audio) => {
  const fd = new FormData();
  fd.append("audio", audio);
  return axios.post("http://localhost:5000/voice", fd);
};
