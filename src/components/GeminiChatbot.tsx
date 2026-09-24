import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  User,
  Loader2,
  ShoppingBag,
  Eye,
  RefreshCw,
  Compass,
  Zap,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { sendChatMessageToApi, ChatMessage } from '../services/gemini';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

type AIMode = 'all' | 'architect' | 'power' | 'pincode';

export const GeminiChatbot: React.FC = () => {
  const { products, setSelectedProduct, addToCart, setCartDrawerOpen, formatCurrency, showToast } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<AIMode>('all');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Namaste! Welcome to **SS AI Studio** — powered by Gemini 3.8 intelligence.\n\nI am your dedicated workspace architect and ergonomic hardware consultant for SolveSpace India. How can I engineer your workspace today?',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Global event listener to open SS AI from anywhere in the app
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-ss-ai', handleOpen);
    return () => window.removeEventListener('open-ss-ai', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          'Conversation reset. I am ready to evaluate your desk ergonomics, GaN charging architecture, or Pan-India delivery timelines. What are you looking to optimize?',
      },
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    const newMessages: ChatMessage[] = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendChatMessageToApi(newMessages, {
        activeMode,
        catalog: products.map((p) => ({
          id: p.id,
          title: p.title,
          subtitle: p.subtitle,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          category: p.category,
          rating: p.rating,
          features: p.features,
          tags: p.tags,
          inventory: p.inventory,
        })),
      });

      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.warn('SS AI chat notice:', err);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content:
            'SolveSpace India offers 24-48hr express delivery across 28,000+ Indian pincodes, verified Cash on Delivery, and 5-Day doorstep product replacement! How can I assist your workspace setup today?',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Extract products mentioned in assistant message for interactive cards
  const extractRecommendedProducts = (text: string): { cleanText: string; recommended: Product[] } => {
    const recommended: Product[] = [];

    // 1. Look for explicit [RECOMMEND: ...] tags
    const recRegex = /\[RECOMMEND:\s*([^\]]+)\]/gi;
    let match;
    while ((match = recRegex.exec(text)) !== null) {
      const query = match[1].trim().toLowerCase();
      const found = products.find(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          query.includes(p.title.toLowerCase()) ||
          p.id.toLowerCase() === query
      );
      if (found && !recommended.some((r) => r.id === found.id)) {
        recommended.push(found);
      }
    }

    // 2. If no explicit tags, search for exact product title mentions
    if (recommended.length === 0) {
      for (const p of products) {
        if (
          text.toLowerCase().includes(p.title.toLowerCase()) &&
          !recommended.some((r) => r.id === p.id)
        ) {
          recommended.push(p);
        }
      }
    }

    const cleanText = text.replace(/\[RECOMMEND:\s*[^\]]+\]/gi, '').trim();
    return { cleanText, recommended: recommended.slice(0, 3) };
  };

  const handleQuickAdd = (product: Product) => {
    addToCart(product, product.variants?.[0], 1);
    setAddedProductId(product.id);
    showToast(`Added ${product.title} to cart!`, 'success');
    setTimeout(() => setAddedProductId(null), 2000);
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  // Smart prompt chips based on active mode
  const modeChips = {
    all: [
      '📐 Build my dual-monitor workspace setup',
      '⚡ 100W GaN vs 65W charger for MacBook',
      '👁️ How does Lumina ScreenBar protect eyes?',
      '📍 Check delivery date for Bangalore 560001',
      '🛡️ How does the 5-day exchange policy work?',
    ],
    architect: [
      '📐 Ergonomic height for 15-inch laptop',
      '🗂️ Best cable organizers for clean setup',
      '🪑 Posture tips for long software dev hours',
    ],
    power: [
      '⚡ Can SwiftVolt charge MacBook Pro 16" and phone simultaneously?',
      '🔋 Is 100W GaN safe with Indian voltage spikes?',
      '🔌 Comparison between GaN III vs standard silicon bricks',
    ],
    pincode: [
      '📍 Express courier speed to Mumbai 400001',
      '📍 Does COD work for Tier-2 cities in India?',
      '📍 How are shipping dates calculated automatically?',
    ],
  };

  return (
    <>
      {/* Ultra-Premium Floating Action Launcher */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-4 py-3 bg-[#0A101D]/90 hover:bg-[#0F172A] backdrop-blur-xl border border-slate-700/70 hover:border-[#FF5A36]/60 rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.5),0_0_24px_rgba(255,90,54,0.18)] transition-all duration-300 active:scale-95 cursor-pointer"
            aria-label="Open SS AI Studio"
          >
            {/* Shimmer gradient halo */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF5A36]/40 via-amber-500/20 to-orange-500/40 rounded-full blur-xs opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF5A36] to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                    SS AI
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#FF5A36]/20 text-[#FF5A36] border border-[#FF5A36]/30">
                    Studio
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Gemini 3.8 Intelligence</span>
                </div>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Slide-Up Obsidian Glass Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[440px] md:w-[460px] h-[620px] max-h-[88vh] bg-[#0A101D]/95 backdrop-blur-2xl rounded-[28px] shadow-[0_25px_65px_-10px_rgba(0,0,0,0.8),0_0_35px_rgba(255,90,54,0.15)] border border-slate-700/60 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header Bar */}
          <div className="p-4 bg-gradient-to-r from-[#0C1322] via-[#101A2E] to-[#0C1322] border-b border-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5A36] via-[#FF7555] to-amber-400 p-[1.5px] shadow-lg shadow-orange-500/25">
                  <div className="w-full h-full bg-[#0A101D] rounded-[14px] flex items-center justify-center text-[#FF5A36]">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0A101D]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold tracking-wide text-white">SS AI Studio</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Gemini 3.8
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Workspace Architecture & Hardware Consultant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReset}
                title="Reset Conversation"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                aria-label="Reset Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Navigation Pills */}
          <div className="px-3.5 py-2 bg-[#080D17] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveMode('all')}
              className={`shrink-0 flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeMode === 'all'
                  ? 'bg-[#FF5A36] text-white shadow-xs shadow-orange-500/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>All Studio</span>
            </button>
            <button
              onClick={() => setActiveMode('architect')}
              className={`shrink-0 flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeMode === 'architect'
                  ? 'bg-[#FF5A36] text-white shadow-xs shadow-orange-500/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Desk Architect</span>
            </button>
            <button
              onClick={() => setActiveMode('power')}
              className={`shrink-0 flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeMode === 'power'
                  ? 'bg-[#FF5A36] text-white shadow-xs shadow-orange-500/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Power & GaN</span>
            </button>
            <button
              onClick={() => setActiveMode('pincode')}
              className={`shrink-0 flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeMode === 'pincode'
                  ? 'bg-[#FF5A36] text-white shadow-xs shadow-orange-500/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>Pincode ETA</span>
            </button>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0A101D] to-[#070B14] text-xs">
            {messages.map((m, idx) => {
              const { cleanText, recommended } =
                m.role === 'assistant'
                  ? extractRecommendedProducts(m.content)
                  : { cleanText: m.content, recommended: [] };

              return (
                <div
                  key={idx}
                  className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`flex gap-2.5 max-w-[92%] ${
                      m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#FF5A36] to-amber-500 text-white flex items-center justify-center shrink-0 text-[10px] font-black shadow-md shadow-orange-500/20">
                        SS
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl leading-relaxed text-[12.5px] ${
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-[#FF5A36] to-[#E04826] text-white rounded-tr-xs shadow-md shadow-orange-500/20 font-medium'
                          : 'bg-[#121B2B]/90 border border-slate-800 text-slate-100 rounded-tl-xs shadow-lg'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{cleanText}</div>
                    </div>
                    {m.role === 'user' && (
                      <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Interactive Recommended Product Action Cards */}
                  {recommended.length > 0 && (
                    <div className="w-full pl-9 pr-2 space-y-2 mt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#FF5A36] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Recommended Workspace Gear</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {recommended.map((product) => (
                          <div
                            key={product.id}
                            className="p-2.5 bg-[#0F1726]/95 border border-slate-700/80 rounded-2xl flex items-center gap-3 hover:border-[#FF5A36]/60 transition-all shadow-md group"
                          >
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-13 h-13 object-cover rounded-xl border border-slate-700/60 bg-slate-800 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span className="text-[#FF5A36] font-bold">{product.category}</span>
                                <span>•</span>
                                <span className="flex items-center text-amber-400 font-bold">
                                  ★ {product.rating}
                                </span>
                              </div>
                              <h5 className="text-[12px] font-bold text-white truncate leading-tight mt-0.5">
                                {product.title}
                              </h5>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-black text-white">
                                  {formatCurrency(product.price)}
                                </span>
                                {Boolean(product.compareAtPrice && product.compareAtPrice > product.price) && (
                                  <span className="text-[10px] text-slate-500 line-through">
                                    {formatCurrency(product.compareAtPrice!)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5 shrink-0">
                              <button
                                onClick={() => handleQuickView(product)}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Details</span>
                              </button>
                              <button
                                onClick={() => handleQuickAdd(product)}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#FF5A36] hover:bg-[#E04826] text-white flex items-center gap-1 transition-colors cursor-pointer shadow-xs shadow-orange-500/20"
                              >
                                {addedProductId === product.id ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                    <span>Added!</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="w-3 h-3" />
                                    <span>+ Cart</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2.5 text-slate-400 text-xs pl-9 py-2">
                <div className="w-4 h-4 rounded-full border-2 border-[#FF5A36] border-t-transparent animate-spin" />
                <span className="text-slate-300 font-medium animate-pulse">
                  SS AI is evaluating ergonomics & hardware...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Intelligent Prompt Chips */}
          <div className="px-3.5 py-2 bg-[#080D17] border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {modeChips[activeMode].map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSend(chip)}
                className="shrink-0 text-[11px] font-medium bg-[#131D2E] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Console */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#0A101D] border-t border-slate-800 flex items-center gap-2"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={
                  activeMode === 'architect'
                    ? 'Describe your desk setup, monitor size, or posture needs...'
                    : activeMode === 'power'
                    ? 'Ask about wattage, laptop charging, or surge protection...'
                    : activeMode === 'pincode'
                    ? 'Enter 6-digit Indian pincode (e.g. 560001, 110001)...'
                    : 'Ask SS AI about ergonomics, GaN power, pincodes...'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-[#131D2E] border border-slate-700/70 rounded-xl text-white placeholder-slate-400 focus:bg-[#162236] focus:border-[#FF5A36] focus:outline-hidden transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#FF5A36] to-[#E04826] text-white flex items-center justify-center hover:opacity-95 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-orange-500/20 shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
