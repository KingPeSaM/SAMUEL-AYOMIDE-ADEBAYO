import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  LayoutDashboard, 
  Package, 
  LogOut, 
  X, 
  AlertTriangle, 
  Search, 
  Filter,
  TrendingUp,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import ProductForm from './ProductForm';

interface AdminDashboardProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct, onLogout }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const stats = useMemo(() => {
    const categories = new Set(products.map(p => p.category));
    return [
      { label: 'Total Products', value: products.length, icon: <Package size={20} />, color: 'bg-blue-50 text-blue-600' },
      { label: 'Categories', value: categories.size, icon: <Layers size={20} />, color: 'bg-purple-50 text-purple-600' },
      { label: 'Featured Items', value: products.filter(p => p.badge).length, icon: <TrendingUp size={20} />, color: 'bg-orange-50 text-orange-600' },
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  const productToDelete = products.find(p => p.id === deleteConfirmId);

  return (
    <div className="min-h-screen bg-[#FAF0F0] pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center p-3 shadow-lg shadow-[#C0132C]/10 border border-[#C0132C]/5">
                <img 
                  src="https://lh3.googleusercontent.com/d/1u0Uplg9oO8PDC_6arSNpvWnCXcOY-RRF" 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[0.75rem] font-bold tracking-[0.2em] uppercase text-[#C0132C]">Management Console</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-[#8B0A2A] leading-tight">
              Admin <em className="italic text-[#C0132C] not-italic">Dashboard</em>
            </h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-3 w-full lg:w-auto"
          >
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex-1 lg:flex-none bg-[#C0132C] text-white px-8 py-4 rounded-2xl font-bold text-[0.85rem] tracking-wider uppercase hover:bg-[#8B0A2A] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#C0132C]/20 active:scale-95"
            >
              <Plus size={18} /> Add New Product
            </button>
            <button
              onClick={onLogout}
              className="flex-1 lg:flex-none bg-white text-[#7a5a5a] px-8 py-4 rounded-2xl font-bold text-[0.85rem] tracking-wider uppercase border border-[#C0132C]/10 hover:bg-[#F5E8E8] transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <LogOut size={18} /> Logout
            </button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="bg-white p-6 rounded-[32px] shadow-sm border border-[#C0132C]/5 flex items-center gap-5"
            >
              <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[0.75rem] font-bold text-[#7a5a5a] uppercase tracking-wider mb-0.5">{stat.label}</p>
                <p className="text-2xl font-serif font-bold text-[#1A1A1A]">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-[32px] shadow-sm border border-[#C0132C]/5 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a5a5a]/40" size={18} />
            <input 
              type="text"
              placeholder="Search products by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#FAF0F0]/50 border border-transparent focus:border-[#C0132C]/20 focus:bg-white outline-none transition-all text-[0.9rem]"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter size={18} className="text-[#7a5a5a]/40 ml-2 hidden md:block" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 md:flex-none bg-[#FAF0F0]/50 border border-transparent focus:border-[#C0132C]/20 focus:bg-white px-6 py-3.5 rounded-2xl outline-none transition-all text-[0.85rem] font-medium text-[#7a5a5a] capitalize cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product List */}
        <div className="bg-white rounded-[40px] shadow-xl shadow-[#C0132C]/5 overflow-hidden border border-[#C0132C]/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#8B0A2A] text-white">
                  <th className="px-8 py-5 text-[0.75rem] font-bold uppercase tracking-[0.15em]">Product Details</th>
                  <th className="px-8 py-5 text-[0.75rem] font-bold uppercase tracking-[0.15em]">Category</th>
                  <th className="px-8 py-5 text-[0.75rem] font-bold uppercase tracking-[0.15em]">Price</th>
                  <th className="px-8 py-5 text-[0.75rem] font-bold uppercase tracking-[0.15em]">Status</th>
                  <th className="px-8 py-5 text-[0.75rem] font-bold uppercase tracking-[0.15em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C0132C]/5">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.length === 0 ? (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={5} className="px-8 py-24 text-center">
                        <div className="max-w-xs mx-auto">
                          <div className="w-20 h-20 bg-[#FAF0F0] rounded-[30px] flex items-center justify-center mx-auto mb-6 text-[#C0132C]/20">
                            <Package size={40} />
                          </div>
                          <h4 className="text-xl font-serif text-[#8B0A2A] mb-2">No Products Found</h4>
                          <p className="text-[0.85rem] text-[#7a5a5a] leading-relaxed">
                            {searchQuery || selectedCategory !== 'all' 
                              ? "We couldn't find any products matching your current filters."
                              : "Your catalog is currently empty. Start by adding your first beautiful accessory!"}
                          </p>
                          {(searchQuery || selectedCategory !== 'all') && (
                            <button 
                              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                              className="mt-6 text-[#C0132C] font-bold text-[0.75rem] uppercase tracking-widest hover:underline"
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <motion.tr 
                        key={product.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group hover:bg-[#FAF0F0]/30 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#F5E8E8] flex-shrink-0 border border-[#C0132C]/10 shadow-sm group-hover:scale-105 transition-transform duration-300">
                              <img 
                                src={product.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(product.name)}/200/200`} 
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-serif text-[1.1rem] font-bold text-[#1A1A1A] group-hover:text-[#C0132C] transition-colors">
                                {product.name}
                              </span>
                              <span className="text-[0.75rem] text-[#7a5a5a] line-clamp-1 max-w-[250px] mt-0.5 opacity-70">
                                {product.description}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-4 py-1.5 bg-[#F5E8E8] text-[#8B0A2A] rounded-xl text-[0.7rem] font-bold uppercase tracking-wider">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-serif text-[1.2rem] font-bold text-[#C0132C]">
                            ₦{product.price.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          {product.badge ? (
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: product.badgeColor || '#C0132C' }}
                              />
                              <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#1A1A1A]">
                                {product.badge}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#7a5a5a]/40 text-[0.7rem] font-medium uppercase tracking-wider italic">Standard</span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="w-10 h-10 flex items-center justify-center text-[#7a5a5a] hover:text-white hover:bg-[#8B0A2A] rounded-xl transition-all shadow-sm"
                              title="Edit Product"
                            >
                              <ArrowRight size={18} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(product.id)}
                              className="w-10 h-10 flex items-center justify-center text-[#7a5a5a] hover:text-white hover:bg-[#C0132C] rounded-xl transition-all shadow-sm hover:shadow-lg hover:shadow-[#C0132C]/20"
                              title="Delete Product"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {/* Footer Info */}
          <div className="px-8 py-4 bg-[#FAF0F0]/30 border-t border-[#C0132C]/5 flex justify-between items-center">
            <p className="text-[0.7rem] text-[#7a5a5a] font-medium uppercase tracking-widest">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C0132C]/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#C0132C]/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#C0132C]/60" />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(isFormOpen || editingProduct) && (
          <ProductForm
            initialData={editingProduct || undefined}
            onSubmit={(data) => {
              if (editingProduct) {
                onUpdateProduct(editingProduct.id, data);
                setEditingProduct(null);
              } else {
                onAddProduct(data);
                setIsFormOpen(false);
              }
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingProduct(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[2000] overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[40px] p-8 md:p-10 max-w-md w-full shadow-2xl text-center relative z-10 border border-[#C0132C]/10"
              >
              <div className="w-20 h-20 bg-[#F5E8E8] rounded-[30px] flex items-center justify-center mx-auto mb-8 text-[#C0132C] rotate-12">
                <AlertTriangle size={40} />
              </div>
              <h3 className="font-serif text-3xl text-[#8B0A2A] mb-4">Delete Product?</h3>
              <p className="text-[1rem] text-[#7a5a5a] mb-10 leading-relaxed">
                Are you sure you want to remove <strong className="text-[#1A1A1A]">"{productToDelete?.name}"</strong> from your catalog? This action is permanent.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    onDeleteProduct(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="flex-1 bg-[#C0132C] text-white py-4 rounded-2xl font-bold text-[0.85rem] tracking-wider uppercase hover:bg-[#8B0A2A] transition-all shadow-lg shadow-[#C0132C]/20 active:scale-95"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 bg-[#FAF0F0] text-[#7a5a5a] py-4 rounded-2xl font-bold text-[0.85rem] tracking-wider uppercase hover:bg-[#F5E8E8] transition-all active:scale-95"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
