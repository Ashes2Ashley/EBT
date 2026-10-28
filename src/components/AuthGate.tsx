import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Lock, 
  KeyRound, 
  Fingerprint, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert,
  Terminal,
  RefreshCw,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { PhoneAuthUser } from '../types/osint';
import { 
  checkRateLimit, 
  recordFailedAuthAttempt, 
  resetAuthFailureCount, 
  generateSessionToken, 
  getAdminClearanceLevel, 
  saveStoredSession, 
  logAuthAuditRecord 
} from '../utils/auth';
import { soundManager } from '../utils/audioAlert';

interface AuthGateProps {
  onAuthenticated: (user: PhoneAuthUser) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onAuthenticated }) => {
  const [phoneNumber, setPhoneNumber] = useState('+1 (404) 555-0199');
  const [authStep, setAuthStep] = useState<'PHONE_INPUT' | 'OTP_CHALLENGE' | 'PASSKEY_CHALLENGE'>('PHONE_INPUT');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [showSmsBanner, setShowSmsBanner] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check rate limit timer
  useEffect(() => {
    const rate = checkRateLimit(phoneNumber);
    if (!rate.allowed) {
      setLockoutRemaining(rate.remainingSeconds);
    }
  }, [phoneNumber]);

  // Lockout countdown tick
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const t = setInterval(() => {
      setLockoutRemaining(prev => {
        if (prev <= 1) {
          setErrorMsg(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [lockoutRemaining]);

  const handleRequestOtp = () => {
    const rate = checkRateLimit(phoneNumber);
    if (!rate.allowed) {
      setErrorMsg(`Security Lockout Active: Too many failed attempts. Try again in ${rate.remainingSeconds}s.`);
      setLockoutRemaining(rate.remainingSeconds);
      soundManager.playAlertChime('CRITICAL');
      return;
    }

    if (phoneNumber.trim().length < 8) {
      setErrorMsg('Please enter a valid phone number with country code.');
      return;
    }

    setErrorMsg(null);
    setIsSending(true);

    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setIsSending(false);
      setAuthStep('OTP_CHALLENGE');
      setShowSmsBanner(true);
      soundManager.playAlertChime('HIGH');

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }, 500);
  };

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[index] = val.slice(-1);
    setOtpDigits(next);

    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    const full = next.join('');
    if (full.length === 6) {
      verifyCode(full);
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFill = () => {
    if (!generatedOtp) return;
    setOtpDigits(generatedOtp.split(''));
    verifyCode(generatedOtp);
  };

  const verifyCode = (code: string) => {
    if (code === generatedOtp) {
      resetAuthFailureCount(phoneNumber);
      setErrorMsg(null);
      soundManager.playAlertChime('HIGH');
      setAuthStep('PASSKEY_CHALLENGE');
    } else {
      const failResult = recordFailedAuthAttempt(phoneNumber);
      logAuthAuditRecord({
        phoneNumber,
        action: 'LOGIN_FAILED',
        role: 'UNKNOWN',
        ipAddress: '198.51.100.12',
        userAgent: 'ARGUS Secure Client v4.8',
        status: failResult.lockedNow ? 'RATE_LIMITED' : 'DENIED'
      });

      if (failResult.lockedNow) {
        setLockoutRemaining(failResult.lockoutSeconds);
        setErrorMsg(`Anti-Brute Force Triggered: 3 failed attempts. Terminal locked for ${failResult.lockoutSeconds} seconds.`);
        setAuthStep('PHONE_INPUT');
      } else {
        setErrorMsg('Invalid token. Please check the 6-digit SMS code.');
      }
      soundManager.playAlertChime('CRITICAL');
    }
  };

  const completeAuthentication = () => {
    const clearance = getAdminClearanceLevel(phoneNumber);
    const token = generateSessionToken(phoneNumber, clearance.role);
    const user: PhoneAuthUser = {
      phoneNumber,
      role: clearance.role,
      adminLevel: clearance.adminLevel,
      authenticated: true,
      agency: clearance.agency,
      location: phoneNumber.includes('404') ? 'Atlanta, GA' : phoneNumber.includes('305') ? 'Miami, FL' : 'Southeast Region',
      authTimestamp: new Date().toISOString(),
      passkeyVerified: true,
      token,
      sessionExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };

    saveStoredSession(user);
    logAuthAuditRecord({
      phoneNumber,
      action: 'LOGIN_SUCCESS',
      role: clearance.role,
      ipAddress: '199.111.226.1',
      userAgent: 'ARGUS Secure Mobile Gateway',
      status: 'SUCCESS'
    });

    soundManager.playAlertChime('HIGH');
    onAuthenticated(user);
  };

  const quickLoginPreset = (phone: string) => {
    setPhoneNumber(phone);
    const clearance = getAdminClearanceLevel(phone);
    const token = generateSessionToken(phone, clearance.role);
    const user: PhoneAuthUser = {
      phoneNumber: phone,
      role: clearance.role,
      adminLevel: clearance.adminLevel,
      authenticated: true,
      agency: clearance.agency,
      location: phone.includes('404') ? 'Atlanta, GA' : phone.includes('305') ? 'Miami, FL' : 'Southeast Region',
      authTimestamp: new Date().toISOString(),
      passkeyVerified: true,
      token,
      sessionExpiresAt: Date.now() + 24 * 60 * 60 * 1000
    };

    saveStoredSession(user);
    logAuthAuditRecord({
      phoneNumber: phone,
      action: 'LOGIN_SUCCESS',
      role: clearance.role,
      ipAddress: '199.111.226.1',
      userAgent: 'ARGUS Demo Authentication',
      status: 'SUCCESS'
    });

    soundManager.playAlertChime('HIGH');
    onAuthenticated(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070c]/95 backdrop-blur-xl font-mono text-slate-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-emerald-500/50 bg-slate-950 p-6 sm:p-8 shadow-2xl shadow-emerald-950/70 space-y-5">
        {/* Terminal Header */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-5">
          <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950">
            <ShieldAlert className="w-8 h-8 animate-pulse text-emerald-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-widest flex items-center justify-center gap-2">
            ARGUS <span className="text-emerald-400">//</span> SECURITY CLEARANCE
          </h2>
          <p className="text-xs text-slate-400">
            Restricted Access • Georgia & Florida Critical Infrastructure Defense SOC
          </p>
        </div>

        {/* Lockout Warning Banner */}
        {lockoutRemaining > 0 && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500 text-xs text-red-200 flex items-center gap-2.5 animate-pulse">
            <Clock className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              ANTI-BRUTE FORCE LOCKOUT: Access suspended for {lockoutRemaining} seconds.
            </span>
          </div>
        )}

        {/* Simulated Mobile SMS Banner */}
        {showSmsBanner && generatedOtp && authStep === 'OTP_CHALLENGE' && (
          <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500 text-xs shadow-lg space-y-1 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> SMS OAUTH VERIFICATION DISPATCH
              </span>
              <span className="text-slate-400">Just Now</span>
            </div>
            <p className="text-slate-200 text-xs">
              Your ARGUS Admin Security Token is: <strong className="text-emerald-300 text-sm tracking-wider font-mono">{generatedOtp}</strong>
            </p>
            <button
              onClick={handleAutoFill}
              className="mt-1 text-[11px] px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Auto-fill Token ({generatedOtp})
            </button>
          </div>
        )}

        {/* Step 1: Phone Number Input */}
        {authStep === 'PHONE_INPUT' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="authgate-phone" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Administrator Mobile Number:
              </label>
              <input
                id="authgate-phone"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (404) 555-0199"
                disabled={lockoutRemaining > 0}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-50"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}

            <button
              onClick={handleRequestOtp}
              disabled={isSending || lockoutRemaining > 0}
              className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Security Challenge...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  Send Phone OAuth Token
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Administrator Profiles for One-Click Access */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Authorized SOC Command Profiles (One-Click Testing):
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => quickLoginPreset('+1 (404) 555-0199')}
                  className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-emerald-500 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <span className="font-bold text-white group-hover:text-emerald-400">
                      Georgia Cyber Center Command (+1 404 555-0199)
                    </span>
                    <span className="text-[10px] text-slate-400 block">Fort Eisenhower • State Power & Maritime Defense</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold">
                    ADMIN
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => quickLoginPreset('+1 (305) 555-0188')}
                  className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-emerald-500 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <span className="font-bold text-white group-hover:text-emerald-400">
                      Florida Cyber Threat Command (+1 305 555-0188)
                    </span>
                    <span className="text-[10px] text-slate-400 block">Miami & Tallahassee • PortMiami / FPL Nuclear Taskforce</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold">
                    ADMIN
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 6-Digit OTP Challenge */}
        {authStep === 'OTP_CHALLENGE' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-400">Enter the 6-digit one-time passcode dispatched to:</p>
              <p className="text-sm font-bold text-emerald-400 font-mono">{phoneNumber}</p>
            </div>

            <div className="flex justify-center gap-2 sm:gap-2.5 py-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                  aria-label={`Digit ${idx + 1}`}
                  className="w-10 sm:w-12 h-12 text-center text-lg font-bold bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 font-mono"
                />
              ))}
            </div>

            {errorMsg && (
              <p className="text-xs text-center text-red-400 flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                onClick={() => setAuthStep('PHONE_INPUT')}
                className="text-slate-400 hover:text-white"
              >
                Change Number
              </button>
              <button
                onClick={handleRequestOtp}
                className="text-emerald-400 hover:underline"
              >
                Resend Code
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Biometric / Hardware Key Passkey Prompt */}
        {authStep === 'PASSKEY_CHALLENGE' && (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Fingerprint className="w-8 h-8 animate-pulse text-emerald-400" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Biometric Passkey Required</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Confirm your identity with TouchID, FaceID, or hardware FIDO2 key registered to <strong className="text-emerald-300">{phoneNumber}</strong>.
              </p>
            </div>

            <button
              onClick={completeAuthentication}
              className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950"
            >
              <Fingerprint className="w-4 h-4" />
              Authorize SOC Administrator Clearance
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
