import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function FarmerChatbotPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "👋 Namaste! मैं आपका किसान मित्र हूँ। You can ask me in Hindi, Kannada, Tamil, English and more!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en"); // default English
  const recognitionRef = useRef(null);

  // 🌐 Translate text (using free LibreTranslate for demo, replace with Google/Bhashini in prod)
  const translateText = async (text, targetLang) => {
    try {
      const res = await axios.post("https://libretranslate.de/translate", {
        q: text,
        source: "auto",
        target: targetLang,
      });
      return res.data.translatedText;
    } catch (err) {
      console.error("Translation error", err);
      return text;
    }
  };

  // 🎤 Start Speech Recognition
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported. Use Chrome.");
      return;
    }
    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = languageMap[language] || "en-IN"; // pick chosen lang
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setInput(speechResult);
      sendMessage(speechResult); // auto send
    };

    recognitionRef.current.start();
  };

  // 🔊 Speak Response
  const speak = (text, lang) => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageMap[lang] || "en-IN";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  // Send message to backend with translation
  const sendMessage = async (msg = input) => {
    const q = msg.trim();
    if (!q) return;
    setMessages([...messages, { role: "user", text: q }]);
    setInput("");
    setLoading(true);

    try {
      // 1. Translate farmer's question to English
      const englishQ = await translateText(q, "en");

      // 2. Ask backend in English
      const res = await axios.post(`${API}/api/ask`, { query: englishQ });
      let answer = res.data?.answer || "Sorry, I could not find an answer.";

      // 3. Translate answer back to selected language
      const translatedAnswer = await translateText(answer, language);

      setMessages((msgs) => [...msgs, { role: "assistant", text: translatedAnswer }]);
      speak(translatedAnswer, language); // Speak out
    } catch (e) {
      setMessages((msgs) => [...msgs, { role: "assistant", text: "⚠️ Server error. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  // 🌍 Language Options
  const languageMap = {
    en: "en-IN",
    hi: "hi-IN", // Hindi
    kn: "kn-IN", // Kannada
    ta: "ta-IN", // Tamil
    te: "te-IN", // Telugu
    mr: "mr-IN", // Marathi
    bn: "bn-IN", // Bengali
  };

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "1rem" }}>
      <h2>🤖 Farmer Chatbot (Multilingual)</h2>

      {/* Language Selector */}
      <div style={{ marginBottom: "1rem" }}>
        <label><b>🌐 Choose Language: </b></label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="hi">हिंदी (Hindi)</option>
          <option value="kn">ಕನ್ನಡ (Kannada)</option>
          <option value="ta">தமிழ் (Tamil)</option>
          <option value="te">తెలుగు (Telugu)</option>
          <option value="mr">मराठी (Marathi)</option>
          <option value="bn">বাংলা (Bengali)</option>
        </select>
      </div>

      {/* Chat Window */}
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, minHeight: 400, background: "#f9f9f9" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.role === "user" ? "right" : "left", margin: "0.5rem 0" }}>
            <div
              style={{
                display: "inline-block",
                background: m.role === "user" ? "#1abc9c" : "#fff",
                color: m.role === "user" ? "#fff" : "#333",
                padding: "10px 14px",
                borderRadius: 8,
                maxWidth: "85%",
                whiteSpace: "pre-wrap",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input + Buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask in ${language.toUpperCase()}...`}
          style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #ccc" }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{ padding: "0.8rem 1.2rem", borderRadius: 8, border: 0, background: "#1abc9c", color: "#fff" }}
        >
          {loading ? "Thinking…" : "Send"}
        </button>
        <button
          onClick={startListening}
          style={{ padding: "0.8rem 1.2rem", borderRadius: 8, border: 0, background: "#f39c12", color: "#fff" }}
        >
          🎤 Speak
        </button>
      </div>

      {/* Quick Navigation */}
      <div style={{ marginTop: 20 }}>
        <h4>🌱 Quick Tools</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
          <Link to="/crop-selector" className="quick-btn">🌾 Crop Selector</Link>
          <Link to="/roi-checker" className="quick-btn">💰 ROI Checker</Link>
          <Link to="/govt-schemes" className="quick-btn">📜 Govt Schemes</Link>
          <Link to="/water-advisor" className="quick-btn">💧 Water Advisor</Link>
          <Link to="/farm-calendar" className="quick-btn">🗓️ Farm Calendar</Link>
        </div>
      </div>
    </div>
  );
}
