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
import { getSites, queryHeritageRAG, BackendSite } from '../../api/sites';
import { ChatMessage } from '../../types/heritage';

interface AskHeritageAIProps {
  language: 'en' | 'hi';
}

const ALL_20_SITES: BackendSite[] = [
  { site_id: 'DEL001', name: 'Red Fort (लाल किला)', city: 'Delhi', state: 'Delhi', latitude: 28.6562, longitude: 77.241 },
  { site_id: 'DEL002', name: 'Qutub Minar (कुतुब मीनार)', city: 'Delhi', state: 'Delhi', latitude: 28.5245, longitude: 77.1855 },
  { site_id: 'DEL003', name: 'India Gate (इंडिया गेट)', city: 'Delhi', state: 'Delhi', latitude: 28.6129, longitude: 77.2295 },
  { site_id: 'DEL004', name: 'Humayun’s Tomb (हुमायूँ का मकबरा)', city: 'Delhi', state: 'Delhi', latitude: 28.5933, longitude: 77.2507 },
  { site_id: 'DEL005', name: 'Lotus Temple (लोटस टेम्पल)', city: 'Delhi', state: 'Delhi', latitude: 28.5535, longitude: 77.2588 },

  { site_id: 'JAI001', name: 'Amer Fort (आमेर किला)', city: 'Jaipur', state: 'Rajasthan', latitude: 26.9855, longitude: 75.8513 },
  { site_id: 'JAI002', name: 'Hawa Mahal (हवा महल)', city: 'Jaipur', state: 'Rajasthan', latitude: 26.9239, longitude: 75.8267 },
  { site_id: 'JAI003', name: 'City Palace (सिटी पैलेस)', city: 'Jaipur', state: 'Rajasthan', latitude: 26.9255, longitude: 75.8236 },
  { site_id: 'JAI004', name: 'Jantar Mantar (जंतर मंतर)', city: 'Jaipur', state: 'Rajasthan', latitude: 26.9247, longitude: 75.8245 },
  { site_id: 'JAI005', name: 'Albert Hall Museum (अल्बर्ट हॉल)', city: 'Jaipur', state: 'Rajasthan', latitude: 26.9116, longitude: 75.8195 },

  { site_id: 'BOM001', name: 'Gateway of India (गेटवे ऑफ इंडिया)', city: 'Mumbai', state: 'Maharashtra', latitude: 18.922, longitude: 72.8347 },
  { site_id: 'BOM002', name: 'Elephanta Caves (एलिफेंटा गुफाएं)', city: 'Mumbai', state: 'Maharashtra', latitude: 18.9633, longitude: 72.9315 },
  { site_id: 'BOM003', name: 'CSMT Station (छत्रपति शिवाजी महाराज टर्मिनस)', city: 'Mumbai', state: 'Maharashtra', latitude: 18.94, longitude: 72.8355 },
  { site_id: 'BOM004', name: 'Haji Ali Dargah (हाजी अली दरगाह)', city: 'Mumbai', state: 'Maharashtra', latitude: 18.9827, longitude: 72.8089 },
  { site_id: 'BOM005', name: 'Siddhivinayak Temple (सिद्धिविनायक मंदिर)', city: 'Mumbai', state: 'Maharashtra', latitude: 19.0166, longitude: 72.8304 },

  { site_id: 'PRA001', name: 'Triveni Sangam (त्रिवेणी संगम)', city: 'Prayagraj', state: 'Uttar Pradesh', latitude: 25.4299, longitude: 81.8848 },
  { site_id: 'PRA002', name: 'Allahabad Fort (इलाहाबाद का किला)', city: 'Prayagraj', state: 'Uttar Pradesh', latitude: 25.4287, longitude: 81.8761 },
  { site_id: 'PRA003', name: 'Khusro Bagh (खुसरो बाग)', city: 'Prayagraj', state: 'Uttar Pradesh', latitude: 25.4429, longitude: 81.8153 },
  { site_id: 'PRA004', name: 'Anand Bhavan (आनंद भवन)', city: 'Prayagraj', state: 'Uttar Pradesh', latitude: 25.4615, longitude: 81.8596 },
  { site_id: 'PRA005', name: 'Chandrashekhar Azad Park (चंद्रशेखर आजाद पार्क)', city: 'Prayagraj', state: 'Uttar Pradesh', latitude: 25.4542, longitude: 81.8499 }
];

export const AskHeritageAI: React.FC<AskHeritageAIProps> = ({ language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: "Namaste! I am your AI Heritage Guide, grounded in Archaeological Survey of India (ASI) records and UNESCO historical dossiers. Ask me anything about India's monuments, conservation techniques, architecture, or hidden histories!",
      hindiText: "नमस्ते! मैं आपका एआई धरोहर गाइड हूँ, जो भारतीय पुरातत्व सर्वेक्षण (ASI) और यूनेस्को के ऐतिहासिक अभिलेखों से सीधे जुड़ा है। भारत के स्मारकों, वास्तुकला या संरक्षण तकनीकों के बारे में मुझसे कोई भी प्रश्न पूछें!",
      timestamp: 'Just now',
      suggestedFollowUps: [
        'What is the best time to visit Red Fort today?',
        'Is Hawa Mahal crowded this evening?',
        'Tell me about the history of Qutub Minar.',
        'Which is better for a peaceful visit, Amer Fort or City Palace?',
        'What should I see at Elephanta Caves?',
        'Tell me about Triveni Sangam.'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);

  // Backend RAG state initialized with all 20 sites
  const [backendSites, setBackendSites] = useState<BackendSite[]>(ALL_20_SITES);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');
  const [ragError, setRagError] = useState<string | null>(null);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const sites = await getSites();
        if (Array.isArray(sites) && sites.length > 0) {
          console.log('RAG - BACKEND SITES LOADED:', sites.length);
          // Merge loaded sites with ALL_20_SITES to ensure complete coverage
          const existingIds = new Set(sites.map((s) => s.site_id));
          const combined = [...sites, ...ALL_20_SITES.filter((s) => !existingIds.has(s.site_id))];
          setBackendSites(combined);
        }
      } catch (error) {
        console.error('RAG - USING DEFAULT 20 SITES:', error);
      }
    };

    loadSites();
  }, []);
  
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

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();

    if (!query || isTyping) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: 'Now'
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setRagError(null);

    // Auto detect target site ID from question text if "all" is selected
    let targetSiteId = selectedSiteId;
    const qLower = query.toLowerCase();

    for (const site of backendSites) {
      const nameParts = site.name.toLowerCase().replace(/[()]/g, ' ').split(' ');
      const hasMatch = nameParts.some(
        (part) => part.length > 3 && qLower.includes(part)
      ) || qLower.includes(site.site_id.toLowerCase());

      if (hasMatch) {
        targetSiteId = site.site_id;
        break;
      }
    }

    const siteIdToUse = (targetSiteId && targetSiteId !== 'all') ? targetSiteId : (backendSites[0]?.site_id || 'DEL001');

    try {
      console.log('RAG - QUERYING SITE:', {
        site_id: siteIdToUse,
        question: query
      });

      const response: any = await queryHeritageRAG({
        site_id: siteIdToUse,
        question: query
      });

      console.log('RAG - BACKEND RESPONSE:', response);

      const answer =
        response?.answer ??
        response?.response ??
        response?.text ??
        response?.message ??
        'The heritage knowledge service returned no answer.';

      const hindiAnswer =
        response?.hindi_answer ??
        response?.answer_hi ??
        response?.hindiText ??
        response?.hindi_response;

      const backendSources = Array.isArray(response?.sources)
        ? response.sources
            .map((source: any) => ({
              title: source.title || source.name || 'ASI Heritage Archives',
              archive: source.archive || source.source || source.url || 'UNESCO Records',
              confidence: Number(source.confidence ?? source.score ?? 0.95)
            }))
            .filter((source: any) => Number.isFinite(source.confidence))
        : [];

      const aiResponse: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: String(answer),
        hindiText: hindiAnswer ? String(hindiAnswer) : undefined,
        timestamp: 'Just now',
        sources: backendSources.length > 0 ? backendSources : undefined,
        suggestedFollowUps: undefined
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error: any) {
      console.error('RAG - BACKEND QUERY FAILED, USING FALLBACK:', error);

      setRagError(
        error?.message || 'Unable to connect to the Heritage AI backend.'
      );

      // Local knowledge-base fallback logic
      const matched = HISTORICAL_KNOWLEDGE_BASE.find((item) =>
        item.keywords.some((kw) => qLower.includes(kw.toLowerCase()))
      );

      // Find matched site metadata from default list
      const matchedSite = backendSites.find((s) =>
        s.site_id.toLowerCase() === siteIdToUse.toLowerCase() ||
        qLower.includes(s.name.toLowerCase().split(' ')[0])
      );

      const fallbackResponse: ChatMessage = matched
        ? {
            id: 'ai-' + Date.now(),
            sender: 'ai',
            text: matched.answerEn,
            hindiText: matched.answerHi,
            timestamp: 'Just now',
            sources: matched.sources,
            suggestedFollowUps: matched.followUps
          }
        : {
            id: 'ai-' + Date.now(),
            sender: 'ai',
            text: matchedSite
              ? `${matchedSite.name} in ${matchedSite.city}, ${matchedSite.state} is a prominent heritage site. Grounded in ASI dossiers, it represents important cultural and architectural history.`
              : `Regarding "${query}": India's 20 major heritage monuments feature architectural synthesis and rich historical significance documented in ASI dossiers.`,
            hindiText: matchedSite
              ? `${matchedSite.name} (${matchedSite.city}, ${matchedSite.state}) भारतीय पुरातत्व सर्वेक्षण रिकॉर्ड में शामिल एक प्रमुख ऐतिहासिक धरोहर है।`
              : `"${query}" के संबंध में: भारत के 20 प्रमुख ऐतिहासिक स्मारक अद्भुत स्थापत्य और सांस्कृतिक धरोहर का प्रतिनिधित्व करते हैं।`,
            timestamp: 'Just now'
          };

      setMessages((prev) => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
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
          <span>RAG-Grounded Multilingual Intelligence • 20 Sites</span>
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
        
        {/* Chat Header Bar with Site Selector */}
        <div className="bg-[#0D3B2E] text-white px-3.5 sm:px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <Bot className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold truncate">DhoroharDhirsti AI Assistant</h3>
              <p className="text-[10px] text-white/70 flex items-center space-x-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="truncate">Active • Connected to ASI 20 Sites Base</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium border border-white/20 rounded-lg px-2 py-1 outline-none cursor-pointer max-w-[160px] sm:max-w-[220px] truncate"
              title="Select Heritage Site"
            >
              <option value="all" className="bg-[#0D3B2E] text-white">All 20 Sites (Auto-Detect)</option>
              {backendSites.map((site) => (
                <option key={site.site_id} value={site.site_id} className="bg-[#0D3B2E] text-white">
                  {site.name} ({site.site_id})
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setMessages([messages[0]]);
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
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
