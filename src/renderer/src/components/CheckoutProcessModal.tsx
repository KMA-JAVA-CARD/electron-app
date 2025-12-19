import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wifi,
  CreditCard,
  Coins,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';
import { javaCardService } from '../services/javaCardService';
import { backendService } from '../services/backendService';
import { PinInputModal } from './PinInputModal';
import { useStore } from '@renderer/hooks/useStore';
import { MemberCardResponse, TransactionResponse } from '@renderer/types/api';
import { TransactionType } from '@renderer/constants/enums';
import { CONVERSION_RATE } from '@renderer/constants';

interface CheckoutProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartTotal: number;
  onSuccess: () => void;
}

type CheckoutStep =
  | 'validating-reader'
  | 'verifying-pin'
  | 'fetching-data'
  | 'syncing-points'
  | 'selecting-payment'
  | 'confirming-payment'
  | 'processing-transaction'
  | 'success'
  | 'error';

// ============================================================================
// Step Components
// ============================================================================

interface ValidatingReaderStepProps {
  isProcessing: boolean;
}

const ValidatingReaderStep = ({ isProcessing }: ValidatingReaderStepProps) => (
  <div className='text-center space-y-6'>
    <div className='w-20 h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center'>
      {isProcessing ? (
        <Loader2 className='w-10 h-10 text-blue-500 animate-spin' />
      ) : (
        <Wifi className='w-10 h-10 text-blue-500' />
      )}
    </div>
    <div>
      <h3 className='text-xl font-bold text-slate-100 mb-2'>
        {isProcessing ? 'Checking Card Reader...' : 'Waiting for Card'}
      </h3>
      <p className='text-slate-400'>Please ensure card reader is connected and card is inserted</p>
    </div>
  </div>
);

const FetchingDataStep = () => (
  <div className='text-center space-y-6'>
    <div className='w-20 h-20 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center'>
      <Loader2 className='w-10 h-10 text-emerald-500 animate-spin' />
    </div>
    <div>
      <h3 className='text-xl font-bold text-slate-100 mb-2'>Loading Customer Data...</h3>
      <p className='text-slate-400'>Fetching account information</p>
    </div>
  </div>
);

const SyncingPointsStep = () => (
  <div className='text-center space-y-6'>
    <div className='w-20 h-20 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center'>
      <Loader2 className='w-10 h-10 text-amber-500 animate-spin' />
    </div>
    <div>
      <h3 className='text-xl font-bold text-slate-100 mb-2'>Synchronizing Points...</h3>
      <p className='text-slate-400'>Updating card balance</p>
    </div>
  </div>
);

interface SelectingPaymentStepProps {
  memberData: MemberCardResponse;
  cartTotal: number;
  isProcessing: boolean;
  hasEnoughPoints: boolean;
  convertToPoints: (price: number) => number;
  onSelectPayment: (type: TransactionType) => void;
}

const SelectingPaymentStep = ({
  memberData,
  cartTotal,
  isProcessing,
  hasEnoughPoints,
  convertToPoints,
  onSelectPayment,
}: SelectingPaymentStepProps) => (
  <div className='space-y-6'>
    <div className='bg-slate-800/50 rounded-xl p-4 border border-slate-700'>
      <div className='flex justify-between items-center'>
        <span className='text-slate-400'>Available Points:</span>
        <span className='text-2xl font-bold text-amber-400'>
          {memberData.pointBalance.toLocaleString()} pts
        </span>
      </div>
    </div>

    <div className='space-y-3'>
      <h3 className='text-lg font-bold text-slate-100'>Select Payment Method</h3>

      {/* Pay & Earn Points */}
      <button
        onClick={() => onSelectPayment(TransactionType.EARN)}
        disabled={isProcessing}
        className='w-full p-6 bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/30 hover:border-emerald-500 rounded-2xl transition-all group disabled:opacity-50'
      >
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors'>
            <TrendingUp className='w-6 h-6 text-emerald-500 group-hover:text-white' />
          </div>
          <div className='flex-1 text-left'>
            <h4 className='font-bold text-slate-100'>Pay with Cash/Card</h4>
            <p className='text-sm text-slate-400'>Amount: {cartTotal.toLocaleString()} VND</p>
          </div>
          <div className='text-right'>
            <p className='text-xs text-emerald-400'>Earn Points</p>
            <p className='text-lg font-bold text-emerald-400'>{convertToPoints(cartTotal)}</p>
          </div>
        </div>
      </button>

      {/* Redeem Points */}
      <button
        onClick={() => onSelectPayment(TransactionType.REDEEM)}
        disabled={isProcessing || !hasEnoughPoints}
        className={clsx(
          'w-full p-6 border-2 rounded-2xl transition-all group',
          hasEnoughPoints
            ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 hover:border-amber-500'
            : 'bg-slate-800/50 border-slate-700 opacity-50 cursor-not-allowed',
        )}
      >
        <div className='flex items-center gap-4'>
          <div
            className={clsx(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              hasEnoughPoints ? 'bg-amber-500/20 group-hover:bg-amber-500' : 'bg-slate-700',
            )}
          >
            <Coins
              className={clsx(
                'w-6 h-6',
                hasEnoughPoints ? 'text-amber-500 group-hover:text-white' : 'text-slate-500',
              )}
            />
          </div>
          <div className='flex-1 text-left'>
            <h4 className='font-bold text-slate-100'>Redeem with Points</h4>
            <p className='text-sm text-slate-400'>
              {hasEnoughPoints ? 'Use your points balance' : 'Insufficient points'}
            </p>
          </div>
          <div className='text-right'>
            <p className='text-xs text-amber-400'>Points Used</p>
            <p className='text-lg font-bold text-amber-400'>{convertToPoints(cartTotal)}</p>
          </div>
        </div>
      </button>
    </div>
  </div>
);

interface ConfirmingPaymentStepProps {
  paymentMethod: TransactionType;
  memberData: MemberCardResponse;
  cartTotal: number;
  isProcessing: boolean;
  convertToPoints: (price: number) => number;
  onBack: () => void;
  onConfirm: () => void;
}

const ConfirmingPaymentStep = ({
  paymentMethod,
  memberData,
  cartTotal,
  isProcessing,
  convertToPoints,
  onBack,
  onConfirm,
}: ConfirmingPaymentStepProps) => (
  <div className='space-y-6'>
    <div className='text-center'>
      <h3 className='text-xl font-bold text-slate-100 mb-2'>Confirm Transaction</h3>
      <p className='text-slate-400'>Please review and confirm your payment</p>
    </div>

    <div className='bg-slate-800/50 rounded-xl p-6 space-y-4'>
      <div className='flex justify-between items-center pb-4 border-b border-slate-700'>
        <span className='text-slate-400'>Payment Method:</span>
        <span
          className={clsx(
            'font-bold text-lg',
            paymentMethod === TransactionType.EARN ? 'text-emerald-400' : 'text-amber-400',
          )}
        >
          {paymentMethod === TransactionType.EARN ? 'Pay & Earn Points' : 'Redeem Points'}
        </span>
      </div>

      <div className='flex justify-between'>
        <span className='text-slate-400'>Total Amount:</span>
        <span className='font-bold text-white text-lg'>{cartTotal.toLocaleString()} VND</span>
      </div>

      {paymentMethod === TransactionType.EARN ? (
        <div className='flex justify-between'>
          <span className='text-slate-400'>Points to Earn:</span>
          <span className='font-bold text-emerald-400 text-lg'>
            +{convertToPoints(cartTotal)} pts
          </span>
        </div>
      ) : (
        <>
          <div className='flex justify-between'>
            <span className='text-slate-400'>Points to Use:</span>
            <span className='font-bold text-amber-400 text-lg'>
              -{convertToPoints(cartTotal)} pts
            </span>
          </div>
          <div className='flex justify-between pt-3 border-t border-slate-700'>
            <span className='text-slate-400'>Current Balance:</span>
            <span className='font-bold text-slate-300'>
              {memberData.pointBalance.toLocaleString()} pts
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-400'>After Transaction:</span>
            <span className='font-bold text-amber-400'>
              {(memberData.pointBalance - convertToPoints(cartTotal)).toLocaleString()} pts
            </span>
          </div>
        </>
      )}
    </div>

    <div className='flex gap-3'>
      <button
        onClick={onBack}
        disabled={isProcessing}
        className='flex-1 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition disabled:opacity-50'
      >
        Back
      </button>
      <button
        onClick={onConfirm}
        disabled={isProcessing}
        className='flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2'
      >
        Confirm & Pay
      </button>
    </div>
  </div>
);

interface ProcessingTransactionStepProps {
  paymentMethod: TransactionType | null;
}

const ProcessingTransactionStep = ({ paymentMethod }: ProcessingTransactionStepProps) => (
  <div className='text-center space-y-6'>
    <div className='w-20 h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center'>
      <Loader2 className='w-10 h-10 text-blue-500 animate-spin' />
    </div>
    <div>
      <h3 className='text-xl font-bold text-slate-100 mb-2'>Processing Transaction...</h3>
      <p className='text-slate-400'>
        {paymentMethod === TransactionType.EARN ? 'Payment' : 'Redemption'} in progress
      </p>
    </div>
  </div>
);

interface SuccessStepProps {
  transactionResult: TransactionResponse;
  cartTotal: number;
  onComplete: () => void;
}

const SuccessStep = ({ transactionResult, cartTotal, onComplete }: SuccessStepProps) => (
  <div className='text-center space-y-6'>
    <div className='w-20 h-20 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center'>
      <CheckCircle2 className='w-10 h-10 text-emerald-500' />
    </div>
    <div>
      <h3 className='text-2xl font-bold text-slate-100 mb-2'>Transaction Successful!</h3>
      <p className='text-slate-400'>Transaction ID: {transactionResult.transactionId}</p>
    </div>

    <div className='bg-slate-800/50 rounded-xl p-6 space-y-3'>
      <div className='flex justify-between'>
        <span className='text-slate-400'>Amount:</span>
        <span className='font-bold text-white'>{cartTotal.toLocaleString()} VND</span>
      </div>
      <div className='flex justify-between'>
        <span className='text-slate-400'>Points Change:</span>
        <span
          className={clsx(
            'font-bold',
            transactionResult.pointChange > 0 ? 'text-emerald-400' : 'text-amber-400',
          )}
        >
          {transactionResult.pointChange > 0 ? '+' : ''}
          {transactionResult.pointChange.toLocaleString()} pts
        </span>
      </div>
      <div className='flex justify-between pt-3 border-t border-slate-700'>
        <span className='text-slate-400'>New Balance:</span>
        <span className='font-bold text-amber-400'>
          {transactionResult.newBalance.toLocaleString()} pts
        </span>
      </div>
    </div>

    <button
      onClick={onComplete}
      className='w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition'
    >
      Complete
    </button>
  </div>
);

interface ErrorStepProps {
  error: string | null;
  onCancel: () => void;
  onRetry: () => void;
}

const ErrorStep = ({ error, onCancel, onRetry }: ErrorStepProps) => (
  <div className='text-center space-y-6'>
    <div className='w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center'>
      <AlertCircle className='w-10 h-10 text-red-500' />
    </div>
    <div>
      <h3 className='text-xl font-bold text-slate-100 mb-2'>Error</h3>
      <p className='text-red-400'>{error}</p>
    </div>

    <div className='flex gap-3'>
      <button
        onClick={onCancel}
        className='flex-1 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition'
      >
        Cancel
      </button>
      <button
        onClick={onRetry}
        className='flex-1 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition flex items-center justify-center gap-2'
      >
        <RefreshCw className='w-4 h-4' />
        Retry
      </button>
    </div>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export const CheckoutProcessModal = ({
  isOpen,
  onClose,
  cartTotal,
  onSuccess,
}: CheckoutProcessModalProps) => {
  const [step, setStep] = useState<CheckoutStep>('validating-reader');
  const [cardId, setCardId] = useState<string | null>(null);
  const [memberData, setMemberData] = useState<MemberCardResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<TransactionType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactionResult, setTransactionResult] = useState<TransactionResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // PIN Modal states
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const { cart } = useStore();

  // Validate card reader and card on mount
  useEffect(() => {
    if (isOpen) {
      validateCardReader();
    }
  }, [isOpen]);

  // Reset state when modal closes
  const handleClose = () => {
    setStep('validating-reader');
    setCardId(null);
    setMemberData(null);
    setPaymentMethod(null);
    setError(null);
    setTransactionResult(null);
    setIsPinModalOpen(false);
    setPinError(null);
    setRemainingAttempts(null);
    onClose();
  };

  // Step 1: Validate Card Reader & Card
  const validateCardReader = async () => {
    setStep('validating-reader');
    setError(null);
    setIsProcessing(true);

    try {
      await javaCardService.checkConnection();
      const cardResponse = await javaCardService.getCardId();
      const id = cardResponse.result;

      if (!id || id === '' || /^0+$/.test(id)) {
        setError('No card detected. Please insert a customer card.');
        setStep('error');
        setIsProcessing(false);
        return;
      }

      if (id.includes('.BLOCKED')) {
        setError('Card is BLOCKED. Please use Reset PIN in Dashboard.');
        setStep('error');
        setIsProcessing(false);
        return;
      }

      setCardId(id);
      setStep('verifying-pin');
      setIsPinModalOpen(true);
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Card validation error:', err);
      setError('Card reader not connected. Please connect the reader and try again.');
      setStep('error');
      setIsProcessing(false);
    }
  };

  // Step 2: RSA Challenge Verification
  const verifyCardChallenge = async (): Promise<boolean> => {
    if (!cardId) return false;

    try {
      const challengeRes = await backendService.getChallenge();
      const signatureRes = await javaCardService.signChallenge(challengeRes.challenge);
      const verifyRes = await backendService.verifyChallenge({
        cardSerial: cardId,
        challenge: challengeRes.challenge,
        signature: signatureRes.result,
      });

      return verifyRes.success;
    } catch (err) {
      console.error('Challenge verification failed:', err);
      return false;
    }
  };

  // Step 2: PIN Verification Handler
  const handlePinVerification = async (pin: string) => {
    if (!cardId) return;

    setIsProcessing(true);
    setPinError(null);
    setRemainingAttempts(null);

    try {
      const verifyRes = await javaCardService.verifyPin(pin);

      if (verifyRes.sw === '9000' && verifyRes.success) {
        const challengeVerified = await verifyCardChallenge();

        if (!challengeVerified) {
          setPinError('Security verification failed. Please try again.');
          setIsProcessing(false);
          return;
        }

        setIsPinModalOpen(false);
        await fetchAndSyncData(pin);
      } else if (verifyRes.sw === '6983' || verifyRes.remainingTries === 0) {
        setPinError('Card is LOCKED! Please use Reset PIN.');
        setRemainingAttempts(0);
        setIsProcessing(false);
      } else if (!verifyRes.success && verifyRes.sw?.startsWith('63c')) {
        setPinError('Incorrect PIN.');
        setRemainingAttempts(verifyRes.remainingTries);
        setIsProcessing(false);
      } else {
        setPinError('Verification failed.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setPinError(err.message || 'Error verifying PIN');
      setIsProcessing(false);
    }
  };

  // Step 3: Fetch & Sync Data
  const fetchAndSyncData = async (pin: string) => {
    if (!cardId) return;

    setStep('fetching-data');
    setIsProcessing(true);

    try {
      const [cardInfo, memberInfo] = await Promise.all([
        javaCardService.getSecureInfo(pin),
        backendService.getMemberInfo(cardId),
      ]);

      setMemberData(memberInfo);

      if (cardInfo.points !== memberInfo.pointBalance) {
        setStep('syncing-points');
        await javaCardService.updatePoints(memberInfo.pointBalance);
      }

      setStep('selecting-payment');
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Data fetch error:', err);
      setError('Failed to fetch customer data. Please try again.');
      setStep('error');
      setIsProcessing(false);
    }
  };

  // Step 4: Process Checkout
  const processCheckout = async (type: TransactionType) => {
    if (!cardId || !memberData) return;

    setPaymentMethod(type);
    setStep('processing-transaction');
    setIsProcessing(true);

    try {
      const timestamp = Date.now().toString();
      const amount = Math.floor(cartTotal);
      const dataToSign = `${type}|${amount}|${timestamp}`;
      const hexData = stringToHex(dataToSign);
      const signatureRes = await javaCardService.signChallenge(hexData);

      const transactionRes = await backendService.processTransaction(cardId, {
        type,
        amount,
        timestamp,
        description: `${timestamp} ${type === TransactionType.EARN ? 'Payment' : 'Redemption'} ${cartTotal} | ${cart.map((item, index) => `${index + 1}. ${item.name}`).join(', ')}`,
        signature: signatureRes.result,
      });

      await javaCardService.updatePoints(transactionRes.newBalance);

      setTransactionResult(transactionRes);
      setStep('success');
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed. Please try again.');
      setStep('error');
      setIsProcessing(false);
    }
  };

  // Helper: Convert string to hex
  const stringToHex = (str: string): string => {
    return Array.from(str)
      .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  };

  const convertToPoints = (price: number): number => {
    return Math.floor(price / CONVERSION_RATE);
  };

  const hasEnoughPoints = memberData
    ? memberData.pointBalance >= convertToPoints(cartTotal)
    : false;

  const handleSelectPayment = (type: TransactionType) => {
    setPaymentMethod(type);
    setStep('confirming-payment');
  };

  const handleConfirmBack = () => {
    setStep('selecting-payment');
    setPaymentMethod(null);
  };

  const handleConfirmPay = () => {
    if (paymentMethod) {
      processCheckout(paymentMethod);
    }
  };

  const handleComplete = () => {
    onSuccess();
    handleClose();
  };

  return (
    <>
      <PinInputModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setStep('validating-reader');
        }}
        onSubmit={handlePinVerification}
        title='Enter PIN to Proceed'
        error={pinError}
        isLoading={isProcessing}
        remainingAttempts={remainingAttempts}
      />

      <AnimatePresence>
        {isOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='absolute inset-0 bg-slate-950/90 backdrop-blur-md'
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className='relative bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden'
            >
              {/* Header */}
              <div className='bg-gradient-to-r from-emerald-600 to-teal-500 p-6 relative overflow-hidden'>
                <div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")] opacity-20' />
                <button
                  onClick={handleClose}
                  disabled={isProcessing && step !== 'error'}
                  className='absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-white transition-colors disabled:opacity-50'
                >
                  <X className='w-5 h-5' />
                </button>
                <div className='relative'>
                  <h2 className='text-2xl font-bold text-white flex items-center gap-2'>
                    <CreditCard className='w-6 h-6' />
                    Checkout
                  </h2>
                  <p className='text-emerald-100 mt-1'>Total: {cartTotal.toLocaleString()} VND</p>
                </div>
              </div>

              {/* Content */}
              <div className='p-8'>
                {step === 'validating-reader' && (
                  <ValidatingReaderStep isProcessing={isProcessing} />
                )}
                {step === 'fetching-data' && <FetchingDataStep />}
                {step === 'syncing-points' && <SyncingPointsStep />}
                {step === 'selecting-payment' && memberData && (
                  <SelectingPaymentStep
                    memberData={memberData}
                    cartTotal={cartTotal}
                    isProcessing={isProcessing}
                    hasEnoughPoints={hasEnoughPoints}
                    convertToPoints={convertToPoints}
                    onSelectPayment={handleSelectPayment}
                  />
                )}
                {step === 'confirming-payment' && paymentMethod && memberData && (
                  <ConfirmingPaymentStep
                    paymentMethod={paymentMethod}
                    memberData={memberData}
                    cartTotal={cartTotal}
                    isProcessing={isProcessing}
                    convertToPoints={convertToPoints}
                    onBack={handleConfirmBack}
                    onConfirm={handleConfirmPay}
                  />
                )}
                {step === 'processing-transaction' && (
                  <ProcessingTransactionStep paymentMethod={paymentMethod} />
                )}
                {step === 'success' && transactionResult && (
                  <SuccessStep
                    transactionResult={transactionResult}
                    cartTotal={cartTotal}
                    onComplete={handleComplete}
                  />
                )}
                {step === 'error' && (
                  <ErrorStep error={error} onCancel={handleClose} onRetry={validateCardReader} />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
