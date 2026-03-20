import React, { useState } from 'react';
import { 
  Package, AlertTriangle, ArrowLeft, 
  PlusCircle, X, Edit2, Check, Trash2 
} from 'lucide-react';
import { ref, push, update, remove } from "firebase/database";
import { db } from "../services/firebaseConfig";

const Estoque = ({ itens, onBack }) => {
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  
  const [nomeEditado, setNomeEditado] = useState('');
  const [valorEditado, setValorEditado] = useState('');
  
  const [novoItem, setNovoItem] = useState({ 
    nome: '', 
    quantidade_atual: '', 
    quantidade_total: '', 
    unidade: 'ml' 
  });

  // Função para deletar insumo (Delete Power)
  const handleExcluirInsumo = (id, nome) => {
    if (window.confirm(`Anubis Tech: Deseja excluir permanentemente o insumo "${nome.toUpperCase()}"?`)) {
      remove(ref(db, `estoque/${id}`))
        .catch(err => console.error("Erro ao deletar:", err));
    }
  };

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
    setNovoItem({ nome: '', quantidade_atual: '', quantidade_total: '', unidade: 'ml' });
    setShowModal(false);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase text-blue-500 tracking-tighter">Inventory</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Anubis Tech Control</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl flex items-center gap-2 font-black text-xs uppercase italic transition-all shadow-lg"
        >
          <PlusCircle size={20} /> Adicionar Insumo
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itens.map(item => {
          const porcentagem = (item.quantidade_atual / item.quantidade_total) * 100;
          const isCritico = porcentagem <= 30;

          return (
            <div key={item.id} className="bg-[#161b2c] p-6 rounded-[2.5rem] border border-slate-800 shadow-xl relative group overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-full">
                  {editandoId === item.id ? (
                    <input 
                      type="text"
                      className="w-full bg-black border border-blue-500 p-3 rounded-xl text-white font-black italic uppercase outline-none mb-2"
                      value={nomeEditado}
                      onChange={(e) => setNomeEditado(e.target.value)}
                    />
                  ) : (
                    <>
                      <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter line-clamp-1">{item.nome}</h4>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Capacidade Máx: {item.quantidade_total}{item.unidade}</p>
                    </>
                  )}
                </div>
                
                {editandoId !== item.id && (
                  <button 
                    onClick={() => handleExcluirInsumo(item.id, item.nome)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1 w-full">
                    <span className="text-[9px] font-black text-slate-500 uppercase block tracking-widest">Saldo em Estoque</span>
                    {editandoId === item.id ? (
                      <div className="flex gap-2 animate-in slide-in-from-left-2">
                        <input 
                          type="number" 
                          className="w-full bg-black border border-blue-500 p-3 rounded-xl text-white font-black outline-none"
                          value={valorEditado}
                          onChange={(e) => setValorEditado(e.target.value)}
                        />
                        <button onClick={() => handleSalvarEdicao(item.id)} className="bg-green-600 p-3 rounded-xl text-white"><Check size={20}/></button>
                        <button onClick={() => setEditandoId(null)} className="bg-slate-800 p-3 rounded-xl text-slate-400"><X size={20}/></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className={`text-4xl font-black italic ${isCritico ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                          {Number(item.quantidade_atual).toFixed(0)}<span className="text-xs ml-1 uppercase">{item.unidade}</span>
                        </span>
                        <button 
                          onClick={() => { 
                            setEditandoId(item.id); 
                            setNomeEditado(item.nome);
                            setValorEditado(item.quantidade_atual); 
                          }}
                          className="text-slate-500 hover:text-blue-500 p-2 bg-slate-800/40 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {editandoId !== item.id && (
                  <div className="w-full bg-black h-4 rounded-full overflow-hidden border border-slate-800 p-[2px]">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isCritico ? 'bg-red-600' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(porcentagem, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal - Cadastro Anubis Tech */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-[#161b2c] w-full max-w-md rounded-[3rem] border border-slate-800 p-10 shadow-2xl animate-in zoom-in">
            <h3 className="text-2xl font-black italic uppercase text-white mb-8 tracking-tighter text-center border-b border-slate-800 pb-4">Novo Insumo</h3>
            <form onSubmit={handleSalvarNovo} className="space-y-5">
               <div className="space-y-1">
                 <label className="text-[9px] text-slate-500 ml-2 uppercase font-black tracking-widest">Nome Técnico</label>
                 <input type="text" placeholder="Ex: LUMAX" className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 font-black uppercase italic" value={novoItem.nome} onChange={(e) => setNovoItem({...novoItem, nome: e.target.value})} required />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[9px] text-slate-500 ml-2 uppercase font-black tracking-widest">Qtd Atual</label>
                   <input type="number" placeholder="5000" className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 font-black italic" value={novoItem.quantidade_atual} onChange={(e) => setNovoItem({...novoItem, quantidade_atual: e.target.value})} required />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[9px] text-slate-500 ml-2 uppercase font-black tracking-widest">Qtd Total</label>
                   <input type="number" placeholder="5000" className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 font-black italic" value={novoItem.quantidade_total} onChange={(e) => setNovoItem({...novoItem, quantidade_total: e.target.value})} required />
                 </div>
               </div>

               <div className="space-y-1">
                 <label className="text-[9px] text-slate-500 ml-2 uppercase font-black tracking-widest">Unidade de Medida</label>
                 <select className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none font-black uppercase text-xs" value={novoItem.unidade} onChange={(e) => setNovoItem({...novoItem, unidade: e.target.value})}>
                   <option value="ml">Mililitros (ml)</option>
                   <option value="un">Unidades (un)</option>
                   <option value="kg">Quilos (kg)</option>
                 </select>
               </div>

               <button type="submit" className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase italic mt-4 hover:bg-blue-500 transition-all shadow-xl">Cadastrar no Sistema</button>
               <button type="button" onClick={() => setShowModal(false)} className="w-full text-slate-600 font-black uppercase text-[10px] mt-4 tracking-[0.3em]">Cancelar</button>
            </form>
          </div>
        </div>
      )}

      <button onClick={onBack} className="mt-12 text-slate-500 hover:text-white transition text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-2">
        <ArrowLeft size={14} /> Voltar ao Painel Principal
      </button>
    </div>
  );
};

export default Estoque;