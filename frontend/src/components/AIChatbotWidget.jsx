import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Bot, User, Sparkles, X, Minimize2, Maximize2, 
  MapPin, Star, ChevronRight, RefreshCw, Trash2, HeartHandshake, Compass, Flame
} from 'lucide-react';
import { sendChatMessage } from '../services/api';
import ReactMarkdown from 'react-markdown';

const QUICK_PROMPTS = [
  { label: '👨‍👩‍👧‍👦 Trip Keluarga Ramah Kantong', query: 'Buatkan rute liburan keluarga 2 hari di Balige dan Samosir yang ramah anak dan hemat di kantong.' },
  { label: '🍲 Rekomendasi Kuliner Batak & Halal', query: 'Rekomendasi kuliner khas Batak halal seperti Ikan Mas Arsik dan Mie Gomak di Balige.' },
  { label: '🧣 Sentra Tenun Ulos & Souvenir Lokal', query: 'Di mana sentra pengrajin tenun ulos dan souvenir lokal UMKM dengan harga terjangkau?' },
  { label: '⛰️ Spot Alam Terbaik & Sunset Toba', query: 'Spot pemandangan alam dan sunset terbaik di kawasan Danau Toba.' },
  { label: '💰 Estimasi Budget Backpacker 3 Hari', query: 'Estimasi biaya dan rute hemat berkeliling Pulau Samosir selama 3 hari 2 malam.' }
];

const AIChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('tobaguide_chat_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        role: 'model',
        text: 'Horas! 🌊 Saya **TobaRoute AI Concierge**, asisten wisata pintar kawasan Danau Toba. Tanyakan apa saja tentang rute, kuliner Batak autentik, penginapan ramah kantong, atau rekomendasi UMKM lokal!'
      }
    ];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('tobaguide_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg = { role: 'user', text: query };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputMessage('');
    setLoading(true);

    try {
      // Format history for backend API
      const apiHistory = updatedHistory
        .filter(m => m.role === 'user' || m.role === 'model')
        .map(m => ({ role: m.role, text: m.text }));

      const res = await sendChatMessage(query, apiHistory);
      
      const botMsg = {
        role: 'model',
        text: res.reply || 'Horas! Kami siap membantu perjalanan Anda di Danau Toba.',
        places: res.recommended_places || [],
        targetKecamatan: res.target_kecamatan
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: 'Horas! Maaf terjadi kendala jaringan sementara. Namun Anda tetap dapat mengeksplorasi seluruh 491 destinasi dan UMKM di halaman Jelajah GIS dan Sentra UMKM!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    const initial = [
      {
        role: 'model',
        text: 'Horas! Riwayat percakapan telah dibersihkan. Ada yang bisa saya bantu untuk rencana liburan Anda?'
      }
    ];
    setMessages(initial);
    localStorage.setItem('tobaguide_chat_history', JSON.stringify(initial));
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          className="chatbot-floating-trigger"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#0071CE',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 24px rgba(0, 113, 206, 0.4)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.95rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div style={{ position: 'relative' }}>
            <Bot size={22} />
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              backgroundColor: '#10B981',
              borderRadius: '50%',
              border: '2px solid #0071CE'
            }} />
          </div>
          <span>Tanya AI Toba</span>
          <span style={{
            fontSize: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 800
          }}>Live</span>
        </button>
      )}

      {/* Chat Window Modal / Drawer */}
      {isOpen && (
        <div
          className="chatbot-window-container fade-in"
          style={{
            position: 'fixed',
            bottom: isExpanded ? '10px' : '24px',
            right: isExpanded ? '10px' : '24px',
            width: isExpanded ? 'calc(100vw - 20px)' : '400px',
            maxWidth: '100vw',
            height: isExpanded ? 'calc(100vh - 20px)' : '580px',
            maxHeight: 'calc(100vh - 30px)',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Chat Header */}
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #0071CE 0%, #0284C7 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={20} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  TobaRoute AI Concierge
                  <span style={{ fontSize: '0.65rem', backgroundColor: '#10B981', color: '#FFF', padding: '1px 6px', borderRadius: '8px' }}>RAG Active</span>
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                  491 POI Spasial • Cohere • Gemini Flash
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handleClearHistory}
                title="Bersihkan Percakapan"
                style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', padding: '6px', borderRadius: '8px', opacity: 0.85 }}
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Kecilkan' : 'Perbesar'}
                style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', padding: '6px', borderRadius: '8px', opacity: 0.85 }}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Tutup Chat"
                style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.query)}
                style={{
                  padding: '5px 11px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '14px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#1E293B',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#0071CE'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            backgroundColor: '#F1F5F9'
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '100%'
                }}
              >
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  maxWidth: '92%',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: msg.role === 'user' ? '#0071CE' : '#10B981',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  <div style={{
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    backgroundColor: msg.role === 'user' ? '#0071CE' : '#FFFFFF',
                    color: msg.role === 'user' ? '#FFFFFF' : '#1E293B',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    wordBreak: 'break-word'
                  }}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>

                {/* Destination Cards Recommendation if any */}
                {msg.places && msg.places.length > 0 && (
                  <div style={{
                    marginTop: '10px',
                    width: '100%',
                    paddingLeft: '38px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      📍 Destinasi Terkait Terverifikasi:
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isExpanded ? 'repeat(auto-fill, minmax(240px, 1fr))' : '1fr',
                      gap: '8px'
                    }}>
                      {msg.places.map((place, pIdx) => (
                        <div
                          key={pIdx}
                          style={{
                            padding: '10px 12px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                          }}
                        >
                          <img
                            src={place.gambar_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80'}
                            alt={place.nama}
                            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {place.nama}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <MapPin size={11} color="#0071CE" /> {place.kecamatan || 'Danau Toba'} • ⭐ {place.rating || 4.8}
                            </div>
                            {place.plus_code && (
                              <div style={{ fontSize: '0.68rem', color: '#00875A', fontWeight: 600, marginTop: '2px' }}>
                                📌 {place.plus_code}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '38px' }}>
                <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid #CBD5E1', borderTopColor: '#0071CE', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: '0.82rem', color: '#64748B', fontStyle: 'italic' }}>
                  TobaRoute AI sedang meracik rekomendasi faktual...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{
              padding: '12px 14px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ketik pertanyaan wisata, rute, atau UMKM..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                outline: 'none',
                backgroundColor: '#F8FAFC'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0071CE'}
              onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              style={{
                backgroundColor: inputMessage.trim() ? '#0071CE' : '#94A3B8',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              <Send size={17} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatbotWidget;
