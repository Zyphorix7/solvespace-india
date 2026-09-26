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

type AIMode = 'all' | 'chopper' | 'specs' | 'pincode';

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
        'Namaste! Welcome to **SS AI Assistant** — powered by Gemini 3.8.\n\nI am your dedicated product consultant for SolveSpace India. I can answer questions about our **Wireless Electric Mini Food Chopper**, 304 stainless steel blades, cordless USB charging, 10-second mincing speeds, or Pan-India delivery timelines. How can I assist you today?',
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
          'Conversation reset. Ask me anything about our Wireless Electric Mini Chopper, 304 blades, USB-C battery specs, or delivery estimates for your pincode!',
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
  const modeChips: Record<AIMode, string[]> = {
    all: [
      '🔪 How many seconds to mince garlic, onions & ginger?',
      '⚡ How many chopping cycles per USB charge?',
      '💧 Is the bowl and blade dishwasher safe / easy to wash?',
      '📍 Check delivery date for Bangalore 560001',
      '🛡️ How does the 5-day doorstep exchange work?',
    ],
    chopper: [
      '🥣 What can I chop in the 250ml bowl capacity?',
      '🥗 Can it puree baby food and make salad dressings?',
      '🧄 Best method to chop whole garlic cloves evenly',
    ],
    specs: [
      '⚡ How fast does it recharge with USB-C?',
      '🔋 Battery capacity and motor torque specifications',
      '🔒 How does the magnetic safety child lock work?',
    ],
    pincode: [
      '📍 Express courier speed to Mumbai 400001',
      '📍 Does COD work for Tier-2 cities in India?',
      '📍 How are shipping dates calculated automatically?',
    ],
  };

  return (
    <>
      {/* Ultra-Premium Glassmorphism Floating Action Launcher */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-4 py-3 bg-slate-900/65 hover:bg-slate-900/80 backdrop-blur-2xl backdrop-saturate-200 border border-white/20 hover:border-white/35 rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.3),0_0_25px_rgba(255,90,54,0.25)] transition-all duration-300 active:scale-95 cursor-pointer"
            aria-label="Open SS AI Studio"
          >
            {/* Shimmer gradient halo with glass reflection */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF5A36]/40 via-amber-500/25 to-orange-500/40 rounded-full blur-xs opacity-60 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF5A36] to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30 border border-white/30">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide drop-shadow-xs">
                    SS AI
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-md">
                    Studio
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-300/90 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                  <span>Gemini 3.8 Intelligence</span>
                </div>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Slide-Up Glassmorphism Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[440px] md:w-[460px] h-[620px] max-h-[88vh] bg-slate-950/70 backdrop-blur-3xl backdrop-saturate-200 rounded-[28px] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-1px_1px_rgba(0,0,0,0.5),0_0_35px_rgba(255,90,54,0.18)] border border-white/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Ambient Lighting Orbs behind Frosted Glass */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-[#FF5A36]/25 to-amber-500/20 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute top-1/3 -left-20 w-48 h-48 bg-gradient-to-tr from-blue-600/15 to-indigo-500/15 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 w-48 h-48 bg-gradient-to-tl from-emerald-500/10 to-teal-500/15 rounded-full blur-2xl" />

          {/* Frosted Glass Header */}
          <div className="p-4 bg-white/[0.04] backdrop-blur-xl border-b border-white/10 text-white flex items-center justify-between relative z-10 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5A36] via-[#FF7555] to-amber-400 p-[1.5px] shadow-[0_0_16px_rgba(255,90,54,0.35)]">
                  <div className="w-full h-full bg-slate-950/80 backdrop-blur-md rounded-[14px] flex items-center justify-center text-[#FF5A36] border border-white/10">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-[0_0_6px_#34d399]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold tracking-wide text-white drop-shadow-xs">SS AI Studio</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/15 backdrop-blur-md shadow-xs">
                    Gemini 3.8
                  </span>
                </div>
                <p className="text-[10px] text-slate-300/80 font-medium">
                  Product Expert & Smart Tech Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReset}
                title="Reset Conversation"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-xs"
                aria-label="Reset Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-xs"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Navigation Frosted Pills */}
          <div className="px-3.5 py-2.5 bg-white/[0.02] backdrop-blur-xl border-b border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar relative z-10">
            <button
              onClick={() => setActiveMode('all')}
              className={`shrink-0 flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeMode === 'all'
                  ? 'bg-gradient-to-r from-[#FF5A36]/90 to-amber-500/90 text-white shadow-[0_0_16px_rgba(255,90,54,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30 backdrop-blur-md'
                  : 'bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10 backdrop-blur-md shadow-xs'
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>All Questions</span>
            </button>
            <button
              onClick={() => setActiveMode('chopper')}
              className={`shrink-0 flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeMode === 'chopper'
                  ? 'bg-gradient-to-r from-[#FF5A36]/90 to-amber-500/90 text-white shadow-[0_0_16px_rgba(255,90,54,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30 backdrop-blur-md'
                  : 'bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10 backdrop-blur-md shadow-xs'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Chopper & Blades</span>
            </button>
            <button
              onClick={() => setActiveMode('specs')}
              className={`shrink-0 flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeMode === 'specs'
                  ? 'bg-gradient-to-r from-[#FF5A36]/90 to-amber-500/90 text-white shadow-[0_0_16px_rgba(255,90,54,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30 backdrop-blur-md'
                  : 'bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10 backdrop-blur-md shadow-xs'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Specs & USB-C</span>
            </button>
            <button
              onClick={() => setActiveMode('pincode')}
              className={`shrink-0 flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeMode === 'pincode'
                  ? 'bg-gradient-to-r from-[#FF5A36]/90 to-amber-500/90 text-white shadow-[0_0_16px_rgba(255,90,54,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30 backdrop-blur-md'
                  : 'bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10 backdrop-blur-md shadow-xs'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>Pincode ETA</span>
            </button>
          </div>

          {/* Messages Thread with Glassmorphism Bubbles */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent text-xs relative z-10">
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
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#FF5A36] to-amber-500 text-white flex items-center justify-center shrink-0 text-[10px] font-black shadow-[0_0_12px_rgba(255,90,54,0.4)] border border-white/30">
                        SS
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl leading-relaxed text-[12.5px] ${
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-[#FF5A36]/85 to-[#E04826]/85 backdrop-blur-xl border border-white/30 text-white rounded-tr-xs shadow-[0_8px_20px_rgba(255,90,54,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)] font-medium'
                          : 'bg-white/[0.07] hover:bg-white/[0.1] backdrop-blur-2xl border border-white/15 text-slate-100 rounded-tl-xs shadow-[0_8px_25px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.18)] transition-colors'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{cleanText}</div>
                    </div>
                    {m.role === 'user' && (
                      <div className="w-7 h-7 rounded-xl bg-white/10 backdrop-blur-md text-slate-200 flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Interactive Recommended Product Frosted Glass Cards */}
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
                            className="p-2.5 bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-xl border border-white/15 hover:border-[#FF5A36]/60 rounded-2xl flex items-center gap-3 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)] group"
                          >
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-13 h-13 object-cover rounded-xl border border-white/15 bg-slate-800 shrink-0 shadow-xs"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
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
                                  <span className="text-[10px] text-slate-400 line-through">
                                    {formatCurrency(product.compareAtPrice!)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5 shrink-0">
                              <button
                                onClick={() => handleQuickView(product)}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/[0.08] hover:bg-white/[0.16] text-slate-200 border border-white/15 backdrop-blur-md flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Details</span>
                              </button>
                              <button
                                onClick={() => handleQuickAdd(product)}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gradient-to-r from-[#FF5A36] to-[#E04826] hover:brightness-110 text-white border border-white/30 flex items-center gap-1 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,90,54,0.35)]"
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
              <div className="flex items-center gap-2.5 text-slate-300 text-xs pl-9 py-2">
                <div className="w-4 h-4 rounded-full border-2 border-[#FF5A36] border-t-transparent animate-spin" />
                <span className="text-slate-200 font-medium animate-pulse drop-shadow-xs">
                  SS AI is consulting product specifications & shipping...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Intelligent Frosted Prompt Chips */}
          <div className="px-3.5 py-2.5 bg-white/[0.02] backdrop-blur-xl border-t border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar relative z-10">
            {modeChips[activeMode].map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSend(chip)}
                className="shrink-0 text-[11px] font-medium bg-white/[0.06] hover:bg-white/[0.14] text-slate-200 hover:text-white border border-white/15 backdrop-blur-md px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Frosted Input Console */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white/[0.04] backdrop-blur-2xl border-t border-white/15 flex items-center gap-2 relative z-10"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={
                  activeMode === 'chopper'
                    ? 'Ask about 304 blades, 10-second mincing, garlic or purees...'
                    : activeMode === 'specs'
                    ? 'Ask about USB-C charging, 30W motor, battery life...'
                    : activeMode === 'pincode'
                    ? 'Enter 6-digit Indian pincode (e.g. 560001, 110001)...'
                    : 'Ask SS AI about chopper features, delivery, or exchanges...'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-white/[0.07] focus:bg-white/[0.12] backdrop-blur-xl border border-white/20 focus:border-[#FF5A36] rounded-xl text-white placeholder-slate-400 focus:outline-hidden transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#FF5A36] to-[#E04826] text-white border border-white/30 flex items-center justify-center hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,90,54,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)] shrink-0"
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
