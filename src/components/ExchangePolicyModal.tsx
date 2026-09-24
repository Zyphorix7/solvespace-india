import React from 'react';
import { X, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Truck, HelpCircle } from 'lucide-react';

interface ExchangePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTrackOrder?: () => void;
}

export const ExchangePolicyModal: React.FC<ExchangePolicyModalProps> = ({
  isOpen,
  onClose,
  onOpenTrackOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B2545] flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold text-[#F58220] uppercase tracking-wider block">
                Official Store Policy
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                5-Day Product Exchange & Replacement Policy
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label="Close exchange policy modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Policy Banner */}
        <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <div className="font-extrabold text-sm">Product Exchange Accepted Only</div>
            <p className="leading-relaxed">
              We stand behind the quality of every product. In the event of size mismatches, transit damage, or defects, we provide <strong>100% free doorstep product exchange and replacement</strong>. Please note: <strong>We accept product exchanges only; monetary returns or cash refunds are not accepted.</strong>
            </p>
          </div>
        </div>

        {/* Eligible Exchange Scenarios */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Eligible Exchange Scenarios (Within 5 Days)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-0.5">1. Size & Fit Mismatch</span>
              Need a different size or variant? We will exchange it for your preferred size.
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-0.5">2. Transit Damage</span>
              If your parcel arrives compromised or damaged, a brand-new unit is dispatched.
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-0.5">3. Technical / Factory Defect</span>
              Any component malfunction is promptly replaced under our exchange guarantee.
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-900 block mb-0.5">4. Wrong Item Received</span>
              If the delivered model or color differs from your order, we swap it immediately.
            </div>
          </div>
        </div>

        {/* 3-Step Seamless Exchange Process */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#0B2545]" />
            <span>How Doorstep Product Exchange Works</span>
          </h4>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="text-slate-900 block">Initiate Exchange Request</strong>
                Open the "Track Order" portal on our store and click "Request Product Exchange", or message support with your Order ID within 5 days of delivery.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="text-slate-900 block">Fast Dispatch of Replacement</strong>
                Once verified, our fulfillment center dispatches your replacement product via express courier.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong className="text-slate-900 block">Hassle-Free Doorstep Handover</strong>
                The courier partner delivers your replacement item and collects the previous item simultaneously. No packing hassles or post-office trips required.
              </div>
            </div>
          </div>
        </div>

        {/* Warranty & Exchange Conditions */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Exchange Conditions</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
            <li>Products must be in their original state with invoice, tags, and box accessories included.</li>
            <li>Exchange requests must be submitted within 5 calendar days from the delivery date.</li>
            <li>Monetary refunds (cash or bank transfers) are not provided under any circumstances; only like-for-like or variant product exchanges are permitted.</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          {onOpenTrackOrder && (
            <button
              onClick={() => {
                onClose();
                onOpenTrackOrder();
              }}
              className="w-full sm:flex-1 min-h-[48px] bg-[#0B2545] hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Request Exchange for Existing Order</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 min-h-[48px] border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
