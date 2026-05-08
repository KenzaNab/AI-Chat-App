import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const MODELS = ['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4o'];
const SYSTEM_PROMPTS = {
  assistant: 'You are a helpful AI assistant.',
  coder: 'You are an expert programmer. Always provide clean, well-commented code.',
  teacher: 'You are a patient teacher. Explain concepts simply with examples.',
  german: 'Du bist ein hilfreicher Assistent. Antworte immer auf Deutsch.',
};

const s = {
  app: { display: 'flex', height: '100vh', background: '#0d1117', color: '#c9d1d9', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' },
  sidebar: { width: 260, background: '#161b22', borderRight: '1px solid #30363d', display: 'flex', flexDirection: 'column', padding: '1rem' },
  logo: { fontSize: 18, fontWeight: 700, color: '#58a6ff', marginBottom: 20 },
  newBtn: { background: '#238636', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 16 },
  chatItem: (active) => ({ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: active ? '#e6edf3' : '#8b949e', background: active ? '#21262d' : 'transparent', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }),
  main: { flex: 1, display: 'flex', flexDirection: 'column' },
  topBar: { padding: '12px 1.5rem', borderBottom: '1px solid #30363d', display: 'flex', gap: 12, alignItems: 'center' },
  select: { background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9', borderRadius: 6, padding: '6px 10px', fontSize: 13, cursor: 'pointer' },
  messages: { flex: 1, overflowY: 'auto', padding: '1.5rem' },
  msgRow: (role) => ({ display: 'flex', justifyContent: role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 16 }),
  bubble: (role) => ({ maxWidth: '70%', padding: '10px 14px', borderRadius: role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: role === 'user' ? '#238636' : '#21262d', color: '#e6edf3', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }),
  inputRow: { padding: '1rem 1.5rem', borderTop: '1px solid #30363d', display: 'flex', gap: 10 },
  textarea: { flex: 1, background: '#21262d', border: '1px solid #30363d', borderRadius: 10, padding: '10px 14px', color: '#e6edf3', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit' },
  sendBtn: { background: '#238636', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8b949e' },
};

export default function App() {
  const [chats, setChats] = useState([{ id: 1, title: 'New Chat', messages: [] }]);
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [persona, setPersona] = useState('assistant');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const active = chats.find(c => c.id === activeId);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [active?.messages]);

  const newChat = () => {
    const id = Date.now();
    setChats([...chats, { id, title: 'New Chat', messages: [] }]);
    setActiveId(id);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const updatedMessages = [...active.messages, userMsg];
    setChats(chats.map(c => c.id === activeId ? {
      ...c,
      title: c.messages.length === 0 ? input.slice(0, 30) : c.title,
      messages: updatedMessages
    } : c));
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/chat/message', {
        messages: [{ role: 'system', content: SYSTEM_PROMPTS[persona] }, ...updatedMessages],
        model,
      });
      setChats(prev => prev.map(c => c.id === activeId ? {
        ...c, messages: [...updatedMessages, { role: 'assistant', content: data.content }]
      } : c));
    } catch (err) {
      setChats(prev => prev.map(c => c.id === activeId ? {
        ...c, messages: [...updatedMessages, { role: 'assistant', content: 'Error: ' + (err.response?.data?.detail || err.message) }]
      } : c));
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={s.app}>
      <div style={s.sidebar}>
        <div style={s.logo}>AI Chat</div>
        <button style={s.newBtn} onClick={newChat}>+ New Chat</button>
        {chats.map(c => (
          <div key={c.id} style={s.chatItem(c.id === activeId)} onClick={() => setActiveId(c.id)}>
            {c.title}
          </div>
        ))}
      </div>
      <div style={s.main}>
        <div style={s.topBar}>
          <select style={s.select} value={model} onChange={e => setModel(e.target.value)}>
            {MODELS.map(m => <option key={m}>{m}</option>)}
          </select>
          <select style={s.select} value={persona} onChange={e => setPersona(e.target.value)}>
            {Object.keys(SYSTEM_PROMPTS).map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        {active?.messages.length === 0 ? (
          <div style={s.emptyState}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>💬</p>
            <p style={{ fontSize: 16, marginBottom: 4 }}>Start a conversation</p>
            <p style={{ fontSize: 13 }}>Model: {model} · Persona: {persona}</p>
          </div>
        ) : (
          <div style={s.messages}>
            {active.messages.map((m, i) => (
              <div key={i} style={s.msgRow(m.role)}>
                <div style={s.bubble(m.role)}>{m.content}</div>
              </div>
            ))}
            {loading && <div style={s.msgRow('assistant')}><div style={{ ...s.bubble('assistant'), color: '#8b949e' }}>Thinking...</div></div>}
            <div ref={bottomRef} />
          </div>
        )}
        <div style={s.inputRow}>
          <textarea style={s.textarea} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey} placeholder="Message... (Enter to send, Shift+Enter for new line)" rows={1} />
          <button style={s.sendBtn} onClick={send} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}
