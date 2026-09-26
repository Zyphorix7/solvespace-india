import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Upload,
  Star,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  Tag,
  Globe,
  DollarSign,
  Package,
  Sliders,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  MoveLeft,
  MoveRight,
  Loader2,
  Link,
  Bold,
  Italic,
  List,
  FileText,
} from 'lucide-react';
import { Product, ProductVariant, ProductImageDetail } from '../types';
import { useStore } from '../context/StoreContext';
import { generateProductCopy } from '../services/gemini';

interface ShopifyProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (productData: Omit<Product, 'id'>, existingId?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

// Curated high-res product image presets for SolveSpace
const CURATED_IMAGE_PRESETS = [
  {
    label: 'Flagship Matte Black',
    url: '/products/Screenshot_20260901_134903_Meesho.jpg',
    description: 'Black Motor Head + BPA-Free 250ml Clear Container',
  },
  {
    label: 'Unboxing Angle',
    url: '/products/1788250324092.png',
    description: 'Frontal unboxing profile with accessories and USB cord',
  },
  {
    label: 'Precision Blades',
    url: '/products/chopper-blades-precision.jpg',
    description: 'Triple-layer S-shaped 304 food-grade stainless steel blades',
  },
  {
    label: 'Cordless Motor',
    url: '/products/chopper-cordless-motor.jpg',
    description: 'One-touch pulse operation with USB-C high-torque motor',
  },
  {
    label: 'Waterproof Rinsing',
    url: '/products/chopper-washable-cleaning.jpg',
    description: 'IPX6 washable detachable parts for 5-second rinsing',
  },
];

const DEFAULT_CATEGORIES = [
  'Kitchen & Home',
  'Smart Gadgets',
  'Desk & Workspace',
  'Tech & Mobility',
  'Home & Wellness',
  'Ergonomic Hardware',
];

export const ShopifyProductEditorModal: React.FC<ShopifyProductEditorModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  onDelete,
}) => {
  const { showToast, formatCurrency } = useStore();

  // Core Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Kitchen & Home');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [vendor, setVendor] = useState('SolveSpace™');
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [isFeatured, setIsFeatured] = useState(false);

  // Pricing State
  const [price, setPrice] = useState<number | ''>(899);
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>(1499);
  const [costPerItem, setCostPerItem] = useState<number | ''>(320);
  const [chargeTax, setChargeTax] = useState(true);

  // Inventory & Shipping State
  const [inventory, setInventory] = useState<number | ''>(50);
  const [sku, setSku] = useState('SS-CHOP-01');
  const [barcode, setBarcode] = useState('85094010');
  const [weightKg, setWeightKg] = useState<number | ''>(0.35);
  const [trackQuantity, setTrackQuantity] = useState(true);

  // Media State (Strictly max 10 images)
  const [images, setImages] = useState<string[]>([]);
  const [imageDetails, setImageDetails] = useState<ProductImageDetail[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Features State
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState('');

  // Tags State
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Variants State
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Ratings & Social Proof State
  const [rating, setRating] = useState(4.9);
  const [reviewCount, setReviewCount] = useState(142);

  // SEO State
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [slug, setSlug] = useState('');

  // UI / Status State
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [previewDescription, setPreviewDescription] = useState(false);
  const [selectedImageForAlt, setSelectedImageForAlt] = useState<number | null>(null);
  const [editingAltText, setEditingAltText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when product changes or modal opens
  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setSubtitle(product.subtitle || '');
      setDescription(product.description || '');
      
      const foundCategory = DEFAULT_CATEGORIES.includes(product.category);
      if (foundCategory) {
        setCategory(product.category);
        setIsCustomCategory(false);
      } else {
        setCategory('custom');
        setCustomCategory(product.category || '');
        setIsCustomCategory(true);
      }

      setVendor(product.vendor || 'SolveSpace™');
      setStatus(product.status || 'active');
      setIsFeatured(!!product.isFeatured);

      setPrice(product.price ?? 899);
      setCompareAtPrice(product.compareAtPrice ?? (product.price ? Math.round(product.price * 1.5) : 1499));
      setCostPerItem(product.costPerItem ?? 320);

      setInventory(product.inventory ?? 50);
      setSku(product.sku || 'SS-CHOP-01');
      setBarcode(product.barcode || '85094010');
      setWeightKg(product.weightKg ?? 0.35);

      setImages(product.images ? [...product.images] : []);
      setImageDetails(product.imageDetails ? [...product.imageDetails] : []);

      setFeatures(product.features ? [...product.features] : []);
      setTags(product.tags ? [...product.tags] : []);

      if (product.variants && product.variants.length > 0) {
        setHasVariants(true);
        setVariants([...product.variants]);
      } else {
        setHasVariants(false);
        setVariants([
          {
            id: 'v1',
            name: 'Stealth Matte Black (250ml Bowl)',
            price: product.price || 899,
            compareAtPrice: product.compareAtPrice || 1499,
            sku: product.sku || 'SS-CHOP-BLK-250',
            inventory: product.inventory || 50,
            image: product.images?.[0] || '',
          },
        ]);
      }

      setRating(product.rating || 4.9);
      setReviewCount(product.reviewCount || 142);

      setSeoTitle(product.seoTitle || product.title || '');
      setSeoDescription(product.seoDescription || (product.description ? product.description.slice(0, 155) : ''));
      setSlug(product.slug || generateSlug(product.title));
    } else {
      // New Product Defaults
      setTitle('Wireless Electric Mini Food Chopper & Garlic Mincer');
      setSubtitle('Cordless Portable USB Rechargeable Vegetable & Food Processor (Black Top & Clear Bowl)');
      setDescription(
        'Say goodbye to teary eyes and tedious manual chopping. The SolveSpace™ Wireless Electric Mini Food Chopper packs heavy-duty mincing power into a portable cordless design with 304 stainless steel blades and USB-C recharging.\n\nEffortlessly chop garlic, ginger, onions, chilies, herbs, nuts, and prepare fresh purees or baby food in under 10 seconds with one-touch ergonomic pulse control.'
      );
      setCategory('Kitchen & Home');
      setIsCustomCategory(false);
      setVendor('SolveSpace™');
      setStatus('active');
      setIsFeatured(true);

      setPrice(899);
      setCompareAtPrice(1499);
      setCostPerItem(320);

      setInventory(50);
      setSku(`SS-${Math.floor(100 + Math.random() * 900)}`);
      setBarcode('85094010');
      setWeightKg(0.35);

      setImages([
        '/products/Screenshot_20260901_134903_Meesho.jpg',
        '/products/1788250324092.png',
        '/products/chopper-blades-precision.jpg',
        '/products/chopper-cordless-motor.jpg',
        '/products/chopper-washable-cleaning.jpg',
      ]);
      setImageDetails([
        { url: '/products/Screenshot_20260901_134903_Meesho.jpg', label: 'Matte Black Motor + Clear 250ml Bowl', badge: 'Flagship' },
        { url: '/products/1788250324092.png', label: 'Unboxing Perspective & Included USB Cable', badge: 'Overview' },
        { url: '/products/chopper-blades-precision.jpg', label: 'Triple-Layer 304 Stainless Steel Blades', badge: 'Blades' },
        { url: '/products/chopper-cordless-motor.jpg', label: 'High-Torque One-Touch Pulse Motor', badge: 'Motor' },
        { url: '/products/chopper-washable-cleaning.jpg', label: 'IPX6 Waterproof Detachable Cleaning', badge: 'Washable' },
      ]);

      setFeatures([
        '⚡ Cordless & USB Rechargeable (35+ chopping sessions on 2hr charge)',
        '🔘 One-Touch Ergonomic Pulse Operation (instant consistency control)',
        '🔪 Triple-Layer 304 Stainless Steel Blades (razor-sharp mincing in 5–10s)',
        '🥣 100% Food-Grade BPA-Free 250ml Bowl (safe for infant purees & gravies)',
        '💧 IPX6 Waterproof Detachable Design (5-second tap water rinsing)',
      ]);

      setTags(['Best Seller', 'Kitchen Essential', 'Cordless', 'USB Rechargeable', '304 Stainless Steel', 'Garlic Mincer']);

      setHasVariants(false);
      setVariants([
        {
          id: 'v1',
          name: 'Stealth Matte Black (250ml Bowl)',
          price: 899,
          compareAtPrice: 1499,
          sku: 'SS-CHOP-BLK-250',
          inventory: 50,
          image: '/products/Screenshot_20260901_134903_Meesho.jpg',
        },
      ]);

      setRating(4.9);
      setReviewCount(142);
      setSeoTitle('Wireless Electric Mini Food Chopper & Garlic Mincer | SolveSpace India');
      setSeoDescription('High-speed cordless USB rechargeable electric mini chopper. 304 stainless steel blades, 250ml BPA-free bowl. Cash on delivery & next-day shipping in India.');
      setSlug('wireless-electric-mini-food-chopper-garlic-mincer');
    }
  }, [product, isOpen]);

  // Helper to generate URL-friendly slug
  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Auto-generate slug when title changes (if slug was empty or matching old slug)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!product || !slug || slug === generateSlug(title)) {
      setSlug(generateSlug(val));
    }
  };

  // Client-side image processing (PNG, JPG, JPEG, WEBP, GIF, SVG, AVIF, HEIC, etc.)
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // For SVGs, read as data URL directly
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      // For raster images (PNG, JPG, JPEG, WEBP, etc.), resize & optimize via canvas
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 900;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          // Use PNG if original had alpha channel or PNG type, otherwise high quality JPEG
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const quality = outputType === 'image/png' ? undefined : 0.82;
          const optimizedDataUrl = canvas.toDataURL(outputType, quality);
          resolve(optimizedDataUrl);
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Multiple File Upload Handler
  const handleFilesUpload = async (files: FileList | File[]) => {
    const remainingSlots = 10 - images.length;
    if (remainingSlots <= 0) {
      showToast('Maximum 10 images reached. Remove an image to add a new one.', 'error');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      showToast(`Only ${remainingSlots} slots available. Processing first ${remainingSlots} images.`, 'info');
    }

    try {
      const newUrls: string[] = [];
      for (const file of filesToProcess) {
        const dataUrl = await processImageFile(file);
        newUrls.push(dataUrl);
      }

      setImages((prev) => [...prev, ...newUrls].slice(0, 10));
      showToast(`Successfully added ${newUrls.length} image(s)!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error processing selected image files', 'error');
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFilesUpload(e.dataTransfer.files);
    }
  };

  // Add from URL
  const handleAddFromUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (images.length >= 10) {
      showToast('Maximum 10 images reached.', 'error');
      return;
    }
    setImages((prev) => [...prev, trimmed].slice(0, 10));
    setUrlInput('');
    setShowUrlInput(false);
    showToast('Image URL added to media gallery', 'success');
  };

  // Select Image as Main (Moves to index 0)
  const handleSetAsMain = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const newImages = [...prev];
      const [target] = newImages.splice(index, 1);
      newImages.unshift(target);
      return newImages;
    });
    showToast('Selected image is now the MAIN product cover image!', 'success');
  };

  // Move image left/right
  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    setImages((prev) => {
      const newImages = [...prev];
      const temp = newImages[index];
      newImages[index] = newImages[targetIndex];
      newImages[targetIndex] = temp;
      return newImages;
    });
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    showToast('Image removed from product', 'info');
  };

  // Add Preset Image
  const handleAddPresetImage = (presetUrl: string, label: string) => {
    if (images.length >= 10) {
      showToast('Maximum 10 images reached.', 'error');
      return;
    }
    if (images.includes(presetUrl)) {
      showToast('Image is already in the media gallery.', 'info');
      return;
    }
    setImages((prev) => [...prev, presetUrl]);
    showToast(`Added ${label} image!`, 'success');
  };

  // AI Copy Generation with Gemini
  const handleGenerateAiCopy = async () => {
    if (!title.trim()) {
      showToast('Please enter a product title first to generate AI copy.', 'info');
      return;
    }

    setIsGeneratingAi(true);
    const finalCategory = isCustomCategory ? customCategory : category;
    try {
      const copy = await generateProductCopy(title, finalCategory);
      if (copy) {
        if (copy.subtitle) setSubtitle(copy.subtitle);
        if (copy.description) setDescription(copy.description);
        if (copy.features && copy.features.length > 0) setFeatures(copy.features);
        if (copy.tags && copy.tags.length > 0) setTags(copy.tags);
        if (copy.suggestedPrice) setPrice(copy.suggestedPrice);
        if (copy.suggestedCompareAtPrice) setCompareAtPrice(copy.suggestedCompareAtPrice);
        setSeoTitle(`${title} | SolveSpace India`);
        if (copy.description) setSeoDescription(copy.description.slice(0, 155));
        showToast('Generated product specs & copy with Gemini AI!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not generate copy, please try again', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Add Feature item
  const handleAddFeature = () => {
    const trimmed = newFeatureInput.trim();
    if (!trimmed) return;
    setFeatures((prev) => [...prev, trimmed]);
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  // Tag Handlers
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Variant Handlers
  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `v_${Date.now()}`,
      name: `Option ${variants.length + 1}`,
      price: typeof price === 'number' ? price : 899,
      compareAtPrice: typeof compareAtPrice === 'number' ? compareAtPrice : 1499,
      sku: `${sku || 'SS'}-${variants.length + 1}`,
      inventory: typeof inventory === 'number' ? inventory : 25,
      image: images[0] || '',
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const handleUpdateVariant = (index: number, updates: Partial<ProductVariant>) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Product Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Product title is required.', 'error');
      return;
    }

    if (price === '' || Number(price) <= 0) {
      showToast('Please set a valid selling price.', 'error');
      return;
    }

    if (images.length === 0) {
      showToast('Please add at least one product image.', 'error');
      return;
    }

    setIsSaving(true);
    const finalCategory = isCustomCategory ? (customCategory.trim() || 'General') : category;

    const payload: Omit<Product, 'id'> = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      category: finalCategory,
      price: Number(price),
      compareAtPrice: compareAtPrice !== '' ? Number(compareAtPrice) : undefined,
      costPerItem: costPerItem !== '' ? Number(costPerItem) : undefined,
      inventory: inventory !== '' ? Number(inventory) : 0,
      sku: sku.trim(),
      barcode: barcode.trim(),
      weightKg: weightKg !== '' ? Number(weightKg) : undefined,
      images,
      imageDetails: images.map((url, idx) => ({
        url,
        label: imageDetails.find((d) => d.url === url)?.label || (idx === 0 ? 'Main Cover Angle' : `Angle ${idx + 1}`),
        badge: idx === 0 ? 'Main' : `Angle ${idx + 1}`,
      })),
      features: features.filter(Boolean),
      tags: tags.filter(Boolean),
      variants: hasVariants ? variants : undefined,
      rating: rating || 4.9,
      reviewCount: reviewCount || 1,
      status,
      vendor: vendor.trim() || 'SolveSpace™',
      isFeatured,
      seoTitle: seoTitle.trim() || title.trim(),
      seoDescription: seoDescription.trim() || description.slice(0, 155),
      slug: slug.trim() || generateSlug(title),
    };

    try {
      await onSave(payload, product?.id);
      showToast(
        product ? 'Product updated successfully in Firestore!' : 'New product created and live in catalog!',
        'success'
      );
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to save product. Check permissions or network.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculations for Margin / Discount
  const numPrice = typeof price === 'number' ? price : 0;
  const numCompare = typeof compareAtPrice === 'number' ? compareAtPrice : 0;
  const numCost = typeof costPerItem === 'number' ? costPerItem : 0;

  const discountAmount = numCompare > numPrice ? numCompare - numPrice : 0;
  const discountPercent = numCompare > numPrice ? Math.round((discountAmount / numCompare) * 100) : 0;
  const profitMargin = numPrice > numCost && numCost > 0 ? Math.round(((numPrice - numCost) / numPrice) * 100) : null;
  const profitAmount = numPrice > numCost && numCost > 0 ? numPrice - numCost : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Main Container - Shopify Polaris Style */}
      <div className="w-full max-w-6xl bg-[#F8FAFC] sm:rounded-3xl shadow-2xl border border-slate-200/90 text-slate-800 flex flex-col max-h-[96vh] overflow-hidden my-auto animate-in fade-in-50 zoom-in-95 duration-150">
        {/* SHOPIFY TOP HEADER BAR */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Return to Catalog"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                  Products
                </span>
                <span className="text-slate-300 hidden sm:inline">/</span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate max-w-xs sm:max-w-md">
                  {title || 'Untitled Product'}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                    status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  {status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                Shopify-style full specification product architect & multi-angle image CMS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {product && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
                    onDelete(product.id);
                    onClose();
                  }
                }}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Delete Product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Discard
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="px-5 py-2 bg-[#0B2545] hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Product</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* MODAL BODY (2-COLUMN POLARIS LAYOUT) */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ======================================================== */}
            {/* LEFT / MAIN COLUMN (2/3 WIDTH) */}
            {/* ======================================================== */}
            <div className="lg:col-span-2 space-y-6">
              {/* CARD 1: TITLE & DESCRIPTION */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Product Title & Overview
                  </h4>
                  <button
                    type="button"
                    onClick={handleGenerateAiCopy}
                    disabled={isGeneratingAi}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isGeneratingAi ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span>{isGeneratingAi ? 'Writing Copy...' : 'Generate with Gemini AI'}</span>
                  </button>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wireless Electric Mini Food Chopper & Garlic Mincer"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#0B2545] rounded-xl font-bold transition-all focus:outline-hidden focus:ring-2 focus:ring-[#0B2545]/15"
                  />
                </div>

                {/* Subtitle / Tagline */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Subtitle / Summary Hook
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cordless Portable USB Rechargeable Vegetable & Food Processor (Black Top & Clear Bowl)"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs text-slate-700 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#0B2545] rounded-xl transition-all focus:outline-hidden"
                  />
                </div>

                {/* Description with Format & Preview Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Description <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewDescription(!previewDescription)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{previewDescription ? 'Edit Raw' : 'Preview Formatted'}</span>
                      </button>
                    </div>
                  </div>

                  {previewDescription ? (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line min-h-[140px]">
                      {description || <span className="text-slate-400 italic">No description entered yet.</span>}
                    </div>
                  ) : (
                    <textarea
                      rows={5}
                      required
                      placeholder="Highlight key materials, cordless battery performance, stainless steel blade speed, and warranty..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#0B2545] rounded-xl transition-all focus:outline-hidden focus:ring-2 focus:ring-[#0B2545]/15 leading-relaxed font-sans"
                    />
                  )}
                </div>
              </div>

              {/* CARD 2: MEDIA (UP TO 10 IMAGES, MAIN SELECTION, PNG/JPG/OTHER FORMATS) */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Product Media
                      </h4>
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          images.length >= 10
                            ? 'bg-amber-100 text-amber-800 font-bold'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {images.length} / 10 images
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Upload up to 10 images (PNG, JPG, JPEG, WEBP, SVG). Image #1 is the{' '}
                      <span className="font-bold text-amber-600">Main Display Cover</span>.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>Add from URL</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={images.length >= 10}
                      className="text-[11px] font-bold text-white bg-[#0B2545] hover:bg-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Files</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,image/avif,image/*"
                      onChange={(e) => {
                        if (e.target.files) handleFilesUpload(e.target.files);
                      }}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Collapsible URL Input */}
                {showUrlInput && (
                  <div className="flex gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in-50 duration-150">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://... or /products/...)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFromUrl();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddFromUrl}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                )}

                {/* DRAG & DROP UPLOAD ZONE */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    isDragging
                      ? 'border-[#0B2545] bg-[#0B2545]/5 scale-[1.01]'
                      : images.length >= 10
                      ? 'border-slate-200 bg-slate-50/50 cursor-not-allowed'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500 mb-2">
                    <Upload className="w-6 h-6 text-[#0B2545]" />
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    {images.length >= 10 ? (
                      <span className="text-amber-600">Maximum 10 images limit reached</span>
                    ) : (
                      <>
                        <span className="text-[#0B2545] underline">Click to upload</span> or drag and drop
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Accepts PNG, JPG, JPEG, WEBP, GIF, SVG, and more (Auto-optimized for instant page loading)
                  </p>
                </div>

                {/* Curated Presets Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">Quick Presets:</span>
                  {CURATED_IMAGE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPresetImage(p.url, p.label)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-slate-400" />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>

                {/* MEDIA TILES GRID (INTERACTIVE REORDER, SET AS MAIN, DELETE) */}
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
                    {images.map((imgUrl, idx) => {
                      const isMain = idx === 0;
                      return (
                        <div
                          key={idx}
                          className={`group relative rounded-xl border-2 overflow-hidden bg-white shadow-2xs transition-all ${
                            isMain
                              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Main Badge or Number Pill */}
                          <div className="absolute top-2 left-2 z-10">
                            {isMain ? (
                              <span className="px-2 py-0.5 bg-amber-500 text-white rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                                <Star className="w-3 h-3 fill-white" />
                                <span>Main</span>
                              </span>
                            ) : (
                              <span className="w-5 h-5 bg-slate-900/70 backdrop-blur-xs text-white rounded-md text-[10px] font-bold flex items-center justify-center shadow-xs">
                                #{idx + 1}
                              </span>
                            )}
                          </div>

                          {/* Quick Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            className="absolute top-2 right-2 z-10 w-6 h-6 rounded-md bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                            title="Remove Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Image Thumbnail */}
                          <div className="aspect-square w-full bg-slate-50 flex items-center justify-center p-2">
                            <img
                              src={imgUrl}
                              alt={`Product image ${idx + 1}`}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                // Fallback icon if URL is broken
                                (e.target as any).style.display = 'none';
                              }}
                            />
                          </div>

                          {/* Bottom Action Footer */}
                          <div className="p-1.5 bg-white border-t border-slate-100 flex items-center justify-between gap-1">
                            {!isMain ? (
                              <button
                                type="button"
                                onClick={() => handleSetAsMain(idx)}
                                className="flex-1 py-1 px-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                title="Make this the primary storefront cover image"
                              >
                                <Star className="w-3 h-3 text-amber-600" />
                                <span>Set Main</span>
                              </button>
                            ) : (
                              <span className="flex-1 text-center py-1 text-[10px] font-black text-amber-600">
                                Primary Cover
                              </span>
                            )}

                            {/* Reorder Buttons */}
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveImage(idx, 'left')}
                                className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Move Left"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === images.length - 1}
                                onClick={() => handleMoveImage(idx, 'right')}
                                className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Move Right"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>No images added yet. At least 1 image is required for the storefront.</span>
                  </div>
                )}
              </div>

              {/* CARD 3: PRICING & PROFIT ANALYSIS */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Pricing & Profitability (INR ₹)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Selling Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Selling Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        required
                        min={0}
                        value={price}
                        onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Compare At Price (MRP) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Compare-at Price (MRP ₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={compareAtPrice}
                        onChange={(e) =>
                          setCompareAtPrice(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-full pl-7 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-500 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Cost per item */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Cost per Item (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 320"
                        value={costPerItem}
                        onChange={(e) =>
                          setCostPerItem(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-full pl-7 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Profit & Discount Calculations Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-4">
                    {discountAmount > 0 && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer Discount</span>
                        <span className="font-extrabold text-[#FF5A36]">
                          Save {formatCurrency(discountAmount)} ({discountPercent}% OFF)
                        </span>
                      </div>
                    )}
                    {profitAmount !== null && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Gross Margin</span>
                        <span className="font-extrabold text-emerald-600">
                          {profitMargin}% ({formatCurrency(profitAmount)} profit/unit)
                        </span>
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chargeTax}
                      onChange={(e) => setChargeTax(e.target.checked)}
                      className="rounded text-[#0B2545] focus:ring-0"
                    />
                    <span>Charge tax on this product (GST 18% inclusive)</span>
                  </label>
                </div>
              </div>

              {/* CARD 4: INVENTORY & SHIPPING */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Inventory & Physical Fulfillment
                  </h4>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trackQuantity}
                      onChange={(e) => setTrackQuantity(e.target.checked)}
                      className="rounded text-[#0B2545]"
                    />
                    <span>Track inventory quantity</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Available Stock <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={inventory}
                      onChange={(e) =>
                        setInventory(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">SKU</label>
                    <input
                      type="text"
                      placeholder="SS-CHOP-01"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  {/* Barcode / HSN */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">HSN / Barcode</label>
                    <input
                      type="text"
                      placeholder="85094010"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  {/* Shipping Weight (kg) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.35"
                      value={weightKg}
                      onChange={(e) =>
                        setWeightKg(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 5: VARIANTS & OPTIONS (SHOPIFY STYLE) */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Product Options & Variants
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Does this product come in different capacities, sizes, or combo packs?
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-[#0B2545] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => setHasVariants(e.target.checked)}
                      className="rounded text-[#0B2545]"
                    />
                    <span>Enable Multi-Variant Options</span>
                  </label>
                </div>

                {hasVariants && (
                  <div className="space-y-3 pt-2">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">Variant Title</th>
                            <th className="p-2.5">Price (₹)</th>
                            <th className="p-2.5">MRP (₹)</th>
                            <th className="p-2.5">SKU</th>
                            <th className="p-2.5">Stock</th>
                            <th className="p-2.5">Image</th>
                            <th className="p-2.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {variants.map((v, vIdx) => (
                            <tr key={v.id || vIdx}>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={v.name}
                                  onChange={(e) =>
                                    handleUpdateVariant(vIdx, { name: e.target.value })
                                  }
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                />
                              </td>
                              <td className="p-2 w-24">
                                <input
                                  type="number"
                                  value={v.price}
                                  onChange={(e) =>
                                    handleUpdateVariant(vIdx, { price: Number(e.target.value) })
                                  }
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                                />
                              </td>
                              <td className="p-2 w-24">
                                <input
                                  type="number"
                                  value={v.compareAtPrice || ''}
                                  onChange={(e) =>
                                    handleUpdateVariant(vIdx, {
                                      compareAtPrice: Number(e.target.value),
                                    })
                                  }
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                />
                              </td>
                              <td className="p-2 w-28">
                                <input
                                  type="text"
                                  value={v.sku}
                                  onChange={(e) =>
                                    handleUpdateVariant(vIdx, { sku: e.target.value })
                                  }
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                                />
                              </td>
                              <td className="p-2 w-20">
                                <input
                                  type="number"
                                  value={v.inventory}
                                  onChange={(e) =>
                                    handleUpdateVariant(vIdx, { inventory: Number(e.target.value) })
                                  }
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                                />
                              </td>
                              <td className="p-2 w-28">
                                <select
                                  value={v.image || images[0] || ''}
                                  onChange={(e) =>
                                    handleUpdateVariant(vIdx, { image: e.target.value })
                                  }
                                  className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px]"
                                >
                                  {images.map((url, i) => (
                                    <option key={i} value={url}>
                                      {i === 0 ? 'Main Cover' : `Image #${i + 1}`}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariant(vIdx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-3 py-1.5 text-xs font-bold text-[#0B2545] bg-[#0B2545]/10 hover:bg-[#0B2545]/20 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Variant</span>
                    </button>
                  </div>
                )}
              </div>

              {/* CARD 6: PRODUCT FEATURES (BULLET POINTS) */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Product Key Features (Storefront Highlights)
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setFeatures([
                        '⚡ Cordless & USB Rechargeable (35+ chopping sessions on 2hr charge)',
                        '🔘 One-Touch Ergonomic Pulse Operation (instant consistency control)',
                        '🔪 Triple-Layer 304 Stainless Steel Blades (razor-sharp mincing in 5–10s)',
                        '🥣 100% Food-Grade BPA-Free 250ml Bowl (safe for infant purees & gravies)',
                        '💧 IPX6 Waterproof Detachable Design (5-second tap water rinsing)',
                        '🪶 Ultra-Compact & Portable (minimalist space-saving footprint)',
                      ]);
                    }}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Load Standard Specs
                  </button>
                </div>

                <div className="space-y-2">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...features];
                          updated[idx] = e.target.value;
                          setFeatures(updated);
                        }}
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add a new feature bullet (e.g. 1-Year Doorstep Warranty)..."
                      value={newFeatureInput}
                      onChange={(e) => setNewFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* RIGHT / SIDEBAR COLUMN (1/3 WIDTH) */}
            {/* ======================================================== */}
            <div className="space-y-6">
              {/* STATUS CARD */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Product Status
                </h4>

                <div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  >
                    <option value="active">Active (Visible in Store)</option>
                    <option value="draft">Draft (Hidden from Customers)</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-[#0B2545]"
                    />
                    <span>Feature on Homepage Spotlight</span>
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1 pl-6">
                    Displays product prominently in hero carousels & instant checkout banners.
                  </p>
                </div>
              </div>

              {/* PRODUCT ORGANIZATION CARD */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Product Organization
                </h4>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={isCustomCategory ? 'custom' : category}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="custom">+ Add Custom Category...</option>
                  </select>

                  {isCustomCategory && (
                    <input
                      type="text"
                      placeholder="Type custom category name..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full mt-2 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                    />
                  )}
                </div>

                {/* Vendor / Brand */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand / Vendor</label>
                  <input
                    type="text"
                    placeholder="SolveSpace™"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>

                {/* Tags (Shopify Style Chips) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1.5"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Add tag and press Enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* RATINGS & SOCIAL PROOF */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Customer Social Proof
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Rating (out of 5)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={1}
                      max={5}
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Review Count
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={reviewCount}
                      onChange={(e) => setReviewCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SHOPIFY SEARCH ENGINE LISTING PREVIEW (SEO) */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Search Engine Listing (SEO)
                  </h4>
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                </div>

                {/* Google Snippet Live Preview */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[10px] text-emerald-700 truncate font-mono">
                    https://solvespace.in/products/{slug || 'product'}
                  </div>
                  <div className="text-xs font-bold text-blue-700 truncate hover:underline cursor-pointer">
                    {seoTitle || title || 'SolveSpace India'}
                  </div>
                  <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {seoDescription || description || 'Explore precision workspace and smart culinary hardware at SolveSpace India.'}
                  </div>
                </div>

                {/* SEO Inputs */}
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Page Title</label>
                    <input
                      type="text"
                      placeholder="Custom Page Title for Search Engines"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Meta Description</label>
                    <textarea
                      rows={2}
                      placeholder="Brief SEO summary..."
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">URL and Handle</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2">
                      <span className="text-[11px] text-slate-400 font-mono">/products/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(generateSlug(e.target.value))}
                        className="flex-1 px-1 py-1.5 text-xs bg-transparent focus:outline-hidden font-mono text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STICKY BOTTOM SAVE/DISCARD BAR */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 shadow-xs">
          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            {images.length}/10 images selected • {hasVariants ? `${variants.length} active variants` : 'Single default variant'}
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="px-6 py-2 bg-[#0B2545] hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
