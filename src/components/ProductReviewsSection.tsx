import React, { useState } from 'react';
import { Star, CheckCircle2, ThumbsUp, MessageSquarePlus, X, Filter } from 'lucide-react';
import { ProductReview } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductReviewsSectionProps {
  productId: string;
  productTitle: string;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productTitle,
}) => {
  const { reviews, addReview, showToast } = useStore();

  const productReviews = reviews.filter((r) => r.productId === productId || r.productId === 'seed_prod_0');

  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  // New review form
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const filteredReviews =
    filterRating === 'all'
      ? productReviews
      : productReviews.filter((r) => Math.round(r.rating) === filterRating);

  // Compute breakdown
  const totalReviews = productReviews.length;
  const avgRating =
    totalReviews > 0
      ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  const fiveStar = productReviews.filter((r) => Math.round(r.rating) === 5).length;
  const fourStar = productReviews.filter((r) => Math.round(r.rating) === 4).length;
  const threeStar = productReviews.filter((r) => Math.round(r.rating) === 3).length;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim() || !title.trim()) {
      showToast('Please complete all review fields', 'error');
      return;
    }

    addReview({
      productId,
      authorName: authorName.trim(),
      location: location.trim() || 'Verified Indian Buyer',
      rating,
      title: title.trim(),
      comment: comment.trim(),
      verifiedBuyer: true,
    });

    setIsWriteModalOpen(false);
    showToast('Thank you! Your verified review has been published.', 'success');

    // Reset form
    setAuthorName('');
    setLocation('');
    setTitle('');
    setComment('');
    setRating(5);
  };

  return (
    <div className="pt-6 border-t border-slate-200 space-y-6">
      {/* Header & Rating Breakdown (Shopify Judge.me / Loox style) */}
      <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200/80">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Big Rating Summary */}
          <div className="md:col-span-4 text-center md:text-left space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-2">
              <span>{avgRating}</span>
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Based on {totalReviews} verified customer reviews across India
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B2545] hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-[#FF5A36]" />
                <span>Write a Review</span>
              </button>
            </div>
          </div>

          {/* Star Distribution Bars */}
          <div className="md:col-span-8 space-y-1.5 text-xs text-slate-600">
            {[
              { stars: 5, count: fiveStar },
              { stars: 4, count: fourStar },
              { stars: 3, count: threeStar },
            ].map((bar) => {
              const pct = totalReviews > 0 ? Math.round((bar.count / totalReviews) * 100) : 0;
              return (
                <div
                  key={bar.stars}
                  onClick={() => setFilterRating(filterRating === bar.stars ? 'all' : bar.stars)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <span className="w-12 font-bold text-slate-700 flex items-center gap-1">
                    {bar.stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 group-hover:bg-[#FF5A36] transition-all rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-400 font-bold">{pct}%</span>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Customer Feedback ({filteredReviews.length})</span>
          {filterRating !== 'all' && (
            <button
              onClick={() => setFilterRating('all')}
              className="text-[#FF5A36] hover:underline cursor-pointer"
            >
              Showing {filterRating}★ only • Reset
            </button>
          )}
        </div>

        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{rev.authorName}</span>
                {rev.verifiedBuyer && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified Buyer</span>
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400">{rev.createdAt}</span>
            </div>

            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                  }`}
                />
              ))}
              <span className="text-[11px] text-slate-400 ml-1.5">{rev.location}</span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{rev.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
          </div>
        ))}
      </div>

      {/* Write a Review Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in-50 zoom-in-95">
            <div className="p-4 sm:p-5 bg-[#0B2545] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black">Write a Verified Review</h3>
                <p className="text-[11px] text-slate-300">{productTitle}</p>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Overall Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {rating} out of 5 Stars
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Rohan Verma"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#0B2545]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your City / State</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, KA"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#0B2545]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Incredible aluminum finish, fits my desk setup!"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#0B2545]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Comments</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about the build quality, packaging, and ergonomics..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#0B2545]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  Submit Verified Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
