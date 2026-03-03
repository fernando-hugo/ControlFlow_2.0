import React, { useState } from 'react';
import { Car, Clock, CheckCircle, User, Phone, PlayCircle, Loader } from 'lucide-react';

const Patio = ({ veiculos, onConcluir, onBack }) => {
  // Termo: Component State - Filtro local para organizar a visualização
  const [filtroAtivo, setFiltroAtivo] = useState('todos');

  const veiculosFiltrados = veiculos.filter(v => {
    if (filtroAtivo === 'todos') return true;
    return v.status === filtroAtivo;
  });

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold italic text-white">Gestão do Pátio</h2>
          <p className="text-slate-400 text-sm">{veiculos.length} veículos em operação</p>
        </div>
        
        {/* Termo: Toggle Switch - Filtros rápidos de status */}
        <div className="flex bg-[#161b2c] p-1 rounded-2xl border border-slate-800">
          {['todos', 'fila', 'lavando'].map((f) => (
            <button
              key={f}
              onClick={() => setFiltroAtivo(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                filtroAtivo === f ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-4">
        {veiculosFiltrados.length === 0 ? (
          <div className="text-center p-20 bg-[#161b2c] rounded-3xl border border-dashed border-slate-700">
            <Car size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">Nenhum veículo nesta categoria</p>
          </div>
        ) : (
          veiculosFiltrados.map(v => (
            <div key={v.id} className={`bg-[#161b2c] p-6 rounded-3xl border transition-all flex items-center justify-between shadow-xl ${v.status === 'lavando' ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-800'}`}>
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${v.status === 'lavando' ? 'bg-cyan-500/20 text-cyan-500' : 'bg-blue-600/10 text-blue-500'}`}>
                  {v.status === 'lavando' ? <Loader className="animate-spin" size={28} /> : <Car size={28} />}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white uppercase">{v.modelo} <span className="text-sm font-mono text-blue-400 ml-2">{v.placa}</span></h4>
                  <div className="flex flex-wrap gap-4 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold"><User size={12}/> {v.nome}</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold"><Phone size={12}/> {v.whatsapp}</span>
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{v.servico}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right border-r border-slate-800 pr-6 mr-2">
                  <p className="text-2xl font-bold text-white tracking-tighter">R$ {v.valor.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 justify-end"><Clock size={12}/> {v.tempo}</p>
                </div>
                
                {/* Botões de Ação Dinâmicos */}
                <div className="flex gap-3">
                  {v.status === 'fila' && (
                    <button className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-90">
                      <PlayCircle size={24} />
                    </button>
                  )}
                  <button 
                    onClick={() => onConcluir(v.id)}
                    className="bg-green-500 hover:bg-green-600 text-[#0b0f1a] p-4 rounded-2xl transition-all shadow-lg shadow-green-500/20 active:scale-90"
                    title="Finalizar e cobrar"
                  >
                    <CheckCircle size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <button onClick={onBack} className="mt-8 text-slate-500 hover:text-white transition text-xs font-bold uppercase tracking-widest">← Voltar ao Painel</button>
    </div>
  );
};

export default Patio;