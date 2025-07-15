import { useState, useRef, useEffect } from 'react';
import { db, auth } from '../config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Auto-detect sensitive complaints
      const sensitiveComplaintKeywords = /harass|ragging|bully|abuse|scared|afraid|hesitant|don't.*want.*complain|can't.*complain|fear.*complaint/i;

      if (sensitiveComplaintKeywords.test(input)) {
        if (user) {
          await addDoc(collection(db, 'complaints'), {
            title: 'Sensitive Complaint (Filed by Bot)',
            description: input,
            category: 'Safety/Harassment',
            status: 'Flagged',
            priority: 'High',
            isSensitive: true,
            createdAt: serverTimestamp(),
            userId: user.uid,
            userEmail: user.email,
            userName: user.displayName || 'Anonymous',
          });

          setMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: "Thank you for trusting me. I’ve filed a confidential complaint for you. Please know you're not alone — support will be notified, and you're safe. 💙",
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: 'I want to help, but I need you to log in so I can file a confidential complaint for you.',
            },
          ]);
        }
        setLoading(false);
        return;
      }

      // Regular chatbot response via Gemini API
      const res = await fetch('https://us-central1-campusfix-ai.cloudfunctions.net/chatWithGemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botReply = data.reply || 'No response from the bot.';
      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);

    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Oops! Something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  useEffect(() => {
    chatContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-screen bg-[#131313] p-4">
      <div className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
        CampusFix - AI Assistant
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-3xl p-4 sm:p-6 shadow-md space-y-4 border border-gray-200">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-4 py-2 rounded-2xl shadow text-sm whitespace-pre-line ${
              msg.sender === 'user'
                ? 'bg-black text-white self-end ml-auto animate-slide-in-right'
                : 'bg-gradient-to-r from-sky-400 to-blue-500 text-white self-start mr-auto animate-slide-in-left'
            }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="self-start mr-auto bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl shadow animate-pulse flex items-center gap-2">
            <span className="dot-flashing"></span> Typing...
          </div>
        )}

        <div ref={chatContainerRef}></div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="How can I help you today?"
          className="flex-1 p-3 sm:p-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
          disabled={loading}
        >
          Send
        </button>
      </div>

      <style>{`
        @keyframes slide-in-left {
          0% { transform: translateX(-30px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-in-right {
          0% { transform: translateX(30px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .dot-flashing {
          position: relative;
          width: 6px;
          height: 6px;
          background-color: #4b5563;
          border-radius: 50%;
          animation: dotFlashing 1s infinite linear alternate;
        }
        @keyframes dotFlashing {
          0% { background-color: #4b5563; }
          50%, 100% { background-color: #d1d5db; }
        }
      `}</style>
    </div>
  );
}
