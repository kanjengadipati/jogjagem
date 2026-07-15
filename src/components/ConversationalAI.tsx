import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Brain, Bot, User, RefreshCw, Compass, ArrowRight, CornerDownRight } from 'lucide-react';
import { Destination } from '../types';
import DestinationCard from './DestinationCard';
import { ai, destinations as destinationApi } from '../lib/api';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  matchedDestinations?: Destination[];
}

interface ConversationalAIProps {
  initialQuery?: string;
  initialImageResult?: {
    imageUrl: string;
    reply: string;
    matchedDestinationIds: string[];
  } | null;
  onClearImageResult?: () => void;
  onExploreDestination: (dest: Destination) => void;
  onToggleSave: (dest: Destination) => void;
  isSaved: (id: string) => boolean;
}

const QUICK_PROMPTS = [
  { text: "Where can I watch the best sunset near the ocean?", label: "Beach Sunset" },
  { text: "Show me a vertical hidden cave with a heavenly light column", label: "Hidden Gems" },
  { text: "Where should I eat legendary local Gudeg or traditional volcano coffee?", label: "Culinary & Coffee" },
  { text: "Suggest a thrilling volcano adventure with mountain views", label: "Volcano Jeep Tour" },
  { text: "Where should I take my family for royal culture and swimming pools?", label: "Royal Heritage" }
];

const LOADING_PHRASES = [
  "Boiling some hot local wedang uwuh ginger tea while consulting the maps...",
  "Politely asking the ancient Mount Merapi spirits for safe passage tips...",
  "Wandering the subterranean mosque of Taman Sari to retrieve local legends...",
  "Consulting the royal Javanese scrolls for Yogyakarta's finest secrets...",
  "Checking with a local becak trishaw driver for today's golden sunset spots..."
];

export default function ConversationalAI({ 
  initialQuery = '', 
  initialImageResult,
  onClearImageResult,
  onExploreDestination,
  onToggleSave,
  isSaved 
}: ConversationalAIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load welcome message or initial query
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg: Message = {
        id: 'welcome',
        role: 'model',
        text: 'Sugeng rawuh! Welcome to Yogyakarta, the land of ancient kings, roaring oceans, and warm hospitality. I am your local guide and advisor. Ask me anything—whether you want a scenic mountain cafe, a romantic seaside sunset, or vertical hidden cave rappelling, I will tell you where to go!'
      };
      setMessages([welcomeMsg]);
    }
  }, []);

  // Handle passed-down query from Home search bar
  useEffect(() => {
    if (initialQuery && messages.length <= 1) {
      handleSendQuery(initialQuery);
    }
  }, [initialQuery]);

  // Handle passed-down image scan result from Home search bar
  useEffect(() => {
    if (initialImageResult && messages.length <= 1) {
      const processImageResult = async () => {
        const userMsg: Message = {
          id: 'user-image-' + Math.random().toString(),
          role: 'user',
          text: 'Scanned Image Context',
          imageUrl: initialImageResult.imageUrl
        };

        const matchedDests: Destination[] = [];
        const imageIds = Array.isArray(initialImageResult.matchedDestinationIds)
          ? initialImageResult.matchedDestinationIds
          : [];
        for (const id of imageIds) {
          try {
            const res = await destinationApi.getById(id);
            if (res.status === 'success' && res.data) {
              matchedDests.push(res.data as Destination);
            }
          } catch(e) {
            console.error(`Failed to fetch destination ${id}`, e);
          }
        }

        const aiMsg: Message = {
          id: 'ai-image-' + Math.random().toString(),
          role: 'model',
          text: initialImageResult.reply,
          matchedDestinations: matchedDests
        };

        setMessages(prev => [...prev, userMsg, aiMsg]);
        if (onClearImageResult) {
          onClearImageResult();
        }
      };
      processImageResult();
    }
  }, [initialImageResult]);

  // Loading phrase cycling effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setInterval(() => {
        setLoadingPhraseIdx((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [loading]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendQuery = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setLoadingPhraseIdx(0);

    try {
      // Package previous chat messages for grounding history
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const responseData = await ai.query(textToSend, history);
      
      if (responseData.status === 'success' && responseData.data) {
        const { reply, matchedDestinationIds } = responseData.data;
        const safeIds = Array.isArray(matchedDestinationIds) ? matchedDestinationIds : [];

        // Fetch matched destinations from API
        const matchedDests: Destination[] = [];
        for (const id of safeIds) {
          try {
            const res = await destinationApi.getById(id);
            if (res.status === 'success' && res.data) {
              matchedDests.push(res.data as Destination);
            }
          } catch(e) {
            console.error(`Failed to fetch destination ${id}`, e);
          }
        }

        const aiMsg: Message = {
          id: Math.random().toString(),
          role: 'model',
          text: reply,
          matchedDestinations: matchedDests
        };

        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(responseData.message || 'API failed to respond');
      }

    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: Math.random().toString(),
        role: 'model',
        text: 'Matur nuwun for your patience. I had a slight interruption crossing the volcanic lines, but I can suggest exploring Malioboro or Prambanan today. Let me know if you would like me to refresh!'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div 
      id="conversational-ai-advisor-page" 
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in flex flex-col h-[85vh]"
    >
      {/* Intro Header */}
      <div className="flex items-center space-x-3 border-b border-gold-100 pb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-royal-950 text-gold-300 shadow-md">
          <Brain className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-manrope text-2xl font-bold text-royal-950">AI Local Advisor</h1>
          <p className="text-xs text-royal-700/80 font-light">
            Ask Yogyakarta questions and let your "knowledgeable local friend" suggest authentic places.
          </p>
        </div>
      </div>

      {/* Main chat log */}
      <div 
        id="chat-messages-container" 
        className="flex-1 overflow-y-auto py-6 space-y-6 pr-2"
      >
        {messages.map((msg) => {
          const isAI = msg.role === 'model';
          return (
            <div 
              key={msg.id} 
              className={`flex items-start ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}
            >
              {isAI && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-800 text-gold-100 mr-3 border border-gold-600">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              
              <div className="max-w-[85%] space-y-4">
                {/* Chat message balloon */}
                <div 
                  className={`rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                    isAI 
                      ? 'bg-white border border-gold-100/50 text-royal-950 rounded-tl-none' 
                      : 'bg-gold-800 text-gold-50 rounded-tr-none'
                  }`}
                >
                  {msg.imageUrl && (
                    <div className="mb-2 max-w-xs overflow-hidden rounded-xl border border-gold-600/20 bg-black/10">
                      <img src={msg.imageUrl} alt="Uploaded scene preview" className="w-full h-auto object-cover max-h-48" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  {msg.text === 'Scanned Image Context' ? (
                    <span className="italic text-xs text-gold-200/90 font-mono">Searched by this image</span>
                  ) : (
                    msg.text
                  )}
                </div>

                {/* Grounded interactive destination cards returned by Gemini */}
                {isAI && msg.matchedDestinations && msg.matchedDestinations.length > 0 && (
                  <div className="space-y-3 pl-2">
                    <div className="flex items-center space-x-1.5 text-gold-700">
                      <CornerDownRight className="h-4 w-4" />
                      <span className="font-mono text-[10px] uppercase tracking-wider font-bold">Suggested Itinerary Matches</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {msg.matchedDestinations.map((dest) => (
                        <div key={dest.id} className="transform scale-95 origin-top-left hover:scale-100 transition-transform duration-300">
                          <DestinationCard
                            destination={dest}
                            onExplore={onExploreDestination}
                            onToggleSave={onToggleSave}
                            isSaved={isSaved(dest.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!isAI && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-200 text-gold-800 ml-3 border border-gold-300">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex items-start justify-start animate-pulse">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-800 text-gold-100 mr-3 border border-gold-600">
              <RefreshCw className="h-4 w-4 animate-spin text-gold-300" />
            </div>
            <div className="max-w-[80%] rounded-2xl p-4 bg-gold-50 border border-gold-200 text-royal-950 rounded-tl-none text-xs flex items-center space-x-2">
              <span className="font-mono font-medium text-gold-800">{LOADING_PHRASES[loadingPhraseIdx]}</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested chips list */}
      {messages.length <= 1 && !loading && (
        <div id="suggested-chips-container" className="py-3 border-t border-gold-50">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-royal-700/60 font-bold mb-2">Suggested Inquiries</span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(qp.text)}
                className="rounded-full bg-gold-50 hover:bg-gold-100 text-[11px] px-3.5 py-1.5 border border-gold-100/60 text-royal-950 font-medium transition-colors"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input container */}
      <div className="border-t border-gold-100 pt-4 bg-white">
        <form onSubmit={(e) => { e.preventDefault(); handleSendQuery(input); }} className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask your local advisor friend (e.g. 'romantic dinner with sunset' or 'hidden Javanese pools')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full rounded-full border border-gold-200 bg-gold-50/20 py-4 pl-6 pr-16 text-sm text-royal-950 placeholder-royal-700/50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-gold-800 text-gold-100 hover:bg-gold-700 active:scale-95 disabled:bg-gold-50/50 disabled:text-royal-700/30 transition-all cursor-pointer"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
