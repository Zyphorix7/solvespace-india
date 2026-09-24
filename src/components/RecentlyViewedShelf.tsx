import React from 'react';
import { Eye, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

export const RecentlyViewedShelf: React.FC = () => {
  const { products, recentlyViewedIds, setSelectedProduct } = useStore();

  const viewedProducts = products.filter((p) => recentlyViewedIds.includes(p.id));

  if (viewedProducts.length === 0) return null;

  return (
    <section className="space-y-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Recently Viewed By You
            </h3>
            <p className="text-xs text-slate-500">Pick up right where you left off</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {viewedProducts.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} onOpenDetails={setSelectedProduct} />
        ))}
      </div>
    </section>
  );
};
