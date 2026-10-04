// ====================================================================================================
// FILE: frontend/src/components/AIChatWidget.jsx
// TUJUAN:
// Komponen Widget Chatbot Asisten Pemandu Wisata Cerdas Kaldera Danau Toba (Floating AI Concierge).
// Fitur:
// 1. Floating Action Bubble dengan efek radar pulse dan badge online.
// 2. Chat Window Interaktif berbasis Gemini RAG + Pinecone Vector Context.
// 3. Quick Suggestion Prompt Chips (Kuliner Halal, Feri Samosir, Geosite UNESCO, Tenun Ulos).
// 4. Mini Destination Cards yang muncul di dalam percakapan saat AI merekomendasikan tempat.
// 5. Riwayat percakapan interaktif (multi-turn memory) dengan tombol hapus riwayat.
// 6. Dukungan penuh format Markdown dan navigasi sekali klik ke peta GIS (/explore).
// ====================================================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  MessageSquare, 
  X, 
  Send, 
  RotateCcw, 
  MapPin, 
  Compass, 
  Navigation, 
  Star, 
  Bot, 
  User, 
  ExternalLink,
  ChevronDown,
  Info,
  ArrowRight
} from 'lucide-react';
import { sendChatMessage } from '../services/api';
import './AIChatWidget.css';

const QUICK_PROMPTS = [
  { label: '🍲 Kuliner Khas Balige', text: 'Apa saja rekomendasi kuliner autentik berandaliman di Balige?' },
  { label: '🚢 Jadwal Kapal Feri', text: 'Bagaimana jadwal dan rute kapal feri penyeberangan ke Pulau Samosir?' },
  { label: '🏔️ 16 Geosite UNESCO', text: 'Jelaskan daftar 16 Geosite resmi UNESCO Global Geopark Danau Toba.' },
  { label: '🧵 Sentra Tenun Ulos', text: 'Dimana tempat melihat pembuatan kain tenun Ulos tradisional Batak?' },
  { label: '🏨 Homestay View Danau', text: 'Rekomendasikan penginapan dengan pemandangan langsung ke Danau Toba.' }
];

const INITIAL_GREETING = {
  role: 'model',
  text: `**Horas!** 👋 Saya **Asisten Pemandu Wisata TobaRoute AI**.\n\nSaya siap membantu Anda merencanakan perjalanan, mencari kuliner autentik berandaliman, sentra tenun Ulos, 16 Geosite UNESCO, hingga jadwal kapal feri penyeberangan Danau Toba.\n\nAda yang bisa saya bantu untuk trip Anda hari ini?`,
  recommended_places: []
};

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Pulihkan riwayat obrolan dari sessionStorage jika ada
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('tobaroute_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error('Error restoring chat history:', e);
    }
  }, []);

  // Simpan ke sessionStorage setiap kali ada pesan baru
  useEffect(() => {
    if (messages.length > 1) {
      sessionStorage.setItem('tobaroute_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto scroll ke bawah saat pesan bertambah
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Fokuskan input saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim() || loading) return;

    const userMessage = { role: 'user', text: textToSend.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInputValue('');
    setLoading(true);

    try {
      // Susun format history untuk backend [{ role: 'user'|'model', text: '...' }]
      const apiHistory = updatedMessages
        .filter((_, idx) => idx > 0) // lewati greeting default
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const res = await sendChatMessage(textToSend, apiHistory);

      const botReply = {
        role: 'model',
        text: res.reply || 'Mohon maaf, saya belum menemukan jawaban yang tepat. Silakan coba pertanyaan lainnya.',
        recommended_places: res.recommended_places || []
      };

      setMessages(prev => [...prev, botReply]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorReply = {
        role: 'model',
        text: '⚠️ Terjadi gangguan koneksi ke server pemandu AI. Mohon pastikan backend aktif atau coba sesaat lagi.',
        recommended_places: []
      };
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_GREETING]);
    sessionStorage.removeItem('tobaroute_chat_history');
  };

  const handleNavigateToExplore = (place) => {
    setIsOpen(false);
    // 1. Dispatch custom event for instant in-page GIS navigation if user is already on /explore
    try {
      window.dispatchEvent(new CustomEvent('tobaroute:focus_poi', { detail: place }));
    } catch (e) {
      console.warn('Dispatch event error:', e);
    }
    // 2. Navigate with router state and query parameter
    navigate(`/explore?search=${encodeURIComponent(place.nama || '')}`, {
      state: { targetLocation: place }
    });
  };

  return (
    <div className="ai-chat-widget-root">
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="ai-chat-fab-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Buka Asisten AI Toba"
        >
          <div className="fab-radar-wave"></div>
          <div className="fab-icon-wrap">
            <Sparkles size={22} className="fab-sparkle-icon" />
          </div>
          <span className="fab-label-text">Tanya AI Pemandu</span>
          {unreadCount > 0 && <span className="fab-badge">{unreadCount}</span>}
        </button>
      )}

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className="ai-chat-window glass-panel-chat fade-in">
          {/* Header Panel */}
          <div className="chat-window-header">
            <div className="chat-header-left">
              <div className="chat-bot-avatar">
                <Bot size={20} color="#ffffff" />
                <span className="chat-online-indicator"></span>
              </div>
              <div className="chat-header-titles">
                <h4 className="chat-title">
                  TobaRoute AI Concierge
                </h4>
                <span className="chat-subtitle">
                  Pemandu Kaldera & Rekomendasi RAG
                </span>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                type="button"
                className="chat-btn-action"
                onClick={handleResetChat}
                title="Hapus riwayat obrolan"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                className="chat-btn-action"
                onClick={() => setIsOpen(false)}
                title="Tutup jendela obrolan"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="chat-messages-container">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message-row ${msg.role === 'user' ? 'user-row' : 'model-row'}`}
              >
                {msg.role === 'model' && (
                  <div className="chat-msg-avatar">
                    <Bot size={15} color="#0284c7" />
                  </div>
                )}

                <div className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'model-bubble'}`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>

                  {/* Rekomendasi Mini POI Cards dari Jawaban AI */}
                  {msg.recommended_places && msg.recommended_places.length > 0 && (
                    <div className="chat-recommended-places-wrap">
                      <div className="places-header">
                        <MapPin size={13} color="#0284c7" />
                        <span>Destinasi Terkait:</span>
                      </div>
                      <div className="places-grid">
                        {msg.recommended_places.map((place, pIdx) => (
                          <div 
                            key={place.id || pIdx} 
                            className="chat-mini-poi-card"
                            onClick={() => handleNavigateToExplore(place)}
                            role="button"
                            tabIndex={0}
                            title={`Buka ${place.nama} di Peta Jelajah GIS`}
                          >
                            <div className="mini-poi-info">
                              <strong className="mini-poi-name">{place.nama}</strong>
                              <span className="mini-poi-sub">
                                <Navigation size={11} /> {place.kecamatan} &bull; {place.kategori}
                              </span>
                            </div>
                            <div className="mini-poi-action-col">
                              <span className="mini-poi-go-text">
                                <Compass size={11} /> Peta GIS <ArrowRight size={10} />
                              </span>
                              <button
                                type="button"
                                className="btn-mini-poi-action"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNavigateToExplore(place);
                                }}
                                title="Buka lokasi di peta GIS"
                              >
                                <ExternalLink size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="chat-msg-avatar user-avatar">
                    <User size={15} color="#ffffff" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="chat-message-row model-row">
                <div className="chat-msg-avatar">
                  <Bot size={15} color="#0284c7" />
                </div>
                <div className="chat-bubble model-bubble typing-bubble">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">Asisten sedang merangkum rute & budaya...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="chat-quick-prompts-bar">
            {QUICK_PROMPTS.map((qp, qIdx) => (
              <button
                key={qIdx}
                type="button"
                className="chip-prompt-btn"
                onClick={() => handleSendMessage(qp.text)}
                disabled={loading}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            className="chat-input-area"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="chat-text-input"
              placeholder="Tanyakan apa saja tentang Danau Toba..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputValue.trim() || loading}
              aria-label="Kirim pesan"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatWidget;
