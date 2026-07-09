import React, { useState, useEffect } from 'react';
import { Mail, Shield, Check, AlertCircle, Loader, ArrowRight, RefreshCw } from 'lucide-react';

// Configure your deployed API URL
const API_BASE_URL = 'https://otp-api-bice.vercel.app';

const App = () => {
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && step === 'otp') {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  // Format timer as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace in OTP input
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste for OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      pastedData.split('').forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      // Focus last filled input or first empty
      const lastIndex = Math.min(pastedData.length, 5);
      const nextInput = document.getElementById(`otp-input-${lastIndex}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    // Email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
        setTimer(300); // 5 minutes
        setResendDisabled(true);
        setOtp(['', '', '', '', '', '']);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Send OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          otp: otpString 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('success');
        setTimer(0);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Verify OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setOtp(['', '', '', '', '', '']);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setTimer(300);
        setResendDisabled(true);
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Resend OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset everything
  const handleReset = () => {
    setStep('email');
    setEmail('');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setTimer(0);
    setResendDisabled(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Shield className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center">
              {step === 'email' && 'Email Verification'}
              {step === 'otp' && 'Enter OTP'}
              {step === 'success' && 'Verified!'}
            </h1>
            <p className="text-blue-100 text-center mt-2 text-sm">
              {step === 'email' && 'Secure your account with OTP verification'}
              {step === 'otp' && `We've sent a 6-digit code to your email`}
              {step === 'success' && 'Your email has been verified successfully'}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP Input */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Verification Code
                    </label>
                    {timer > 0 && (
                      <span className="text-sm text-gray-500">
                        Expires in {formatTime(timer)}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-input-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 outline-none"
                        disabled={loading}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    OTP sent to <span className="font-medium text-gray-700">{email}</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Verify OTP</span>
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendDisabled || loading}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>{resendDisabled ? `Resend in ${formatTime(timer)}` : 'Resend OTP'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full text-gray-600 hover:text-gray-800 text-sm py-2 transition-colors duration-200"
                >
                  ← Change email address
                </button>
              </form>
            )}

            {/* Step 3: Success */}
            {step === 'success' && (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="bg-green-100 p-4 rounded-full animate-bounce">
                    <Check className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Complete!</h2>
                  <p className="text-gray-600">
                    Your email <span className="font-medium text-gray-800">{email}</span> has been successfully verified.
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Verify Another Email
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Protected by end-to-end encryption • OTP expires in 5 minutes
            </p>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Connected to {API_BASE_URL}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;