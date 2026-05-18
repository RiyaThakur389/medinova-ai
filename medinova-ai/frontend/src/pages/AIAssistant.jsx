import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import { FiSend, FiCpu, FiTrash2 } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const WELCOME_MSG = {
  role: 'assistant',
  content: "👋 Hello! I'm MediNova AI, your 24/7 health assistant. I can help you with:\n\n• General health questions\n• Understanding symptoms\n• Medication information\n• Healthy lifestyle tips\n\nHow can I assist you today? (Note: I'm an AI assistant and not a substitute for professional medical advice.)"
};

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Build history for context (exclude welcome)
      const history = newMessages.slice(1).map(m => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/ai/chat', {
        message: text,
        conversationHistory: history.slice(0, -1) // exclude the user message we just added
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      const errMsg = err.response?.status === 401
        ? 'Please log in to use the AI assistant.'
        : 'AI assistant is temporarily unavailable. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
      if (err.response?.status !== 401) toast.error('AI unavailable');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MSG]);
    toast.success('Chat cleared');
  };

  const quickPrompts = [
    'What are common cold symptoms?',
    'How can I improve my sleep?',
    'What should I eat for a healthy heart?',
    'When should I see a doctor?'
  ];

  return (
    <DashboardLayout title="AI Health Assistant">
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-160px)]">
        {/* Header */}
        <div className="glass rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#0d9488)' }}>
              <FiCpu className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">MediNova AI</h3>
              <p className="text-xs text-emerald-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
                Online · Powered by Groq AI
              </p>
            </div>
          </div>
          <button onClick={clearChat} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Clear chat">
            <FiTrash2 size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1"
                  style={{ background: 'linear-gradient(135deg,#1d4ed8,#0d9488)' }}>
                  <FiCpu size={14} className="text-white" />
                </div>
              )}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=1d4ed8&color=fff&bold=true&size=64`}
                  className="w-8 h-8 rounded-full flex-shrink-0 mb-1"
                  alt=""
                />
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#0d9488)' }}>
                <FiCpu size={14} className="text-white" />
              </div>
              <div className="chat-bubble-ai">
                <div className="flex items-center gap-1.5 py-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 2 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {quickPrompts.map(prompt => (
              <button key={prompt} onClick={() => { setInput(prompt); }}
                className="px-3 py-2 bg-blue-50 text-blue-600 text-xs font-medium rounded-xl hover:bg-blue-100 transition-colors border border-blue-100">
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={sendMessage} className="glass rounded-2xl p-2 flex items-center gap-2">
          <input
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-slate-700 placeholder:text-slate-400"
            placeholder="Ask a health question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#1d4ed8,#0d9488)' }}>
            <FiSend size={16} />
          </button>
        </form>
        <p className="text-center text-xs text-slate-300 mt-2">AI responses are for informational purposes only. Always consult a qualified healthcare professional.</p>
      </div>
    </DashboardLayout>
  );
}
