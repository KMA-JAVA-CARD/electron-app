import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  KeyRound,
  ShieldAlert,
  Wifi,
  Loader2,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  CreditCard,
  Ban, // Added Ban icon
} from 'lucide-react';
import clsx from 'clsx';
import { javaCardService } from '../services/javaCardService';
import { backendService } from '../services/backendService';
import { PinInputModal } from '../components/PinInputModal';
import { ChangePinModal } from '../components/ChangePinModal';
import { MemberCardModal } from '../components/MemberCardModal';
import { MemberProfileModal } from '../components/MemberProfileModal';
import { MemberCardResponse, SecureInfoResponse } from '../types/api';

export const Dashboard = () => {
  // ... rest of component
  const [cardId, setCardId] = useState<string | null>(null);
  const [isEmptyCard, setIsEmptyCard] = useState(false);
  const [isBlockedCard, setIsBlockedCard] = useState(false); // New State
  const [isReaderConnected, setIsReaderConnected] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedPin, setAuthenticatedPin] = useState<string | null>(null);

  // Modal States
  const [activeModal, setActiveModal] = useState<
    | 'auth-pin'
    | 'info-pin'
    | 'change-verify-old'
    | 'change-pin-new'
    | 'member-card'
    | 'profile'
    | 'reset-confirm'
    | null
  >(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Temporary Data for Flows
  const [tempOldPin, setTempOldPin] = useState<string | null>(null);

  // Data States
  const [memberData, setMemberData] = useState<MemberCardResponse | null>(null);
  const [secureInfo, setSecureInfo] = useState<SecureInfoResponse | null>(null);
  const [cardImageHex, setCardImageHex] = useState<string | null>(null);

  // Debug Log
  console.log('secureInfo', secureInfo);

  // Core Check Function (Connection + Card ID)
  const refreshStatus = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Check Connection
      await javaCardService.checkConnection();
      setIsReaderConnected(true);

      // 2. Get Card ID
      try {
        const response = await javaCardService.getCardId();
        let id = response.result;

        if (id) {
          // Check for BLOCKED status
          if (id.includes('.BLOCKED')) {
            setIsBlockedCard(true);
            id = id.replace('.BLOCKED', ''); // Strip suffix to get clean ID
          } else {
            setIsBlockedCard(false);
          }

          if (/^0+$/.test(id)) {
            // Card exists but is empty/blank
            setIsEmptyCard(true);
            setCardId(id);
          } else {
            // Valid Card
            setIsEmptyCard(false);
            setCardId(id);
          }
        } else {
          setCardId(null);
          setIsEmptyCard(false);
          setIsBlockedCard(false);
        }
      } catch (cardErr) {
        setCardId(null);
        setIsEmptyCard(false);
        setIsBlockedCard(false);
      }
    } catch (error) {
      console.error('Reader check failed:', error);
      setIsReaderConnected(false);
      setCardId(null);
      setIsEmptyCard(false);
      setIsBlockedCard(false);
    } finally {
      setLastCheck(new Date());
      setIsRefreshing(false);
    }
  }, []);

  // Initial Check on Mount
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Auto-open PIN Modal when valid card is detected
  useEffect(() => {
    if (cardId && !isEmptyCard && !isBlockedCard && !isAuthenticated) {
      setActiveModal('auth-pin');
      setModalError(null);
      setRemainingAttempts(null);
    }
  }, [cardId, isEmptyCard, isBlockedCard, isAuthenticated]);

  // Clear authentication when card changes or is removed
  useEffect(() => {
    setIsAuthenticated(false);
    setAuthenticatedPin(null);
  }, [cardId]);

  // -- Features --

  // RSA Challenge-Response Verification
  // This function executes the 3-step challenge verification process
  // MUST be called immediately after successful PIN verification while card is in authenticated state
  const verifyCardChallenge = async (): Promise<boolean> => {
    if (!cardId) {
      console.error('Cannot verify challenge: No card ID');
      return false;
    }

    try {
      // Step 2: Fetch Challenge from Backend
      const challengeRes = await backendService.getChallenge();
      const challenge = challengeRes.challenge;

      // Step 3: Sign Challenge with Card (uses authenticated state from PIN verification)
      const signatureRes = await javaCardService.signChallenge(challenge);
      const signature = signatureRes.result;

      // Step 4: Verify Signature on Backend
      const verifyRes = await backendService.verifyChallenge({
        cardSerial: cardId,
        challenge,
        signature,
      });

      if (!verifyRes.success) {
        console.error('Challenge verification failed:', verifyRes.message);
        return false;
      }

      return true;
    } catch (err: any) {
      console.error('Error during challenge verification:', err);
      return false;
    }
  };

  // 0. Initial Authentication (Auto-triggered on card detection)
  const handleAuthenticatePin = async (pin: string) => {
    setIsLoading(true);
    setModalError(null);
    setRemainingAttempts(null);
    try {
      // Step 1: Verify PIN (sets card to authenticated state)
      const verifyRes = await javaCardService.verifyPin(pin);

      if (verifyRes.sw === '9000' && verifyRes.success) {
        // PIN verification successful - card is now in authenticated state
        // Immediately execute RSA challenge verification
        const challengeVerified = await verifyCardChallenge();

        if (!challengeVerified) {
          setModalError('Security verification failed. Please try again.');
          setIsAuthenticated(false);
          return;
        }

        // Both PIN and challenge verification successful
        setIsAuthenticated(true);
        setAuthenticatedPin(pin);
        setActiveModal(null);
      } else if (verifyRes.sw === '6983' || verifyRes.remainingTries === 0) {
        setModalError('Card is LOCKED! Please use Reset PIN.');
        setRemainingAttempts(0);
        setIsBlockedCard(true);
        setIsAuthenticated(false);
      } else if (!verifyRes.success && verifyRes.sw?.startsWith('63c')) {
        setModalError(`Incorrect PIN.`);
        setRemainingAttempts(verifyRes.remainingTries);
      } else {
        setModalError('Verification failed.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Error verifying PIN');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Check Info (No PIN required - uses authenticated PIN)
  const handleCheckInfo = async () => {
    if (!authenticatedPin) {
      alert('Session expired. Please re-authenticate.');
      setIsAuthenticated(false);
      return;
    }

    setIsLoading(true);
    setCardImageHex(null);
    try {
      // Parallel Fetch: Secure Info + Card Image
      const [infoRes, imageRes] = await Promise.all([
        javaCardService.getSecureInfo(authenticatedPin),
        javaCardService.getCardImage(),
      ]);
      setSecureInfo(infoRes);
      setCardImageHex(imageRes.result);

      setActiveModal('member-card');
    } catch (err: any) {
      console.error('Failed to fetch card info:', err);
      alert(err.message || 'Error fetching card information');
    } finally {
      setIsLoading(false);
    }
  };

  // 1b. View Full Details (triggered from MemberCardModal)
  const handleViewDetails = async () => {
    setIsLoading(true);
    // Fetch backend info here
    if (cardId && !isEmptyCard) {
      try {
        const memberRes = await backendService.getMemberInfo(cardId);
        setMemberData(memberRes);
        setActiveModal('profile');
      } catch (e) {
        console.warn('Could not fetch backend member data', e);
        // Even if backend fails, show what we have
        setActiveModal('profile');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 2. Change PIN - Step 1: Verify Old PIN
  const handleVerifyOldPin = async (pin: string) => {
    setIsLoading(true);
    setModalError(null);
    setRemainingAttempts(null);
    try {
      // Step 1: Verify PIN (sets card to authenticated state)
      const verifyRes = await javaCardService.verifyPin(pin);

      if (verifyRes.sw === '9000' && verifyRes.success) {
        // PIN verification successful - execute RSA challenge verification
        const challengeVerified = await verifyCardChallenge();

        if (!challengeVerified) {
          setModalError('Security verification failed. Please try again.');
          return;
        }

        // Both PIN and challenge verification successful - proceed to new PIN input
        setTempOldPin(pin);
        setActiveModal('change-pin-new');
      } else if (verifyRes.sw === '6983' || verifyRes.remainingTries === 0) {
        setModalError('Card is LOCKED! Please use Reset PIN.');
        setRemainingAttempts(0);
      } else if (!verifyRes.success && verifyRes.sw?.startsWith('63c')) {
        setModalError(`Incorrect PIN.`);
        setRemainingAttempts(verifyRes.remainingTries);
      } else {
        setModalError('Verification failed.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Error verifying PIN');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Change PIN - Step 2: Set New PIN
  const handleChangePinSubmit = async (newPin: string) => {
    if (!tempOldPin) {
      setModalError('Session expired. Please start over.');
      setActiveModal('change-verify-old');
      return;
    }

    setIsLoading(true);
    setModalError(null);
    try {
      const res = await javaCardService.changePin(tempOldPin, newPin);
      if (res.sw === '9000') {
        setActiveModal(null);
        setTempOldPin(null);
        alert('PIN updated successfully!');
      } else {
        setModalError('Failed to change PIN.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to change PIN');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Reset PIN / Unblock Card
  const handleResetPin = async () => {
    setIsLoading(true);
    try {
      // Step 1: Unblock the card (this will empty card data)
      const res = await javaCardService.unblockPin();

      if (res.success && res.sw === '9000') {
        // Step 2: Fetch member info from backend to restore card data
        if (cardId && !isEmptyCard) {
          try {
            const memberInfo = await backendService.getMemberInfo(cardId);

            // Step 3: The default PIN now is "123456"
            const defaultPin = '123456';

            // Format dob to yyyy-MM-dd if it exists
            let dobFormatted = '';
            if (memberInfo.user.dob) {
              const dobDate = new Date(memberInfo.user.dob);
              dobFormatted = dobDate.toISOString().split('T')[0]; // yyyy-MM-dd
            }

            await javaCardService.updateCardInfo({
              pin: defaultPin,
              fullName: memberInfo.user.fullName,
              dob: dobFormatted,
              address: memberInfo.user.address || '',
              phone: memberInfo.user.phone,
            });

            setActiveModal(null);
            setRemainingAttempts(null);
            setIsBlockedCard(false);
            alert(
              'Card reset/unblocked successfully! Data restored from database. Default PIN: 123456',
            );
            refreshStatus();
          } catch (restoreErr: any) {
            console.error('Failed to restore card data:', restoreErr);
            setActiveModal(null);
            setIsBlockedCard(false);
            alert(
              'Card unblocked but failed to restore data: ' +
                (restoreErr.message || 'Unknown error'),
            );
            refreshStatus();
          }
        } else {
          // No backend data to restore
          setActiveModal(null);
          setRemainingAttempts(null);
          setIsBlockedCard(false);
          alert('Card unblocked. PIN reset to default (123456). No data to restore.');
          refreshStatus();
        }
      } else {
        alert('Failed to unblock card: ' + (res.message || 'Unknown error'));
      }
    } catch (err: any) {
      alert(err.message || 'Error executing Reset PIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex h-full gap-6 p-6'>
      {/* Authentication/PIN Input Modal - Used for initial auth & Change PIN verification */}
      <PinInputModal
        isOpen={activeModal === 'auth-pin' || activeModal === 'change-verify-old'}
        onClose={() => setActiveModal(null)}
        onSubmit={activeModal === 'change-verify-old' ? handleVerifyOldPin : handleAuthenticatePin}
        title={
          activeModal === 'change-verify-old' ? 'Enter Current PIN' : 'Enter PIN to Authenticate'
        }
        error={modalError}
        isLoading={isLoading}
        remainingAttempts={remainingAttempts}
      />

      <ChangePinModal
        isOpen={activeModal === 'change-pin-new'}
        onClose={() => setActiveModal(null)}
        onSubmit={handleChangePinSubmit}
        error={modalError}
        isLoading={isLoading}
      />

      <MemberCardModal
        isOpen={activeModal === 'member-card'}
        onClose={() => setActiveModal(null)}
        onViewDetails={handleViewDetails}
        secureInfo={secureInfo}
        cardImageHex={cardImageHex}
        cardId={cardId}
      />

      <MemberProfileModal
        isOpen={activeModal === 'profile'}
        onClose={() => setActiveModal(null)}
        member={memberData}
        secureInfo={secureInfo}
      />

      <AnimatePresence>
        {activeModal === 'reset-confirm' && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm'>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className='bg-slate-900 border border-red-500/30 p-8 rounded-3xl max-w-sm w-full text-center'
            >
              <div className='w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6'>
                <ShieldAlert className='w-8 h-8 text-red-500' />
              </div>
              <h3 className='text-xl font-bold text-white mb-2'>Reset Card PIN?</h3>
              <p className='text-slate-400 mb-8'>
                This will unblock the card and reset the PIN to the default <strong>123456</strong>.
              </p>

              <div className='flex gap-3'>
                <button
                  onClick={() => setActiveModal(null)}
                  className='flex-1 py-3 text-slate-400 hover:bg-slate-800 rounded-xl transition'
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPin}
                  disabled={isLoading}
                  className='flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/20'
                >
                  {isLoading ? (
                    <Loader2 className='w-5 h-5 animate-spin mx-auto' />
                  ) : (
                    'Confirm Reset'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEFT PANEL: Reader Status (35%) */}
      <div className='w-[35%] flex flex-col gap-6'>
        <div className='bg-slate-900 rounded-3xl border border-slate-800 p-8 flex-1 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl'>
          <div className='absolute top-6 right-6 flex items-center gap-2'>
            <span className='text-xs font-mono text-slate-500'>
              {lastCheck.toLocaleTimeString()}
            </span>
            <div
              className={clsx(
                'w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]',
                !isReaderConnected
                  ? 'bg-red-500/50'
                  : cardId
                    ? isBlockedCard
                      ? 'bg-red-600 shadow-red-600/50 animate-pulse'
                      : isEmptyCard
                        ? 'bg-amber-500 shadow-amber-500/50'
                        : 'bg-emerald-500 shadow-emerald-500/50'
                    : 'bg-slate-500/50 animate-pulse',
              )}
            />
          </div>

          <div className='relative z-10 flex flex-col items-center text-center'>
            <AnimatePresence mode='wait'>
              {!isReaderConnected ? (
                /* DISCONNECTED STATE */
                <motion.div
                  key='disconnected'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='flex flex-col items-center'
                >
                  <div className='w-48 h-32 bg-red-500/5 rounded-xl border-2 border-dashed border-red-500/20 mb-8 flex items-center justify-center'>
                    <AlertOctagon className='w-10 h-10 text-red-500' />
                  </div>
                  <h2 className='text-xl font-bold text-red-400 mb-2'>Reader Not Found</h2>
                  <p className='text-slate-500 text-sm max-w-[200px] mb-6'>
                    Please ensure the Java Card reader is connected.
                  </p>
                </motion.div>
              ) : cardId ? (
                /* CONNECTED & CARD DETECTED (Valid, Empty, or BLOCKED) */
                <motion.div
                  key='card-connected'
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className='flex flex-col items-center'
                >
                  <div
                    className={clsx(
                      'w-48 h-32 rounded-xl shadow-2xl mb-8 flex items-center justify-center border-t border-white/20 relative overflow-hidden',
                      isBlockedCard
                        ? 'bg-gradient-to-br from-red-600 to-rose-700 shadow-red-500/20'
                        : isEmptyCard
                          ? 'bg-gradient-to-br from-amber-600 to-orange-700 shadow-amber-500/20'
                          : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20',
                    )}
                  >
                    <div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")] opacity-20' />
                    {isBlockedCard ? (
                      <div className='flex flex-col items-center text-red-100'>
                        <Ban className='w-12 h-12 drop-shadow-md mb-1' />
                        <span className='text-xs font-bold uppercase tracking-widest'>LOCKED</span>
                      </div>
                    ) : isEmptyCard ? (
                      <div className='flex flex-col items-center text-amber-100'>
                        <CreditCard className='w-12 h-12 drop-shadow-md mb-1 opacity-80' />
                        <span className='text-xs font-bold uppercase tracking-widest'>
                          Blank Card
                        </span>
                      </div>
                    ) : (
                      <Wifi className='w-12 h-12 text-white drop-shadow-md' />
                    )}
                  </div>

                  <h2
                    className={clsx(
                      'text-2xl font-bold mb-2',
                      isBlockedCard
                        ? 'text-red-500'
                        : isEmptyCard
                          ? 'text-amber-400'
                          : 'text-white',
                    )}
                  >
                    {isBlockedCard
                      ? 'Card Blocked'
                      : isEmptyCard
                        ? 'Empty Card Detected'
                        : 'Card Detected'}
                  </h2>
                  <div className='bg-slate-950/50 px-4 py-2 rounded-lg border border-slate-800 font-mono text-slate-400 tracking-wider mb-4 text-sm'>
                    {cardId}
                  </div>

                  {isBlockedCard ? (
                    <div className='flex items-center gap-2 text-sm text-red-500 font-medium bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20'>
                      <Ban className='w-4 h-4' />
                      Operations Restricted
                    </div>
                  ) : isEmptyCard ? (
                    <div className='flex items-center gap-2 text-sm text-amber-500 font-medium bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20'>
                      <ShieldAlert className='w-4 h-4' />
                      Not Initialized
                    </div>
                  ) : (
                    <div className='flex items-center gap-2 text-sm text-emerald-500 font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20'>
                      <CheckCircle2 className='w-4 h-4' />
                      Ready for Operations
                    </div>
                  )}
                </motion.div>
              ) : (
                /* CONNECTED & WAITING */
                <motion.div
                  key='waiting'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='flex flex-col items-center'
                >
                  <div className='w-48 h-32 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700 mb-8 flex items-center justify-center group-hover:border-slate-600 transition-colors'>
                    <Loader2 className='w-10 h-10 text-slate-600 animate-spin' />
                  </div>
                  <h2 className='text-xl font-bold text-slate-400 mb-2'>Waiting for Card...</h2>
                  <p className='text-slate-500 text-sm max-w-[200px]'>
                    Please place a customer card on the Java Card reader.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manual Refresh Button */}
            <button
              onClick={async () => {
                await refreshStatus();
                // After refresh, if valid card detected but not authenticated, open PIN modal
                if (cardId && !isEmptyCard && !isBlockedCard && !isAuthenticated) {
                  setActiveModal('auth-pin');
                  setModalError(null);
                  setRemainingAttempts(null);
                }
              }}
              disabled={isRefreshing}
              className='mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition border border-slate-700 flex items-center gap-2 disabled:opacity-50'
            >
              <RefreshCw className={clsx('w-4 h-4', isRefreshing && 'animate-spin')} />
              {isRefreshing ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>

          <div className='absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/50 pointer-events-none' />
        </div>
      </div>

      {/* RIGHT PANEL: Operations Menu (65%) */}
      <div className='w-[65%] flex flex-col gap-6'>
        <div className='flex-1 grid grid-cols-2 gap-6 content-start'>
          <div className='col-span-2 mb-2'>
            <h1 className='text-3xl font-bold text-white'>Operations Center</h1>
            <p className='text-slate-400'>Select an action to perform on the connected card.</p>
          </div>

          <button
            disabled={!isAuthenticated || isBlockedCard}
            onClick={handleCheckInfo}
            className='group bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800 p-8 rounded-3xl border border-slate-700 flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50'
          >
            <div className='w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-300'>
              <UserCheck className='w-8 h-8 text-emerald-500 group-hover:text-white transition-colors' />
            </div>
            <div className='text-center'>
              <h3 className='text-xl font-bold text-slate-100 mb-1 group-hover:text-emerald-400 transition-colors'>
                Check Info
              </h3>
              <p className='text-sm text-slate-500'>View balance, points & profile</p>
            </div>
          </button>

          <button
            disabled={!isAuthenticated || isBlockedCard}
            onClick={() => {
              setActiveModal('change-verify-old');
              setModalError(null);
            }}
            className='group bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800 p-8 rounded-3xl border border-slate-700 flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50'
          >
            <div className='w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300'>
              <KeyRound className='w-8 h-8 text-blue-500 group-hover:text-white transition-colors' />
            </div>
            <div className='text-center'>
              <h3 className='text-xl font-bold text-slate-100 mb-1 group-hover:text-blue-400 transition-colors'>
                Change PIN
              </h3>
              <p className='text-sm text-slate-500'>Update card security code</p>
            </div>
          </button>

          <button
            disabled={!isReaderConnected || !cardId || isEmptyCard} // Enabled if Blocked (only checking cardId and emptyCard)
            onClick={() => setActiveModal('reset-confirm')}
            className='col-span-2 group bg-slate-800 hover:bg-red-900/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-red-500/50 flex flex-row items-center justify-start gap-8 transition-all hover:shadow-xl hover:shadow-red-500/5 focus:outline-none focus:ring-2 focus:ring-red-500/50'
          >
            <div className='w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-red-500 transition-colors duration-300 ml-4'>
              <ShieldAlert className='w-8 h-8 text-red-500 group-hover:text-white transition-colors' />
            </div>
            <div className='text-left'>
              <h3 className='text-xl font-bold text-slate-100 mb-1 group-hover:text-red-400 transition-colors'>
                Reset PIN / Unblock
              </h3>
              <p className='text-sm text-slate-500'>
                Admin unlock for frozen cards. Resets to default PIN.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
