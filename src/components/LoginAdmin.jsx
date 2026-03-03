import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { LogIn, ShieldAlert } from 'lucide-react';

const LoginAdmin = ({ onLoginSucesso }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      onLoginSucesso();
    } catch (error) {
      setErro("Acesso Negado: Credenciais Inválidas.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center p-6 font-black italic uppercase">
      <div className="bg-[#161b2c] w-full max-w-md rounded-[3rem] border border-slate-800 p-12 shadow-2xl text-center">
        <h2 className="text-3xl text-blue-500 mb-2 tracking-tighter font-black">Anúbis Tech</h2>
        <p className="text-[10px] text-slate-500 tracking-[0.4em] mb-8 font-black">ControlFlow 2.0 Admin</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" placeholder="E-mail" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all"
          />
          <input 
            type="password" placeholder="Senha" value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all"
          />
          {erro && <p className="text-red-500 text-[10px] flex items-center justify-center gap-2 font-black"><ShieldAlert size={14}/> {erro}</p>}
          
          <button type="submit" className="w-full bg-blue-600 p-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs tracking-widest hover:bg-blue-700 transition-all font-black">
            <LogIn size={20} /> Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginAdmin;
