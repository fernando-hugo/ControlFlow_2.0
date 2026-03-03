import React from 'react';
import { RefreshCw, MessageCircle, AlertTriangle, Clock, Calendar } from 'lucide-react';

const Reativacao = () => {
  // Dados simulando os alertas do vídeo (2:30)
  const clientesSumidos = [
    { id: 1, nome: 'Carlos Oliveira', placa: 'DEF-5678', ultimoServico: 'Lavagem Simples', dias: 41, status: 'critico' },
    { id: 2, nome: 'Ana Pereira', placa: 'GHI-3456', ultimoServico: 'Higienização', dias: 36, status: 'critico' },
    { id: 3, nome: 'Marcos Souza', placa: 'JKL-9012', ultimoServico: 'Lavagem Completa', dias: 22, status: 'alerta' }
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10">
        <h2 className="text-3xl font-bold italic text-white flex items-center gap-3">
          <RefreshCw className="text-blue-500" size={32} /> Reativação de Clientes
        </h2>
        <p className="text-slate-400 text-sm mt-2">2 clientes precisam de atenção imediata</p>
      </header>

      {/* Cards de Alerta Superior (Vídeo 2:28) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-[#161b2c] p-6 rounded-3xl border border-red-500/30 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">+30 dias sem visita</p>
            <h3 className="text-3xl font-bold text-red-500">2</h3>
          </div>
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        <div className="bg-[#161b2c] p-6 rounded-3xl border border-yellow-500/30 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">20-30 dias sem visita</p>
            <h3 className="text-3xl font-bold text-yellow-500">1</h3>
          </div>
          <Clock className="text-yellow-500" size={32} />
        </div>
      </div>

      {/* Lista de Clientes para Reativar (Vídeo 2:32) */}
      <div className="space-y-4">
        {clientesSumidos.map(c => (
          <div key={c.id} className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-slate-900 p-4 rounded-2xl text-slate-500 relative">
                <Users size={24} />
                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[#161b2c] ${c.status === 'critico' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
              </div>
              <div>
                <h4 className="font-bold text-lg">{c.nome}</h4>
                <div className="flex gap-3 text-[10px] text-slate-500 uppercase font-bold mt-1">
                  <span>{c.placa}</span>
                  <span>•</span>
                  <span>Último: {c.ultimoServico}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className={`text-sm font-bold ${c.status === 'critico' ? 'text-red-500' : 'text-yellow-500'}`}>
                  {c.dias} dias
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Sem visita</p>
              </div>
              <button className="bg-green-500 hover:bg-green-600 text-[#0b0f1a] px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-95">
                <MessageCircle size={18} /> WhatsApp
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Ícone Auxiliar
const Users = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

export default Reativacao;