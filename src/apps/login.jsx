import { useState } from 'react';
import { motion } from 'framer-motion';

const BASE = import.meta.env.BASE_URL;

export default function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [step, setStep] = useState('user');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (step === 'user') {
      setError('');
      setStep('pass');
    } else {
      onLogin(user.trim() || 'User007');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-screen w-screen flex-col items-center justify-center bg-black gap-8">
      <div className="flex flex-col items-center gap-2">
        <img src={`${BASE}logo.png`} alt="Suprland Logo" width="80" height="80" />
        <p className="text-gray-600 font-mono text-sm tracking-[0.3em]">Suprland*</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-64">
        <div className="flex flex-col gap-1">
          <label className="text-gray-600 font-mono text-[10px] tracking-widest uppercase">
            {step === 'user' ? 'Username' : 'Password'}
          </label>
          <input
            autoFocus
            type={step === 'pass' ? 'password' : 'text'}
            value={step === 'user' ? user : pass}
            onChange={event => step === 'user' ? setUser(event.target.value) : setPass(event.target.value)}
            className="bg-transparent border border-gray-800 rounded-lg px-3 py-2 text-gray-300 font-mono text-sm outline-none focus:border-gray-600 transition-colors"
            spellCheck="false"
            autoComplete="off"
          />
        </div>
        {error && <p className="text-red-500 font-mono text-[10px]">{error}</p>}
        <button type="submit" className="mt-1 border border-gray-800 hover:border-gray-600 text-gray-500 hover:text-gray-300 font-mono text-xs tracking-widest uppercase py-2 rounded-lg transition-colors">
          {step === 'user' ? 'next' : 'login'}
        </button>
      </form>
    </motion.div>
  );
}
