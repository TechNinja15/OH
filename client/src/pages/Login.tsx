
import React, { useState } from 'react';
import { RotateCcw, Ghost } from 'lucide-react';
import { NeonInput, NeonButton } from '../components/Common';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.endsWith('.edu')) {
      setStep('verify');
    } else {
      alert('Please use a valid university (.edu) email.');
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass email to onboarding
    navigate('/onboarding', { state: { email } });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black p-6 relative overflow-hidden pb-20">
      {/* Background Animations - Slowed */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neon opacity-10 blur-[150px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600 opacity-10 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-gray-500 hover:text-white flex items-center gap-2 z-20"
      >
        <RotateCcw className="w-4 h-4" /> Back to Home
      </button>

      <div className="w-full max-w-2xl z-10 bg-gray-900/50 backdrop-blur-xl p-8 rounded-3xl border border-gray-800 shadow-2xl my-auto max-h-[85vh] overflow-y-auto custom-scrollbar">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-2 tracking-tighter flex flex-col items-center justify-center gap-2 uppercase">
            <span>Other</span>
            <span className="text-neon flex items-center gap-2">Half <Ghost className="w-10 h-10 text-neon animate-bounce" /></span>
          </h1>
          <p className="text-gray-400 mt-4">Anonymous. Exclusive. Secure.</p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">University Email</label>
              <NeonInput 
                type="email" 
                placeholder="student@university.edu" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <NeonButton className="w-full">Verify Student Status</NeonButton>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-300">We sent a code to <span className="text-neon">{email}</span></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Verification Code</label>
              <NeonInput 
                type="text" 
                placeholder="123456" 
                className="text-center tracking-[1em] font-mono text-xl"
                defaultValue="123456" 
              />
            </div>
            <NeonButton className="w-full">Confirm Identity</NeonButton>
          </form>
        )}
      </div>
    </div>
  );
};
