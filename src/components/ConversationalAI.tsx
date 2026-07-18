import React, { useState, useEffect, useRef } from 'react';
import { Send, Brain, Bot, User, RefreshCw, CornerDownRight, MapPin, ChevronDown, Sparkles, Lock } from 'lucide-react';
import { Destination } from '../types';
import DestinationCard from './DestinationCard';
import { ai, destinations as destinationApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import AuthModal from './AuthModal';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  matchedDestinations?: Destination[];
  timestamp?: string;
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

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function ConversationalAI({
  initialQuery = '',
  initialImageResult,
  onClearImageResult,
  onExploreDestination,
  onToggleSave,
  isSaved,
}: ConversationalAIProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useLocale();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const [freePromptsUsed, setFreePromptsUsed] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem('ai_free_prompts_used') ?? '0', 10);
  });
  const FREE_PROMPT_LIMIT = 5;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const QUICK_PROMPTS = [
    {
      text: "Where can I watch the best sunset near the ocean?",
      label: t('conversational_ai.quick_prompt_beach_sunset_label'),
      subtitle: t('conversational_ai.quick_prompt_beach_sunset_subtitle'),
      emoji: "🌅",
      bg: "bg-orange-50",
      ring: "ring-orange-100",
    },
    {
      text: "Show me a vertical hidden cave with a heavenly light column",
      label: t('conversational_ai.quick_prompt_hidden_gems_label'),
      subtitle: t('conversational_ai.quick_prompt_hidden_gems_subtitle'),
      emoji: "🪨",
      bg: "bg-green-50",
      ring: "ring-green-100",
    },
    {
      text: "Where should I eat legendary local Gudeg or traditional volcano coffee?",
      label: t('conversational_ai.quick_prompt_culinary_label'),
      subtitle: t('conversational_ai.quick_prompt_culinary_subtitle'),
      emoji: "☕",
      bg: "bg-amber-50",
      ring: "ring-amber-100",
    },
    {
      text: "Suggest a thrilling volcano adventure with mountain views",
      label: t('conversational_ai.quick_prompt_volcano_label'),
      subtitle: t('conversational_ai.quick_prompt_volcano_subtitle'),
      emoji: "🚙",
      bg: "bg-blue-50",
      ring: "ring-blue-100",
    },
    {
      text: "Where should I take my family for royal culture and heritage?",
      label: t('conversational_ai.quick_prompt_royal_label'),
      subtitle: t('conversational_ai.quick_prompt_royal_subtitle'),
      emoji: "🏛️",
      bg: "bg-purple-50",
      ring: "ring-purple-100",
    },
  ];

  const LOADING_PHRASES = [
    t('conversational_ai.loading_phrase_1'),
    t('conversational_ai.loading_phrase_2'),
    t('conversational_ai.loading_phrase_3'),
    t('conversational_ai.loading_phrase_4'),
    t('conversational_ai.loading_phrase_5'),
  ];

  // Load welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg: Message = {
        id: 'welcome',
        role: 'model',
        text: t('conversational_ai.welcome_message'),
        timestamp: formatTime(new Date()),
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

  // Handle passed-down image scan result
  useEffect(() => {
    if (initialImageResult && messages.length <= 1) {
      const processImageResult = async () => {
        const userMsg: Message = {
          id: 'user-image-' + Math.random().toString(),
          role: 'user',
          text: t('conversational_ai.image_context'),
          imageUrl: initialImageResult.imageUrl,
          timestamp: formatTime(new Date()),
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
          } catch (e) {
            console.error(`Failed to fetch destination ${id}`, e);
          }
        }

        const aiMsg: Message = {
          id: 'ai-image-' + Math.random().toString(),
          role: 'model',
          text: initialImageResult.reply,
          matchedDestinations: matchedDests,
          timestamp: formatTime(new Date()),
        };

        setMessages((prev) => [...prev, userMsg, aiMsg]);
        if (onClearImageResult) onClearImageResult();
      };
      processImageResult();
    }
  }, [initialImageResult]);

  // Loading phrase cycling
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setInterval(() => {
        setLoadingPhraseIdx((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [loading]);

  // Fire pending query after successful login
  useEffect(() => {
    if (isAuthenticated && pendingQuery) {
      const q = pendingQuery;
      setPendingQuery(null);
      setAuthModalOpen(false);
      handleSendQuery(q);
    }
  }, [isAuthenticated]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendQuery = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    if (!isAuthenticated) {
      // Allow FREE_PROMPT_LIMIT prompts before requiring login
      if (freePromptsUsed >= FREE_PROMPT_LIMIT) {
        setPendingQuery(textToSend);
        setAuthModalOpen(true);
        return;
      }
      // Still within free tier — increment counter and allow
      const next = freePromptsUsed + 1;
      setFreePromptsUsed(next);
      try { localStorage.setItem('ai_free_prompts_used', String(next)); } catch { /* ignore */ }
    }

    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      text: textToSend,
      timestamp: formatTime(new Date()),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setLoadingPhraseIdx(0);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const responseData = await ai.query(textToSend, history);

      if (responseData.status === 'success' && responseData.data) {
        const { reply, matchedDestinationIds } = responseData.data;
        const safeIds = Array.isArray(matchedDestinationIds) ? matchedDestinationIds : [];

        const matchedDests: Destination[] = [];
        for (const id of safeIds) {
          try {
            const res = await destinationApi.getById(id);
            if (res.status === 'success' && res.data) {
              matchedDests.push(res.data as Destination);
            }
          } catch (e) {
            console.error(`Failed to fetch destination ${id}`, e);
          }
        }

        const aiMsg: Message = {
          id: Math.random().toString(),
          role: 'model',
          text: reply,
          matchedDestinations: matchedDests,
          timestamp: formatTime(new Date()),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(responseData.message || 'API failed to respond');
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMsg: Message = {
        id: Math.random().toString(),
        role: 'model',
        text: t('conversational_ai.error_fallback'),
        timestamp: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const showSuggestedInquiries = messages.length <= 1 && !loading;

  return (
    <div
      id="conversational-ai-advisor-page"
      className="flex flex-col h-[85vh] mx-auto max-w-5xl"
      style={{ background: '#F7F3EE' }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-t-3xl px-6 pt-6 pb-8"
        style={{ background: '#F7F3EE' }}
      >
        {/* Prambanan silhouette SVG */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 800 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-0 top-0 h-full w-auto opacity-20"
            preserveAspectRatio="xMaxYMax meet"
          >
            {/* Main central tower */}
            <rect x="365" y="20" width="70" height="160" rx="2" fill="#C4A97E" />
            <polygon points="365,20 400,2 435,20" fill="#C4A97E" />
            <rect x="375" y="40" width="50" height="8" fill="#B8936A" />
            <rect x="378" y="55" width="44" height="8" fill="#B8936A" />
            <rect x="381" y="70" width="38" height="6" fill="#B8936A" />

            {/* Left tower */}
            <rect x="290" y="55" width="52" height="125" rx="2" fill="#C4A97E" />
            <polygon points="290,55 316,38 342,55" fill="#C4A97E" />
            <rect x="298" y="72" width="36" height="6" fill="#B8936A" />
            <rect x="301" y="84" width="30" height="6" fill="#B8936A" />

            {/* Right tower */}
            <rect x="458" y="55" width="52" height="125" rx="2" fill="#C4A97E" />
            <polygon points="458,55 484,38 510,55" fill="#C4A97E" />
            <rect x="466" y="72" width="36" height="6" fill="#B8936A" />
            <rect x="469" y="84" width="30" height="6" fill="#B8936A" />

            {/* Far left small shrine */}
            <rect x="222" y="90" width="38" height="90" rx="2" fill="#C4A97E" />
            <polygon points="222,90 241,76 260,90" fill="#C4A97E" />

            {/* Far right small shrine */}
            <rect x="540" y="90" width="38" height="90" rx="2" fill="#C4A97E" />
            <polygon points="540,90 559,76 578,90" fill="#C4A97E" />

            {/* Ground line */}
            <rect x="0" y="176" width="800" height="4" fill="#C4A97E" opacity="0.4" />
          </svg>

          {/* Decorative sparkle dots */}
          <span className="absolute top-4 right-48 text-gold-400 text-lg">✦</span>
          <span className="absolute top-10 right-64 text-gold-300 text-xs">✦</span>
          <span className="absolute top-16 right-56 text-gold-400/60 text-sm">✦</span>
        </div>

        {/* Left: icon + title */}
        <div className="relative flex items-center gap-4 z-10">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-royal-950 shadow-lg">
            <Brain className="h-7 w-7 text-gold-300" />
            {/* Sparkle top-right */}
            <span className="absolute -top-2 -right-2 text-gold-400 text-sm leading-none">✦</span>
          </div>
          <div>
            <h1 className="font-manrope text-2xl font-extrabold text-royal-950 leading-tight">
              {t('conversational_ai.heading')}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5 max-w-xs">
              {t('conversational_ai.subtitle')}
            </p>
          </div>
        </div>

        {/* Location badge */}
        <div className="relative z-10 mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-stone-200/80 shadow-sm self-start float-right -mt-8">
          <MapPin className="h-3.5 w-3.5 text-gold-600" />
            <span className="text-xs font-semibold text-stone-700">{t('conversational_ai.location_badge')}</span>
        </div>
        <div className="clear-both" />
      </div>

      {/* ── Chat messages ──────────────────────────────────────────── */}
      <div
        id="chat-messages-container"
        className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-none"
      >
        {messages.map((msg) => {
          const isAI = msg.role === 'model';

          if (isAI) {
            // AI bubble — white card
            return (
              <div key={msg.id} className="flex items-start gap-3 animate-fade-in">
                {/* Bot avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-700 shadow border-2 border-gold-500">
                  <Bot className="h-5 w-5 text-gold-100" />
                </div>

                <div className="max-w-[85%] space-y-3">
                  {/* Message card */}
                  <div className="bg-white rounded-2xl rounded-tl-none px-5 py-4 shadow-sm border border-stone-100">
                    {msg.text.split('\n\n').map((para, i) => (
                      <p
                        key={i}
                        className={`text-sm text-royal-950 leading-relaxed ${
                          i === 0 ? 'font-bold text-base' : 'mt-2'
                        }`}
                      >
                        {para}
                      </p>
                    ))}
                    {msg.timestamp && (
                      <p className="mt-3 text-[10px] text-stone-400">{msg.timestamp}</p>
                    )}
                  </div>

                  {/* Matched destination cards */}
                  {msg.matchedDestinations && msg.matchedDestinations.length > 0 && (
                    <div className="space-y-3 pl-1">
                      <div className="flex items-center gap-1.5 text-gold-700">
                        <CornerDownRight className="h-3.5 w-3.5" />
                        <span className="font-mono text-[10px] uppercase tracking-wider font-bold">
                          {t('conversational_ai.suggested_itinerary')}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {msg.matchedDestinations.map((dest) => (
                          <div
                            key={dest.id}
                            className="transform scale-95 origin-top-left hover:scale-100 transition-transform duration-300"
                          >
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
              </div>
            );
          }

          // User bubble — dark pill aligned right
          return (
            <div key={msg.id} className="flex items-end justify-end gap-3 animate-fade-in">
              <div className="max-w-[72%]">
                {msg.imageUrl && (
                  <div className="mb-2 overflow-hidden rounded-2xl border border-gold-600/20 bg-black/10 max-w-xs">
                    <img
                      src={msg.imageUrl}
                      alt="Uploaded scene"
                      className="w-full h-auto object-cover max-h-48"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="bg-royal-950 text-gold-50 rounded-2xl rounded-br-none px-5 py-3.5 text-sm leading-relaxed shadow">
                  {msg.text === t('conversational_ai.image_context') ? (
                    <span className="italic text-xs text-gold-300/80 font-mono">
                      {t('conversational_ai.searched_by_image')}
                    </span>
                  ) : (
                    msg.text
                  )}
                </div>
                {msg.timestamp && (
                  <p className="mt-1 text-right text-[10px] text-stone-400">{msg.timestamp}</p>
                )}
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-200 border border-gold-300">
                <User className="h-4 w-4 text-gold-800" />
              </div>
            </div>
          );
        })}

        {/* Loading bubble */}
        {loading && (
          <div className="flex items-start gap-3 animate-pulse">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-700 border-2 border-gold-500">
              <RefreshCw className="h-4 w-4 animate-spin text-gold-200" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-5 py-4 shadow-sm border border-stone-100 max-w-[75%]">
              <p className="text-xs font-mono text-gold-700">{LOADING_PHRASES[loadingPhraseIdx]}</p>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Suggested Inquiries ────────────────────────────────────── */}
      {showSuggestedInquiries && (
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-gold-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-600 font-mono">
              {t('conversational_ai.suggested_inquiries')}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(qp.text)}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all hover:shadow-md active:scale-[0.97] ${qp.bg} ${qp.ring} ring-1 bg-white`}
              >
                {/* Emoji illustration circle */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl ${qp.bg}`}
                >
                  {qp.emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-royal-950 leading-tight truncate">
                    {qp.label}
                  </p>
                  <p className="text-[10px] text-stone-400 leading-snug mt-0.5 line-clamp-2">
                    {qp.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input bar ─────────────────────────────────────────────── */}
      <div className="px-5 pb-5 pt-2">
        {!isAuthenticated ? (
          /* ── Guest prompt ── */
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full flex items-center gap-3 bg-white rounded-2xl border border-gold-200 shadow-sm px-4 py-3 hover:border-gold-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-1 shrink-0 text-gold-400">
              <Sparkles className="h-5 w-5" />
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
            <div className="h-5 w-px bg-stone-200 shrink-0" />
            <span className="flex-1 text-sm text-stone-400 text-left">
              {t('conversational_ai.guest_placeholder')}
            </span>
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-600 text-white text-xs font-semibold group-hover:bg-gold-500 transition-colors">
              <Lock className="h-3 w-3" />
              {t('conversational_ai.sign_in_chat')}
            </div>
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery(input);
            }}
            className="flex items-center gap-2 bg-white rounded-2xl border border-gold-200 shadow-sm px-4 py-2.5 focus-within:ring-2 focus-within:ring-gold-400/50 focus-within:border-gold-400 transition-all"
          >
            {/* Sparkle + model selector */}
            <div className="flex items-center gap-1 shrink-0 cursor-pointer text-gold-500 hover:text-gold-600 transition-colors">
              <Sparkles className="h-5 w-5" />
              <ChevronDown className="h-3.5 w-3.5" />
            </div>

            {/* Divider */}
            <div className="h-5 w-px bg-stone-200 shrink-0" />

            {/* Text input */}
            <input
              type="text"
              placeholder={t('conversational_ai.guest_placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-royal-950 placeholder-stone-400 focus:outline-none min-w-0 py-1"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-royal-950 text-gold-300 hover:bg-royal-800 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Disclaimer */}
        <p className="mt-2.5 text-center text-[10px] text-stone-400 flex items-center justify-center gap-1">
          <svg
            className="h-3 w-3 text-stone-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          {t('conversational_ai.ai_disclaimer')}
        </p>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="login"
      />
    </div>
  );
}
