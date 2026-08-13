import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Mic, MicOff, Send, X, Bot, User, Volume2, Download } from 'lucide-react';
import { exportReceiptPDF } from '../../utils/pdfExport';
import { triggerSuccessConfetti } from '../../utils/confetti';

const CampusAIWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your CampusConnect AI Assistant. Ask me anything about assignments, campus events, grievances, or speak using the microphone! 🎤',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Speech Recognition API if supported by browser
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please type your message.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputValue.trim() };
    setMessages((prev) => [...prev, userMsg]);
    const query = inputValue.trim().toLowerCase();
    setInputValue('');

    // Generate Smart AI Response
    setTimeout(() => {
      let aiText = '';

      if (query.includes('assignment') || query.includes('homework') || query.includes('grade')) {
        aiText = '📚 You can view, submit, and track all coursework under the Assignments tab. Faculty members grade submissions directly with feedback.';
      } else if (query.includes('event') || query.includes('workshop') || query.includes('seminar')) {
        aiText = '🗓 Check out the Events portal to register for upcoming academic workshops and campus seminars with a single click!';
      } else if (query.includes('complaint') || query.includes('grievance') || query.includes('issue')) {
        aiText = '🛡 To raise a grievance, navigate to Complaints → Log Grievance. Campus Administrators monitor and update resolution status in real time.';
      } else if (query.includes('login') || query.includes('role') || query.includes('sign in')) {
        aiText = '🔐 Click the Login dropdown in the navbar to choose between Student, Faculty, or Admin portals.';
      } else if (query.includes('pdf') || query.includes('export') || query.includes('download')) {
        triggerSuccessConfetti();
        exportReceiptPDF({
          title: 'CampusConnect AI Information Report',
          subtitle: 'Generated via CampusConnect AI Assistant Voice & Data Engine',
          details: { Query: userMsg.text, Source: 'AI Assistant', Status: 'Verified' },
          items: [
            { Module: 'Assignments', Capabilities: 'Submission & Grading' },
            { Module: 'Events', Capabilities: 'Registration & RSVP' },
            { Module: 'Complaints', Capabilities: 'Grievance Tracking' },
          ],
        });
        aiText = '📄 Generated and downloaded your official PDF summary report!';
      } else {
        aiText = `✨ Thank you for asking! CampusConnect integrates Students, Faculty, and Administrators into one smart platform. You searched for: "${userMsg.text}".`;
      }

      setMessages((prev) => [...prev, { id: Date.now(), sender: 'ai', text: aiText }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* Floating AI Launch Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center space-x-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 text-white shadow-xl shadow-brand-600/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span className="font-bold text-xs tracking-wide">Campus AI</span>
        </button>
      )}

      {/* AI Chat Window Drawer */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center space-x-1.5">
                  <span>CampusConnect AI</span>
                  <span className="text-[10px] bg-brand-500/30 text-brand-300 font-semibold px-2 py-0.5 rounded-full">
                    Voice & Speech Enabled
                  </span>
                </h4>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Instant Smart Assistant</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-2 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.sender === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Voice Controls */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-50 border-rose-300 text-rose-600 animate-bounce'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
              title={isListening ? 'Listening... Speak now' : 'Click to Speak (Voice Command)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder={isListening ? 'Listening to voice...' : 'Ask AI or speak command...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50 focus:bg-white transition-all"
            />

            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CampusAIWidget;
