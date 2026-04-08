import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [step, setStep] = useState('user');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (step === 'user') {
      if (!user.trim()) return setError('username cannot be empty');
      setError('');
      setStep('pass');
    } else {
      if (!pass.trim()) return setError('password cannot be empty');
      onLogin(user.trim());
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-screen w-screen flex-col items-center justify-center bg-black gap-8">
      <div className="flex flex-col items-center gap-2">
        <svg width="40" height="40" viewBox="0 0 52 52" fill="none">
          <polygon points="26,4 48,14 48,38 26,48 4,38 4,14" stroke="#2a2a2a" strokeWidth="1.5" fill="none" />
          <polygon points="26,12 40,19 40,33 26,40 12,33 12,19" stroke="#333" strokeWidth="1" fill="none" />
          <circle cx="26" cy="26" r="3" fill="#3a3a3a" />
        </svg>
        <p className="text-gray-600 font-mono text-sm tracking-[0.3em]">Suprland*</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3 w-64">
        <div className="flex flex-col gap-1">
          <label className="text-gray-600 font-mono text-[10px] tracking-widest uppercase">{step === 'user' ? 'Username' : 'Password'}</label>
          <input autoFocus type={step === 'pass' ? 'password' : 'text'}
            value={step === 'user' ? user : pass}
            onChange={e => step === 'user' ? setUser(e.target.value) : setPass(e.target.value)}
            className="bg-transparent border border-gray-800 rounded-lg px-3 py-2 text-gray-300 font-mono text-sm outline-none focus:border-gray-600 transition-colors"
            spellCheck="false" autoComplete="off" />
        </div>
        {error && <p className="text-red-500 font-mono text-[10px]">{error}</p>}
        <button type="submit" className="mt-1 border border-gray-800 hover:border-gray-600 text-gray-500 hover:text-gray-300 font-mono text-xs tracking-widest uppercase py-2 rounded-lg transition-colors">
          {step === 'user' ? 'next' : 'login'}
        </button>
      </form>
    </motion.div>
  );
}
