import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  CreditCard,
  Banknote,
  ArrowRight,
  Loader2,
  Lock,
  ChevronLeft,
  PartyPopper,
  MapPin,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { verifyIndianPincode } from '../data/pincodes';
import { ShippingAddress, PaymentMethod, PincodeServiceability } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    checkoutModalOpen,
    setCheckoutModalOpen,
    cart,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    paymentSettings,
    placeOrder,
    formatCurrency,
    setExchangePolicyModalOpen,
    setTrackOrderModalOpen,
    showToast,
  } = useStore();

  const { user } = useAuth();

  // Checkout Steps: 1 = Shipping, 2 = Payment, 3 = Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string>('');

  // Shipping Form State
  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: user?.displayName || '',
    phoneNumber: '',
    email: user?.email || '',
    addressLine1: '',
    addressLine2: '',
    pincode: '',
    city: '',
    state: '',
    landmark: '',
  });

  // Instant Pincode Verification State
  const [pincodeStatus, setPincodeStatus] = useState<PincodeServiceability | null>(null);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Dynamic Payment Method Selection
  // Cashfree vs COD strictly conditioned on paymentSettings
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default payment selection based on what's active in paymentSettings
  useEffect(() => {
    if (paymentSettings.cashfreeEnabled) {
      setSelectedPaymentMethod('cashfree');
    } else if (paymentSettings.codEnabled) {
      setSelectedPaymentMethod('cod');
    } else {
      setSelectedPaymentMethod(null);
    }
  }, [paymentSettings]);

  if (!checkoutModalOpen) return null;

  // Instantaneous Indian Pincode Verification Handler
  const handlePincodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 6);
    setShipping((prev) => ({ ...prev, pincode: rawVal }));

    // Reset feedback while typing
    if (rawVal.length < 6) {
      setPincodeStatus(null);
      setPinError(null);
      return;
    }

    // Instant check triggered on 6th digit
    if (rawVal.length === 6) {
      setIsVerifyingPin(true);
      setPinError(null);

      setTimeout(() => {
        const result = verifyIndianPincode(rawVal);
        setIsVerifyingPin(false);
        setPincodeStatus(result);

        if (result.serviceable) {
          // Allow customer to write City / District on their own
          setPinError(null);
        } else {
          setPinError(result.message || 'Pincode not serviceable for express delivery.');
        }
      }, 120);
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!shipping.fullName || !shipping.phoneNumber || !shipping.addressLine1 || !shipping.city.trim() || !shipping.state.trim()) {
      showToast('Please fill in all mandatory shipping address fields including City/District and State.', 'error');
      return;
    }

    if (!pincodeStatus?.serviceable) {
      showToast('Please enter a valid, serviceable 6-digit Indian pincode to continue.', 'error');
      return;
    }

    setStep(2);
  };

  const handleCompleteOrder = async () => {
    if (!selectedPaymentMethod) {
      showToast('Please select a payment method.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        productTitle: item.product.title,
        variantName: item.variant?.name,
        quantity: item.quantity,
        price: item.selectedPrice,
        image: item.variant?.image || item.product.images[0] || '',
      }));

      const orderNumber = await placeOrder({
        customer: shipping,
        items: orderItems,
        subtotal,
        discount: discountAmount,
        shippingFee,
        totalAmount: grandTotal,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: selectedPaymentMethod === 'cashfree' ? 'paid' : 'cod_pending',
        orderStatus: 'processing',
        estimatedDeliveryDate: pincodeStatus?.estimatedDeliveryDate,
        userId: user?.uid,
      });

      setConfirmedOrderNumber(orderNumber);
      setStep(3);
    } catch (err: any) {
      console.error('Order creation error:', err);
      showToast('There was an error processing your order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (step !== 3) setCheckoutModalOpen(false);
        }}
      />

      <div className="min-h-full flex items-center justify-center p-0 sm:p-4 text-center">
        {/* Checkout Modal Window */}
        <div className="w-full max-w-2xl bg-white sm:rounded-3xl shadow-2xl text-left overflow-hidden relative z-10 my-0 sm:my-8 animate-in fade-in-50 zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {step === 1 && '1. Shipping & Address Details'}
                  {step === 2 && '2. Payment Selection'}
                  {step === 3 && 'Order Confirmed!'}
                </h2>
                <p className="text-xs text-slate-500">
                  {step === 1 && 'Instant 6-digit Indian PIN code validation'}
                  {step === 2 && '100% Encrypted & Safe Transaction'}
                  {step === 3 && 'Your SolveSpace order has been placed'}
                </p>
              </div>
            </div>

            {step !== 3 && (
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="flex items-center justify-center w-12 h-12 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95"
                aria-label="Close checkout"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* STEP 1: Shipping Address & Instant Indian Pincode Validation */}
          {step === 1 && (
            <form onSubmit={handleProceedToPayment} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0B2545] focus:outline-hidden"
                  />
                </div>

                {/* Phone Number (numeric inputmode) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Phone (+91) *
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                    value={shipping.phoneNumber}
                    onChange={(e) =>
                      setShipping({ ...shipping, phoneNumber: e.target.value.replace(/\D/g, '') })
                    }
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0B2545] focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address (for order tracking & invoice) *
                </label>
                <input
                  type="email"
                  required
                  value={shipping.email}
                  onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0B2545] focus:outline-hidden"
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Flat, House no., Building, Company, Apartment *
                </label>
                <input
                  type="text"
                  required
                  value={shipping.addressLine1}
                  onChange={(e) => setShipping({ ...shipping, addressLine1: e.target.value })}
                  placeholder="e.g. Flat 402, Lotus Tower, 12th Main"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0B2545] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Area, Colony, Sector, Village, Landmark
                </label>
                <input
                  type="text"
                  value={shipping.addressLine2}
                  onChange={(e) => setShipping({ ...shipping, addressLine2: e.target.value })}
                  placeholder="Near Metro Station or Landmark"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0B2545] focus:outline-hidden"
                />
              </div>

              {/* PINCODE & CITY/STATE ROW WITH INSTANTANEOUS VERIFICATION */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#F58220]" />
                    <span>Indian Postal Pincode (6-Digit) *</span>
                  </label>
                  {isVerifyingPin && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B2545]" />
                      <span>Checking serviceability...</span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={shipping.pincode}
                    onChange={handlePincodeInput}
                    placeholder="Type 6 digits (e.g. 110001, 400001, 560001)"
                    className={`w-full px-3.5 py-2.5 text-sm font-mono tracking-widest bg-white border rounded-xl focus:outline-hidden ${
                      pincodeStatus?.serviceable
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : pinError
                        ? 'border-rose-500 ring-2 ring-rose-500/20'
                        : 'border-slate-300 focus:border-[#0B2545]'
                    }`}
                  />
                  {pincodeStatus?.serviceable && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 absolute right-3 top-2.5" />
                  )}
                  {pinError && (
                    <AlertCircle className="w-5 h-5 text-rose-500 absolute right-3 top-2.5" />
                  )}
                </div>

                {/* Instantaneous Feedback Badge */}
                {pincodeStatus?.serviceable && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">
                        Delivery is available at pincode {shipping.pincode}
                      </span>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        ⚡ Guaranteed Delivery by: <strong>{pincodeStatus.estimatedDeliveryDate || pincodeStatus.deliveryDays}</strong> • COD Supported
                      </p>
                    </div>
                  </div>
                )}

                {pinError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                {/* Customer enters their own City / District and State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      City / District *
                    </label>
                    <input
                      type="text"
                      required
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      placeholder="Enter City / District"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:border-[#0B2545] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      State / Union Territory *
                    </label>
                    <input
                      type="text"
                      required
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                      placeholder="Enter State / UT"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:border-[#0B2545] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Exchange Policy Notice */}
              <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <RotateCcw className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Product Exchange Policy:</strong> SolveSpace India offers 5-day doorstep product exchange & replacement for size or transit issues. <strong>Product exchange only is accepted; returns for cash refunds are not accepted.</strong>
                  <button
                    type="button"
                    onClick={() => setExchangePolicyModalOpen(true)}
                    className="ml-1 text-blue-700 underline font-bold cursor-pointer"
                  >
                    Read Policy
                  </button>
                </div>
              </div>

              {/* Order Mini-Summary & Continue Button */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-slate-600 pb-3">
                  <span>
                    Items ({cart.reduce((sum, i) => sum + i.quantity, 0)}) + Shipping:
                  </span>
                  <span className="font-extrabold text-[#0B2545] text-sm">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[50px] bg-[#0B2545] hover:bg-slate-900 active:scale-98 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Continue to Payment Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: DYNAMIC PAYMENT GATEWAY SELECTION (Cashfree & COD toggles from Admin) */}
          {step === 2 && (
            <div className="p-4 sm:p-6 space-y-5">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Select Payment Option:
                </label>

                {/* Check if both gateways are disabled */}
                {!paymentSettings.cashfreeEnabled && !paymentSettings.codEnabled && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Payment gateways are temporarily disabled in Admin Settings. Please enable Cashfree or Cash on Delivery in Admin to place orders.
                    </span>
                  </div>
                )}

                {/* OPTION 1: Cashfree Payments Gateway (Only visible if Cashfree is ON) */}
                {paymentSettings.cashfreeEnabled && (
                  <div
                    onClick={() => setSelectedPaymentMethod('cashfree')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                      selectedPaymentMethod === 'cashfree'
                        ? 'border-[#0B2545] bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={selectedPaymentMethod === 'cashfree'}
                      onChange={() => setSelectedPaymentMethod('cashfree')}
                      className="mt-1 w-4 h-4 text-[#0B2545] accent-[#0B2545]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-slate-900">
                          Cashfree Online Gateway (Instant UPI / Cards)
                        </span>
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-sm">
                          Fastest
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Instant zero-fee payment via Google Pay, PhonePe, Paytm, BHIM UPI, Credit/Debit Cards, and NetBanking.
                      </p>
                      {/* Gateway visual logos */}
                      <div className="mt-2.5 flex items-center gap-2 text-[10px] font-bold text-slate-600">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-sm">UPI / QR</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded-sm">Visa / MC</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded-sm">RuPay</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded-sm">NetBanking</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* OPTION 2: Cash on Delivery (COD) (Only visible if COD is ON) */}
                {paymentSettings.codEnabled && (
                  <div
                    onClick={() => setSelectedPaymentMethod('cod')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                      selectedPaymentMethod === 'cod'
                        ? 'border-[#0B2545] bg-amber-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={selectedPaymentMethod === 'cod'}
                      onChange={() => setSelectedPaymentMethod('cod')}
                      className="mt-1 w-4 h-4 text-[#0B2545] accent-[#0B2545]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-slate-900">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm">
                          Pay at Doorstep
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Pay cash or scan courier UPI QR upon parcel arrival at {shipping.city || 'your address'}.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Cost Breakdown Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery to pincode {shipping.pincode}</span>
                  <span className="font-semibold text-slate-900">
                    {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-800 font-medium pt-1">
                  <span>Estimated Delivery</span>
                  <span className="font-bold">{pincodeStatus?.estimatedDeliveryDate || '3-5 Business Days'}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm">
                  <span className="font-extrabold text-slate-900">Total Payable</span>
                  <span className="text-lg font-extrabold text-[#0B2545]">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Primary Place Order Action Button (48px min height) */}
              <button
                onClick={handleCompleteOrder}
                disabled={isSubmitting || !selectedPaymentMethod}
                className="w-full min-h-[50px] bg-[#0B2545] hover:bg-slate-900 active:scale-98 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>
                      Place Order with {selectedPaymentMethod === 'cashfree' ? 'Cashfree' : 'COD'} • {formatCurrency(grandTotal)}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 3: Order Confirmation */}
          {step === 3 && (
            <div className="p-6 sm:p-10 text-center space-y-5 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-extrabold text-[#F58220] uppercase tracking-widest">
                  Order Successfully Placed
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Thank You for Choosing SolveSpace India!
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Your tracking confirmation has been sent to <strong>{shipping.email}</strong>.
                </p>
              </div>

              {/* Order Number Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block max-w-sm w-full text-left">
                <div className="text-xs text-slate-500">Order ID:</div>
                <div className="text-lg font-mono font-extrabold text-[#0B2545]">
                  {confirmedOrderNumber}
                </div>
                <div className="mt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-200/80 pt-2">
                  <span>Fulfillment Status:</span>
                  <span className="font-bold text-amber-600">Processing Dispatch</span>
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-between mt-1">
                  <span>Destination:</span>
                  <span className="font-bold text-slate-800">{shipping.city}, {shipping.pincode}</span>
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-between mt-1">
                  <span>Estimated Delivery:</span>
                  <span className="font-bold text-emerald-700">{pincodeStatus?.estimatedDeliveryDate || 'Within 3-5 business days'}</span>
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-between mt-1">
                  <span>Policy Coverage:</span>
                  <span className="font-bold text-blue-900">5-Day Product Exchange Only</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setCheckoutModalOpen(false);
                    setTrackOrderModalOpen(true);
                  }}
                  className="w-full sm:w-auto min-h-[48px] px-6 border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl cursor-pointer"
                >
                  Track Shipment & Exchange
                </button>
                <button
                  onClick={() => {
                    setCheckoutModalOpen(false);
                    setStep(1);
                  }}
                  className="w-full sm:w-auto min-h-[48px] px-8 bg-[#0B2545] text-white font-bold text-sm rounded-xl hover:bg-slate-900 active:scale-95 shadow-md transition-all cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
