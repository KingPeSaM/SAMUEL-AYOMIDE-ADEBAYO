import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Tag, 
  Info, 
  DollarSign, 
  Upload, 
  Check,
  AlertCircle,
  Palette
} from 'lucide-react';
import { Product } from '../types';

interface ProductFormProps {
  onSubmit: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: Product;
}

const CATEGORIES = [
  { id: 'crochet', name: 'Crochet Scrunchies' },
  { id: 'fabric', name: 'Fabric Scrunchies' },
  { id: 'headbands', name: 'Headbands' },
  { id: 'alice', name: 'Alice Bands' },
  { id: 'clips', name: 'Claw Clips' },
  { id: 'earrings', name: 'Earrings' }
];

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price.toString() || '',
    category: initialData?.category || 'crochet',
    badge: initialData?.badge || '',
    badgeColor: initialData?.badgeColor || '#C0132C',
    imageUrl: initialData?.imageUrl || ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      setError('Image is too large. Please select an image smaller than 800KB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError(null);
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, imageUrl: reader.result as string });
      setIsUploading(false);
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }
    onSubmit({
      ...formData,
      price: Number(formData.price),
      imageUrl: formData.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(formData.name)}/600/600`
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
      />
      
      <div className="min-h-full flex items-center justify-center p-4 md:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[40px] md:rounded-[48px] p-6 md:p-12 max-w-3xl w-full shadow-2xl relative z-10 border border-[#C0132C]/10"
        >
        <div className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center p-4 shadow-lg shadow-[#C0132C]/10 border border-[#C0132C]/5">
              <img 
                src="https://lh3.googleusercontent.com/d/1u0Uplg9oO8PDC_6arSNpvWnCXcOY-RRF" 
                alt="Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-px bg-[#C0132C]" />
                <span className="text-[0.7rem] font-bold tracking-[0.25em] uppercase text-[#C0132C]">
                  {initialData ? 'Edit Entry' : 'New Entry'}
                </span>
              </div>
              <h3 className="font-serif text-4xl text-[#8B0A2A] leading-tight">
                {initialData ? 'Update' : 'Add'} <em className="italic text-[#C0132C] not-italic">Product</em>
              </h3>
            </div>
          </div>
          <button 
            onClick={onCancel} 
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#FAF0F0] text-[#7a5a5a] hover:text-[#C0132C] hover:bg-[#F5E8E8] transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-[0.85rem] font-medium"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Details */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[0.7rem] font-bold uppercase tracking-widest text-[#7a5a5a] ml-1">Product Name</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0132C]/30" size={18} />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#FAF0F0]/50 border border-transparent focus:border-[#C0132C]/20 focus:bg-white outline-none transition-all text-[0.95rem]"
                    placeholder="e.g. Silk Ribbon Scrunchie"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[0.7rem] font-bold uppercase tracking-widest text-[#7a5a5a] ml-1">Price (₦)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0132C]/30" size={18} />
                  <input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#FAF0F0]/50 border border-transparent focus:border-[#C0132C]/20 focus:bg-white outline-none transition-all text-[0.95rem]"
                    placeholder="e.g. 1500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[0.7rem] font-bold uppercase tracking-widest text-[#7a5a5a] ml-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-[#FAF0F0]/50 border border-transparent focus:border-[#C0132C]/20 focus:bg-white outline-none transition-all text-[0.95rem] font-medium text-[#1A1A1A] cursor-pointer appearance-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column: Image & Badge */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[0.7rem] font-bold uppercase tracking-widest text-[#7a5a5a] ml-1">Product Image</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative group border-2 border-dashed rounded-[32px] transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center min-h-[220px] ${formData.imageUrl ? 'border-transparent' : 'border-[#C0132C]/10 hover:border-[#C0132C]/30 hover:bg-[#FAF0F0]/50'}`}
                >
                  {formData.imageUrl ? (
                    <>
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white">
                          <Upload size={24} />
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, imageUrl: '' });
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#C0132C] rounded-xl p-2 shadow-xl hover:bg-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-[#FAF0F0] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#C0132C]/40 group-hover:scale-110 transition-transform">
                        <Upload size={28} />
                      </div>
                      <p className="text-[0.85rem] font-bold text-[#8B0A2A] mb-1">{isUploading ? 'Processing...' : 'Upload Image'}</p>
                      <p className="text-[0.65rem] text-[#7a5a5a] opacity-60 uppercase tracking-widest">JPG, PNG up to 800KB</p>
                    </div>
                  )}
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[0.7rem] font-bold uppercase tracking-widest text-[#7a5a5a] ml-1">Description</label>
            <div className="relative">
              <Info className="absolute left-4 top-4 text-[#C0132C]/30" size={18} />
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#FAF0F0]/50 border border-transparent focus:border-[#C0132C]/20 focus:bg-white outline-none transition-all text-[0.95rem] h-32 resize-none"
                placeholder="Tell the story of this accessory..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[0.7rem] font-bold uppercase tracking-widest text-[#7a5a5a] ml-1">Badge (e.g. Bestseller)</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl bg-[#FAF0F0]/50 border border-transparent focus:border-[#C0132C]/20 focus:bg-white outline-none transition-all text-[0.95rem]"
                placeholder="Optional highlight badge"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[0.7rem] font-bold uppercase tracking-widest text-[#7a5a5a] ml-1">Badge Theme</label>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0132C]/30" size={18} />
                  <input
                    type="text"
                    value={formData.badgeColor}
                    onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#FAF0F0]/50 border border-transparent focus:border-[#C0132C]/20 focus:bg-white outline-none transition-all text-[0.95rem] font-mono"
                    placeholder="#C0132C"
                  />
                </div>
                <input
                  type="color"
                  value={formData.badgeColor}
                  onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                  className="w-16 h-14 p-1 rounded-2xl bg-[#FAF0F0]/50 border border-transparent cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={isUploading}
              className="flex-[2] bg-[#C0132C] text-white py-5 rounded-2xl font-bold text-[0.9rem] tracking-[0.15em] uppercase hover:bg-[#8B0A2A] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#C0132C]/20 active:scale-95 disabled:opacity-50"
            >
              <Check size={20} /> Finalize & Publish
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-[#FAF0F0] text-[#7a5a5a] py-5 rounded-2xl font-bold text-[0.9rem] tracking-[0.15em] uppercase hover:bg-[#F5E8E8] transition-all active:scale-95"
            >
              Discard
            </button>
          </div>
        </form>
      </motion.div>
      </div>
    </div>
  );
};

export default ProductForm;
