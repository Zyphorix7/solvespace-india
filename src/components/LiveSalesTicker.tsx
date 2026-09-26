import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface SaleNotification {
  name: string;
  city: string;
  item: string;
  timeAgo: string;
  image: string;
}

const RECENT_SALES: SaleNotification[] = [
  {
    name: 'Rohan V.',
    city: 'Indiranagar, Bengaluru',
    item: 'Wireless Electric Mini Food Chopper (250ml)',
    timeAgo: '4m ago',
    image: '/products/Screenshot_20260901_134903_Meesho.jpg',
  },
  {
    name: 'Pooja S.',
    city: 'Bandra West, Mumbai',
    item: 'Wireless Electric Mini Food Chopper (250ml)',
    timeAgo: '11m ago',
    image: '/products/chopper-blades-precision.jpg',
  },
  {
    name: 'Aditya M.',
    city: 'Cyber City, Gurugram',
    item: 'Wireless Electric Mini Food Chopper (250ml)',
    timeAgo: '19m ago',
    image: '/products/chopper-cordless-motor.jpg',
  },
  {
    name: 'Kavita R.',
    city: 'Jubilee Hills, Hyderabad',
    item: 'Wireless Electric Mini Food Chopper (250ml)',
    timeAgo: '28m ago',
    image: '/products/chopper-washable-cleaning.jpg',
  },
];

export const LiveSalesTicker: React.FC = () => {
  const { cartDrawerOpen, checkoutModalOpen, adminOpen } = useStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed || cartDrawerOpen || checkoutModalOpen || adminOpen) {
      setVisible(false);
      return;
    }

    // Initial show after 6 seconds
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 6000);

    // Interval to cycle
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % RECENT_SALES.length);
        setVisible(true);
      }, 1000);
    }, 24000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dismissed, cartDrawerOpen, checkoutModalOpen, adminOpen]);

  if (dismissed || !visible || cartDrawerOpen || checkoutModalOpen || adminOpen) return null;

  const current = RECENT_SALES[currentIdx];

  return (
    <div className="fixed bottom-20 left-4 z-40 max-w-xs sm:max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-3 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
      <img
        src={current.image}
        alt={current.item}
        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
      />
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Recently Purchased • {current.timeAgo}</span>
        </div>
        <p className="text-xs font-bold text-slate-900 truncate">{current.item}</p>
        <p className="text-[11px] text-slate-500 truncate">
          {current.name} in <span className="font-semibold text-slate-700">{current.city}</span>
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
