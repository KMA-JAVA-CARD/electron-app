import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Trash2, CreditCard, Minus } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import clsx from 'clsx';
import { CheckoutProcessModal } from '../components/CheckoutProcessModal';

// Mock Data
const PRODUCTS = [
  {
    id: '1',
    name: 'Yoga Class Drop-in',
    category: 'Training',
    price: 250000,
    image: 'https://www.myfooddiary.com/blog/asset/2868/yoga_class_2x.jpg',
  },
  {
    id: '2',
    name: 'Personal Training (1h)',
    category: 'Training',
    price: 800000,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
  },
  {
    id: '3',
    name: 'Deep Tissue Massage',
    category: 'Spa',
    price: 1200000,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80',
  },
  {
    id: '4',
    name: 'Aromatherapy Session',
    category: 'Spa',
    price: 950000,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&q=80',
  },
  {
    id: '5',
    name: 'Green Detox Smoothie',
    category: 'F&B',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80',
  },
  {
    id: '6',
    name: 'Protein Shake',
    category: 'F&B',
    price: 80000,
    image: 'https://images.unsplash.com/photo-1579722822174-a7900b79fdb4?w=400&q=80',
  },
];

const CATEGORIES = ['All', 'Training', 'Spa', 'F&B'];

export const POSPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cart, addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } =
    useStore();

  const filteredProducts =
    activeCategory === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleCheckoutSuccess = () => {
    clearCart();
  };

  return (
    <div className='flex h-full'>
      {/* Left: Product Grid */}
      <div className='flex-1 p-6 flex flex-col gap-6 overflow-hidden'>
        {/* Header & Filters */}
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-slate-100'>Service Menu</h1>
            <p className='text-slate-400 text-sm'>Select services or products</p>
          </div>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' />
            <input
              type='text'
              placeholder='Search...'
              className='bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 w-64'
            />
          </div>
        </div>

        {/* Categories */}
        <div className='flex gap-2'>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeCategory === cat
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800',
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className='flex-1 overflow-y-auto grid grid-cols-4 gap-4 pb-20'>
          {filteredProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={product.id}
              className={clsx(
                'bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-emerald-500/30 transition-all cursor-pointer flex flex-col',
                filteredProducts.length <= 4 && 'max-h-1/2',
              )}
              onClick={() => addToCart(product)}
            >
              <div className='h-3/4 bg-slate-800 relative overflow-hidden'>
                <img
                  src={product.image}
                  alt={product.name}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent' />
                <button className='absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0'>
                  <Plus className='w-5 h-5' />
                </button>
              </div>
              <div className='p-4 flex flex-col flex-1'>
                <span className='text-xs text-emerald-400 font-medium tracking-wider uppercase mb-1'>
                  {product.category}
                </span>
                <h3 className='font-semibold text-slate-100 leading-tight mb-2'>{product.name}</h3>
                <div className='mt-auto flex justify-between items-end'>
                  <span className='text-lg font-bold text-white'>
                    {product.price.toLocaleString()} ₫
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Cart Panel */}
      <div className='w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl z-10'>
        <div className='p-6 border-b border-slate-800'>
          <h2 className='text-xl font-bold flex items-center gap-2'>
            Cart
            <span className='text-sm font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full'>
              {cart.length} items
            </span>
          </h2>
        </div>

        <div className='flex-1 overflow-y-auto p-4 space-y-3'>
          {cart.length === 0 ? (
            <div className='h-full flex flex-col items-center justify-center text-slate-500 space-y-2 opacity-50'>
              <CreditCard className='w-12 h-12 stroke-1' />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className='flex gap-3 items-start bg-slate-950/50 p-3 rounded-xl border border-slate-800/50'
              >
                <img src={item.image} className='w-12 h-12 rounded-lg object-cover bg-slate-800' />
                <div className='flex-1 min-w-0'>
                  <h4 className='text-sm font-medium truncate'>{item.name}</h4>
                  <p className='text-emerald-400 font-semibold text-sm'>
                    {item.price.toLocaleString()} ₫
                  </p>
                  {item.quantity > 1 && (
                    <p className='text-xs text-slate-500'>
                      {item.quantity} × {item.price.toLocaleString()} ₫
                    </p>
                  )}
                </div>
                <div className='flex flex-col gap-2'>
                  {/* Quantity Controls */}
                  <div className='flex items-center gap-1 bg-slate-900 rounded-lg border border-slate-700'>
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className='p-1 hover:bg-slate-800 rounded-l-lg text-slate-400 hover:text-white transition-colors'
                    >
                      <Minus className='w-3 h-3' />
                    </button>
                    <span className='px-2 text-xs font-medium text-slate-300 min-w-[20px] text-center'>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className='p-1 hover:bg-slate-800 rounded-r-lg text-slate-400 hover:text-white transition-colors'
                    >
                      <Plus className='w-3 h-3' />
                    </button>
                  </div>
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className='p-1 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-slate-500 transition-colors self-center'
                  >
                    <Trash2 className='w-3 h-3' />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className='p-6 bg-slate-900 border-t border-slate-800 space-y-4'>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between text-slate-400'>
              <span>Subtotal</span>
              <span>{subtotal.toLocaleString()} ₫</span>
            </div>
            <div className='flex justify-between text-slate-400'>
              <span>Tax (10%)</span>
              <span>{tax.toLocaleString()} ₫</span>
            </div>
            <div className='flex justify-between text-lg font-bold text-white pt-2 border-t border-slate-800'>
              <span>Total</span>
              <span>{total.toLocaleString()} ₫</span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={cart.length === 0}
            className='w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            PAY / CHECKOUT
          </button>
        </div>
      </div>

      <CheckoutProcessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cartTotal={total}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
};
