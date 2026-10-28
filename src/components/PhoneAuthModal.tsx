import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  ShieldCheck, 
  KeyRound, 
  Fingerprint, 
  X, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Sparkles,
  ArrowRight,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { PhoneAuthUser } from '../types/osint';
import { DEMO_PHONE_ADMINS } from '../data/seedData';
import { soundManager } from '../utils/audioAlert';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneUser: PhoneAuthUser | null;
  onUpdatePhoneUser: (user: PhoneAuthUser | null) => void;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  isOpen,
  onClose,
  phoneUser,
  onUpdatePhoneUser
}) => {
  const [phoneNumber, setPhoneNumber] = useState('+1 (404) 555-0199');
  const [authStep, setAuthStep] = useState<'ENTER_PHONE' | 'VERIFY_OTP' | 'BIOMETRIC_PASSKEY' | 'AUTHENTICATED'>('ENTER_PHONE');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [generatedSmsCode, setGeneratedSmsCode] = useState<string>('');
  const [showSmsBanner, setShowSmsBanner] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (phoneUser?.authenticated) {
      setAuthStep('AUTHENTICATED');
    } else {
      setAuthStep('ENTER_PHONE');
    }
  }, [phoneUser, isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = () => {
    if (phoneNumber.trim().length < 8) {
      setErrorMsg('Please enter a valid phone number with country code.');
      return;
    }
    setErrorMsg(null);
    setIsSending(true);

    setTimeout(() => {
      // Generate a 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedSmsCode(code);
      setIsSending(false);
      setAuthStep('VERIFY_OTP');
      setShowSmsBanner(true);
      soundManager.playAlertChime('HIGH');

      // Focus first OTP field
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }, 600);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpCode];
    newOtp[index] = val.slice(-1);
    setOtpCode(newOtp);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      verifyOtpCode(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    if (!generatedSmsCode) return;
    const parts = generatedSmsCode.split('');
    setOtpCode(parts);
    verifyOtpCode(generatedSmsCode);
  };

  const verifyOtpCode = (entered: string) => {
    if (entered === generatedSmsCode) {
      setErrorMsg(null);
      soundManager.playAlertChime('HIGH');
      setAuthStep('BIOMETRIC_PASSKEY');
    } else {
      setErrorMsg('Invalid verification token. Please check the SMS code.');
      soundManager.playAlertChime('CRITICAL');
    }
  };

  const completeBiometricAuth = () => {
    soundManager.playAlertChime('HIGH');
    const matchedPreset = DEMO_PHONE_ADMINS.find(p => p.phoneNumber === phoneNumber);
    const completedUser: PhoneAuthUser = {
      phoneNumber,
      role: matchedPreset?.role || (phoneNumber.includes('706') ? 'CYBER_ANALYST' : 'ADMIN'),
      adminLevel: matchedPreset?.adminLevel || 'SOC_COMMANDER',
      authenticated: true,
      agency: matchedPreset?.agency || 'Cyber Threat Taskforce Command',
      location: matchedPreset?.location || 'SE-Cyber Operations Center',
      authTimestamp: new Date().toISOString(),
      passkeyVerified: true,
      token: `ARGUS-OAUTH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    onUpdatePhoneUser(completedUser);
    setAuthStep('AUTHENTICATED');
  };

  const handleSignOut = () => {
    onUpdatePhoneUser(null);
    setAuthStep('ENTER_PHONE');
    setOtpCode(['', '', '', '', '', '']);
    setShowSmsBanner(false);
  };

  const selectPresetPhone = (phone: string) => {
    setPhoneNumber(phone);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-xl border border-emerald-500/40 bg-slate-950 p-5 sm:p-6 shadow-2xl shadow-emerald-950/50 font-mono text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                PHONE OAUTH // MOBILE ADMIN ACCESS
              </h2>
              <p className="text-xs text-slate-400">
                Out-of-the-box Multi-Factor Identity Verification for Mobile Devices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Phone OAuth Modal"
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Mobile SMS Notification Simulator Banner */}
        {showSmsBanner && generatedSmsCode && authStep === 'VERIFY_OTP' && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/90 border border-emerald-500/60 shadow-lg text-xs animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <Smartphone className="w-3.5 h-3.5" />
                SIMULATED SMS // ARGUS VERIFY
              </span>
              <span className="text-[10px] text-slate-400">Just Now</span>
            </div>
            <p className="mt-1 text-slate-200 text-xs">
              Your ARGUS Admin OAuth code is: <span className="font-bold text-emerald-300 tracking-wider text-sm">{generatedSmsCode}</span>. Valid for 5 minutes.
            </p>
            <button
              onClick={handleAutoFillOtp}
              className="mt-2 text-[11px] px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Auto-fill code ({generatedSmsCode})
            </button>
          </div>
        )}

        {/* Step 1: Enter Phone Number */}
        {authStep === 'ENTER_PHONE' && (
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="admin-phone-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                Administrator Mobile Phone Number:
              </label>
              <div className="relative">
                <input
                  id="admin-phone-input"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (404) 555-0199"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quick Demo Credentials */}
            <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-3 space-y-2">
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Pre-Authorized SOC Administrator Profiles:
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {DEMO_PHONE_ADMINS.map(admin => (
                  <button
                    key={admin.phoneNumber}
                    onClick={() => selectPresetPhone(admin.phoneNumber)}
                    className={`text-left p-2 rounded border text-xs transition flex items-center justify-between ${
                      phoneNumber === admin.phoneNumber
                        ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-[12px]">{admin.phoneNumber}</p>
                      <p className="text-[10px] text-slate-400">{admin.agency}</p>
                    </div>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      {admin.adminLevel}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => setShowQrModal(!showQrModal)}
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 py-2 px-3 rounded border border-slate-800 hover:border-slate-700"
              >
                <QrCode className="w-4 h-4" />
                Pair Mobile Device (QR)
              </button>
              <button
                onClick={handleSendOtp}
                disabled={isSending}
                className="flex-1 max-w-[200px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Dispatching...
                  </>
                ) : (
                  <>
                    Request Token
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Mobile QR Companion Card */}
            {showQrModal && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-center space-y-2">
                <p className="text-xs text-slate-300 font-bold">Mobile Device Direct Pairing</p>
                <div className="w-32 h-32 mx-auto bg-white p-2 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-black rounded">
                    {/* Visual QR representation */}
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i * 7 + 3) % 2 === 0 ? 'bg-white' : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Scan with your iOS or Android camera to authenticate this terminal immediately.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: 6-Digit OTP Verification */}
        {authStep === 'VERIFY_OTP' && (
          <div className="mt-5 space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-400">Enter the 6-digit one-time passcode dispatched to:</p>
              <p className="text-sm font-bold text-emerald-400">{phoneNumber}</p>
            </div>

            {/* 6 PIN Boxes */}
            <div className="flex justify-center gap-2 sm:gap-3 py-2">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpInputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  aria-label={`Digit ${index + 1}`}
                  className="w-10 sm:w-12 h-12 text-center text-lg font-bold bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              ))}
            </div>

            {errorMsg && (
              <p className="text-xs text-center text-red-400 flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                onClick={() => setAuthStep('ENTER_PHONE')}
                className="text-slate-400 hover:text-white"
              >
                Change Number
              </button>
              <button
                onClick={handleSendOtp}
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                Resend Code
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Biometric / Passkey Hardware Confirmation */}
        {authStep === 'BIOMETRIC_PASSKEY' && (
          <div className="mt-5 text-center space-y-4 py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Fingerprint className="w-8 h-8 animate-pulse text-emerald-400" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Biometric Passkey Required</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Confirm your identity with TouchID, FaceID, or hardware security token registered to <span className="text-emerald-300">{phoneNumber}</span>.
              </p>
            </div>

            <button
              onClick={completeBiometricAuth}
              className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              <Fingerprint className="w-4 h-4" />
              Authorize Administrator Session
            </button>
          </div>
        )}

        {/* Step 4: Fully Authenticated State */}
        {authStep === 'AUTHENTICATED' && phoneUser && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-lg bg-emerald-950/50 border border-emerald-500/50 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                ADMINISTRATOR SESSION ACTIVE
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">PHONE IDENTITY:</span>
                  <span className="font-mono">{phoneUser.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CLEARANCE:</span>
                  <span className="text-emerald-300 font-bold">{phoneUser.adminLevel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ASSIGNED COMMAND:</span>
                  <span>{phoneUser.agency}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">TOKEN THUMBPRINT:</span>
                  <span className="font-mono text-[11px] text-slate-300">{phoneUser.token || 'ARGUS-ACTIVE-24H'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-2">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Elevated Administrator Privileges:
              </p>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                <li>Immediate Emergency Sector Firewall Rules & IP Null-Routing</li>
                <li>Live Discord / Slack / Email Webhook Threat Broadcast Trigger</li>
                <li>Full Classified Threat Dossier Exfiltration & Forensic Analysis</li>
                <li>Encrypted Geolocation Mapping Override for Georgia & Florida Grid Nodes</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleSignOut}
                className="text-xs px-3 py-2 rounded border border-red-900/60 text-red-400 hover:bg-red-950/50 flex items-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Revoke Admin Session
              </button>
              <button
                onClick={onClose}
                className="text-xs px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition"
              >
                Proceed to Console
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
