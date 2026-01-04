import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Loader2, Copy, Check, Lock } from 'lucide-react';
import { javaCardService } from '../services/javaCardService';
import { GetRawDataResponse } from '../types/api';

interface RawDataPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RawDataPreviewModal = ({ isOpen, onClose }: RawDataPreviewModalProps) => {
  const [rawData, setRawData] = useState<GetRawDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'info' | 'image' | null>(null);

  // Fetch raw data when modal opens
  useEffect(() => {
    const fetchRawData = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await javaCardService.getRawData();
        setRawData(data);
      } catch (err: any) {
        console.error('Failed to fetch raw data:', err);
        setError(err.message || 'Failed to fetch encrypted data from card');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRawData();
  }, [isOpen]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setRawData(null);
      setError(null);
      setCopiedField(null);
    }
  }, [isOpen]);

  const handleCopy = async (data: string, field: 'info' | 'image') => {
    try {
      await navigator.clipboard.writeText(data);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-slate-950/80 backdrop-blur-sm'
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className='bg-slate-900 w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl border border-slate-800 shadow-2xl relative flex flex-col'
          >
            {/* Header */}
            <div className='p-6 border-b border-slate-800 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center'>
                  <Lock className='w-6 h-6 text-amber-400' />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-white'>Raw Encrypted Card Data</h2>
                  <p className='text-sm text-slate-400'>
                    For demo purposes - showing encrypted hex data
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className='p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Content */}
            <div className='p-6 overflow-y-auto flex-1'>
              {isLoading && (
                <div className='flex flex-col items-center justify-center py-12 text-slate-400'>
                  <Loader2 className='w-10 h-10 animate-spin mb-4' />
                  <p>Reading encrypted data from card...</p>
                </div>
              )}

              {error && !isLoading && (
                <div className='bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center'>
                  {error}
                </div>
              )}

              {rawData && !isLoading && (
                <div className='space-y-6'>
                  {/* Encrypted User Info */}
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <label className='text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2'>
                        <Database className='w-4 h-4' />
                        Encrypted User Info (Hex)
                      </label>
                      <button
                        onClick={() => handleCopy(rawData.encryptedUserInfo, 'info')}
                        className='flex items-center gap-1.5 px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors'
                      >
                        {copiedField === 'info' ? (
                          <>
                            <Check className='w-3.5 h-3.5 text-emerald-400' />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className='w-3.5 h-3.5' />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className='bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-40 overflow-y-auto'>
                      <code className='text-xs text-emerald-400 font-mono break-all leading-relaxed'>
                        {rawData.encryptedUserInfo || '(empty)'}
                      </code>
                    </div>
                  </div>

                  {/* Encrypted Image */}
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <label className='text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2'>
                        <Database className='w-4 h-4' />
                        Encrypted Image (Hex)
                      </label>
                      <button
                        onClick={() => handleCopy(rawData.encryptedImage, 'image')}
                        className='flex items-center gap-1.5 px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors'
                      >
                        {copiedField === 'image' ? (
                          <>
                            <Check className='w-3.5 h-3.5 text-emerald-400' />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className='w-3.5 h-3.5' />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className='bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-60 overflow-y-auto'>
                      <code className='text-xs text-cyan-400 font-mono break-all leading-relaxed'>
                        {rawData.encryptedImage || '(empty)'}
                      </code>
                    </div>
                  </div>

                  {/* Info note */}
                  <div className='bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300'>
                    <p className='font-medium mb-1'>🔐 This data is encrypted on the Java Card</p>
                    <p className='text-amber-400/80'>
                      The encrypted data above can only be decrypted using the card's internal
                      symmetric key. This demonstrates the secure storage capability of the Java
                      Card applet.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='p-4 border-t border-slate-800 bg-slate-900/50'>
              <button
                onClick={onClose}
                className='w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors'
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
