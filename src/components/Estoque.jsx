import React, { useState } from 'react';
import { 
  Package, AlertTriangle, ArrowLeft, RefreshCw, 
  PlusCircle, X, Save, Edit2, Check 
} from 'lucide-react';
import { ref, push, update } from "firebase/database";
import { db } from "../services/firebaseConfig";

const Estoque = ({ itens, onBack }) => {
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  
  // Estados para edição
  const [nomeEditado, setNomeEditado] = useState('');
  const [valorEditado, setValorEditado] = useState('');
  
  const [novoItem, setNovoItem] = useState({ nome: '', quantidade_atual: '', quantidade_total: '', unidade: 'L' });

  // Termo: Master Update - Atualiza nome e quantidade simultaneamente
  const handleSalvarEdicao = (id) => {
    if (nomeEditado === '' || valorEditado === '') return;

    update(ref(db, `estoque/${id}`), {
      nome: nomeEditado,
      quantidade_atual: Number(valorEditado)
    });
    setEditandoId(null);
  };

  const handleSalvarNovo = (e) => {
    e.preventDefault();
    push(ref(db, 'estoque'), {
      ...novoItem,
      quantidade_atual: Number(novoItem.quantidade_atual),
      quantidade_total: Number(novoItem.quantidade_total)
    });
    setNovoItem({ nome: '', quantidade_atual: '', quantidade_total: '', unidade: 'L' });
    setShowModal(false);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter text-blue-500">Controle de Insumos</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Anubis Tech Inventory</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl flex items-center gap-2 font-black text-xs uppercase italic transition-all shadow-lg shadow-blue-600/30"
        >
          <PlusCircle size={20} /> Novo Item
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itens.map(item => {
          const porcentagem = (item.quantidade_atual / item.quantidade_total) * 100;
          const isCritico = porcentagem <= 30;

          return (
            <div key={item.id} className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 shadow-xl relative group overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-full">
                  {editandoId === item.id ? (
                    <input 
                      type="text"
                      className="w-full bg-[#0b0f1a] border border-blue-500 p-2 rounded-xl text-white font-black italic uppercase outline-none mb-2"
                      value={nomeEditado}
                      onChange={(e) => setNomeEditado(e.target.value)}
                    />
                  ) : (
                    <>
                      <h4 className="text-lg font-black italic text-white uppercase tracking-tighter">{item.nome}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Capacidade: {item.quantidade_total}{item.unidade}</p>
                    </>
                  )}
                </div>
                {editandoId !== item.id && (
                  <div className={`p-3 rounded-2xl ${isCritico ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {isCritico ? <AlertTriangle size={20} /> : <Package size={20} />}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1 w-full">
                    <span className="text-[10px] font-black text-slate-500 uppercase block">Estoque Atual</span>
                    {editandoId === item.id ? (
                      <div className="flex gap-2 animate-in slide-in-from-left-2 mt-2">
                        <input 
                          type="number" 
                          className="w-full bg-[#0b0f1a] border border-blue-500 p-2 rounded-xl text-white font-black outline-none"
                          value={valorEditado}
                          onChange={(e) => setValorEditado(e.target.value)}
                        />
                        <button onClick={() => handleSalvarEdicao(item.id)} className="bg-green-600 p-2 rounded-xl text-white hover:bg-green-500 transition-all"><Check size={20}/></button>
                        <button onClick={() => setEditandoId(null)} className="bg-slate-800 p-2 rounded-xl text-slate-400 hover:text-white"><X size={20}/></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className={`text-3xl font-black italic ${isCritico ? 'text-red-500' : 'text-white'}`}>
                          {Number(item.quantidade_atual).toFixed(1)}<span className="text-xs ml-1 uppercase">{item.unidade}</span>
                        </span>
                        <button 
                          onClick={() => { 
                            setEditandoId(item.id); 
                            setNomeEditado(item.nome);
                            setValorEditado(item.quantidade_atual); 
                          }}
                          className="text-slate-600 hover:text-blue-500 transition-colors bg-slate-800/50 p-2 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {editandoId !== item.id && (
                  <div className="w-full bg-[#0b0f1a] h-3 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${isCritico ? 'bg-red-500' : 'bg-blue-600'}`}
                      style={{ width: `${porcentagem}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal - Novo Insumo */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0b0f1a]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#161b2c] w-full max-w-md rounded-3xl border border-slate-800 p-8 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-xl font-black italic uppercase text-white mb-6 tracking-widest text-center">Cadastro de Insumo</h3>
            <form onSubmit={handleSalvarNovo} className="space-y-4">
               <input type="text" placeholder="Nome do Produto" className="w-full bg-[#0b0f1a] border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-blue-500" value={novoItem.nome} onChange={(e) => setNovoItem({...novoItem, nome: e.target.value})} required />
               <div className="grid grid-cols-2 gap-4">
                 <input type="number" placeholder="Estoque Inicial" className="bg-[#0b0f1a] border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-blue-500" value={novoItem.quantidade_atual} onChange={(e) => setNovoItem({...novoItem, quantidade_atual: e.target.value})} required />
                 <input type="number" placeholder="Capacidade Total" className="bg-[#0b0f1a] border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-blue-500" value={novoItem.quantidade_total} onChange={(e) => setNovoItem({...novoItem, quantidade_total: e.target.value})} required />
               </div>
               <select className="w-full bg-[#0b0f1a] border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-blue-500" value={novoItem.unidade} onChange={(e) => setNovoItem({...novoItem, unidade: e.target.value})}>
                 <option value="L">Litros (L)</option><option value="Kg">Quilos (Kg)</option><option value="Un">Unidades (Un)</option>
               </select>
               <button type="submit" className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase italic mt-4 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">Salvar no Sistema</button>
               <button type="button" onClick={() => setShowModal(false)} className="w-full text-slate-500 font-bold uppercase text-[10px] mt-4 tracking-widest">Fechar Janela</button>
            </form>
          </div>
        </div>
      )}

      <button onClick={onBack} className="mt-10 text-slate-600 hover:text-white transition text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
        <ArrowLeft size={14} /> Voltar ao Painel
      </button>
    </div>
  );
};

export default Estoque;