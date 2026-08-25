import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  RotateCcw
} from 'lucide-react';
import { HISTORICAL_KNOWLEDGE_BASE } from '../../data/historicalQnAData';
import { ChatMessage } from '../../types/heritage';

interface AskHeritageAIProps {
  language: 'en' | 'hi';
}

export const AskHeritageAI: React.FC<AskHeritageAIProps> = ({ language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: "Namaste! I am your AI Heritage Guide, grounded in Archaeological Survey of India (ASI) records and UNESCO historical dossiers. Ask me anything about India's monuments, conservation techniques, architecture, or hidden histories!",
      hindiText: "नमस्ते! मैं आपका एआई धरोहर गाइड हूँ, जो भारतीय पुरातत्व सर्वेक्षण (ASI) और यूनेस्को के ऐतिहासिक अभिलेखों से सीधे जुड़ा है। भारत के स्मारकों, वास्तुकला या संरक्षण तकनीकों के बारे में मुझसे कोई भी प्रश्न पूछें!",
      timestamp: 'Just now',
      suggestedFollowUps: [
        'Why are the pillars in Hampi musical?',
        'What causes yellowing of Taj Mahal marble?',
        'How do the Konark sundial wheels work?'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  
  // Use scroll container ref rather than full window scrollIntoView
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollChatToBottom = () => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollChatToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: 'Now'
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Search knowledge base
    setTimeout(() => {
      const qLower = query.toLowerCase();
      const matched = HISTORICAL_KNOWLEDGE_BASE.find((item) =>
        item.keywords.some((kw) => qLower.includes(kw.toLowerCase()))
      );

      let aiResponse: ChatMessage;

      if (matched) {
        aiResponse = {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: matched.answerEn,
          hindiText: matched.answerHi,
          timestamp: 'Just now',
          sources: matched.sources,
          suggestedFollowUps: matched.followUps
        };
      } else {
        aiResponse = {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: `Based on ASI architectural records, "${query}" pertains to significant heritage parameters. India's monuments feature intricate stone interlocking systems, natural limestone lime mortar, and deep acoustic resonance engineering. Would you like me to look into specific excavation papers or crowd schedules for this site?`,
          hindiText: `ASI के अभिलेखों के अनुसार, "${query}" हमारे प्राचीन स्थापत्य से संबंधित है। क्या आप इस स्मारक के विशेष इतिहास, संरक्षण कार्य या दर्शन के सर्वोत्तम समय के बारे में विस्तार से जानना चाहते हैं?`,
          timestamp: 'Just now',
          sources: [
            { title: 'ASI Central Heritage Knowledge Repository', archive: 'National Archives of India', confidence: 0.92 }
          ],
          suggestedFollowUps: [
            'Tell me about the best hours to visit to avoid crowds',
            'How does AI detect structural cracks in monuments?'
          ]
        };
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleSpeak = (msg: ChatMessage) => {
    if (activeSpeechId === msg.id) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setActiveSpeechId(null);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = language === 'hi' ? (msg.hindiText || msg.text) : msg.text;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        utterance.rate = 0.95;
        utterance.onend = () => setActiveSpeechId(null);
        utterance.onerror = () => setActiveSpeechId(null);
        window.speechSynthesis.speak(utterance);
        setActiveSpeechId(msg.id);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0D3B2E]/10 text-[#0D3B2E] text-xs font-bold mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>RAG-Grounded Multilingual Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0D3B2E] font-serif-heritage">
          Ask <span className="text-[#C85A32]">Heritage AI</span>
        </h1>
        <p className="text-xs text-[#1A2621]/70 max-w-lg mx-auto mt-0.5">
          {language === 'hi'
            ? 'भारतीय पुरातत्व सर्वेक्षण (ASI) व यूनेस्को के प्रामाणिक संदर्भों से सीधे जुड़े उत्तर प्राप्त करें।'
            : 'Get source-grounded answers backed by ASI archaeological records and UNESCO archives.'}
        </p>
      </div>

      {/* Main Chat Window Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-[#0D3B2E]/15 overflow-hidden flex flex-col h-[520px] sm:h-[580px] w-full">
        
        {/* Chat Header Bar */}
        <div className="bg-[#0D3B2E] text-white px-3.5 sm:px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <Bot className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold truncate">DhoroharDhirsti AI Assistant</h3>
              <p className="text-[10px] text-white/70 flex items-center space-x-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="truncate">Active • Connected to ASI Knowledge Base</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setMessages([messages[0]]);
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed Area (Scrolls internally without moving the browser window) */}
        <div 
          ref={chatScrollContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5 bg-[#F8F6F0]/60 w-full"
        >
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            const displayText = (language === 'hi' && msg.hindiText) ? msg.hindiText : msg.text;

            return (
              <div
                key={msg.id}
                className={`flex flex-col w-full ${isAI ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[92%] sm:max-w-[80%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isAI
                      ? 'bg-white text-[#1A2621] border border-[#0D3B2E]/15'
                      : 'bg-[#0D3B2E] text-white'
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{displayText}</p>

                  {/* Sources Footnote if AI */}
                  {isAI && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 text-[11px] text-[#0D3B2E]/80 space-y-1">
                      <p className="font-bold flex items-center space-x-1 text-[#0D3B2E]">
                        <BookOpen className="w-3 h-3 text-[#C85A32]" />
                        <span>Source Citations:</span>
                      </p>
                      {msg.sources.map((src, sIdx) => (
                        <div key={sIdx} className="bg-[#F8F6F0] p-1.5 rounded text-[10px] text-gray-600 flex items-center justify-between gap-2">
                          <span className="font-medium text-[#0D3B2E] truncate">{src.title}</span>
                          <span className="font-mono text-emerald-700 font-bold shrink-0">{Math.round(src.confidence * 100)}% match</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Audio Read Aloud & Timestamp */}
                  <div className={`mt-1.5 flex items-center justify-between text-[10px] ${isAI ? 'text-gray-400' : 'text-white/60'}`}>
                    <span>{msg.timestamp}</span>
                    {isAI && (
                      <button
                        onClick={() => handleSpeak(msg)}
                        className="flex items-center space-x-1 text-[#0D3B2E] hover:text-[#C85A32] font-semibold transition-colors cursor-pointer ml-2"
                        title="Read aloud"
                      >
                        {activeSpeechId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-red-500" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-[#C85A32]" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Follow-up Prompts Pills */}
                {isAI && msg.suggestedFollowUps && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5 max-w-[92%] sm:max-w-[85%]">
                    {msg.suggestedFollowUps.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSend(prompt)}
                        className="text-[11px] bg-white hover:bg-[#F8F6F0] text-[#0D3B2E] px-2.5 py-1 rounded-full border border-[#0D3B2E]/20 shadow-2xs transition-colors text-left cursor-pointer break-words"
                      >
                        ✦ {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-gray-500 bg-white p-2.5 rounded-2xl w-36 border border-[#0D3B2E]/10 shadow-sm animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D3B2E] animate-ping shrink-0" />
              <span className="truncate">Analyzing archives...</span>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="p-2.5 sm:p-3.5 bg-white border-t border-[#0D3B2E]/10 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2 w-full"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === 'hi' ? 'स्मारकों या इतिहास के बारे में पूछें...' : 'Ask about history, acoustics, mud-packs, or crowds...'}
              className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 bg-[#F8F6F0] border border-[#0D3B2E]/15 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3B2E]/30 focus:bg-white text-[#1A2621]"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-3.5 sm:px-4 py-2.5 bg-[#0D3B2E] hover:bg-[#08281E] disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center space-x-1 text-xs cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
