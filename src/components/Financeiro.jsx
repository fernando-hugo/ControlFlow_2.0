import React, { useState, useMemo } from 'react';
import { ArrowLeft, PlusCircle, MinusCircle, X, Trash2, Edit3, Receipt, Wallet } from 'lucide-react';
import { ref, push, remove, update } from "firebase/database";
import { db } from "../services/firebaseConfig";

const Financeiro = ({ historico = [], onBack, total }) => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tipo, setTipo] = useState('entrada');
  const [editId, setEditId] = useState(null);
  
  const [form, setForm] = useState({ 
    descricao: '', 
    valor: '', 
    pagamento: 'pix', 
    servico: 'enel',
    dataRegistro: '',
    timestamp: null
  });

  // Business Intelligence Engine: Ordenação por data (Mais recentes no topo)
  const historicoOrdenado = useMemo(() => {
    return [...historico].sort((a, b) => {
      const timeA = a.timestamp || 0;
      const timeB = b.timestamp || 0;
      return timeB - timeA; // Ordem decrescente
    });
  }, [historico]);

  const entradas = historico.filter(i => i.fluxo !== 'saida');
  const saidas = historico.filter(i => i.fluxo === 'saida');
  const totalSaidas = saidas.reduce((acc, i) => acc + Number(i.valor || 0), 0);
  const lucroLiquido = total - totalSaidas;

  const handleOpenModal = (type, item = null) => {
    setTipo(type);
    if (item) {
      setIsEditing(true);
      setEditId(item.id);
      setForm({
        descricao: item.descricao || item.modelo || '',
        valor: item.valor || '',
        pagamento: item.pagamento || 'pix',
        servico: item.servico || 'enel',
        dataRegistro: item.dataRegistro || '',
        timestamp: item.timestamp || null
      });
    } else {
      setIsEditing(false);
      setEditId(null);
      setForm({ 
        descricao: '', 
        valor: '', 
        pagamento: 'pix', 
        servico: 'enel',
        dataRegistro: '',
        timestamp: null
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.valor || isNaN(form.valor)) {
      alert("Anúbis Tech: Insira um valor numérico válido.");
      return;
    }

    const dadosParaSalvar = { 
      ...form, 
      fluxo: tipo, 
      valor: Number(form.valor), 
      dataRegistro: isEditing ? form.dataRegistro : new Date().toLocaleDateString('pt-BR'), 
      timestamp: isEditing ? form.timestamp : Date.now() 
    };

    if (isEditing && editId) {
      update(ref(db, `financeiro/${editId}`), dadosParaSalvar)
        .then(() => {
          setShowModal(false);
          setIsEditing(false);
        })
        .catch((err) => console.error("Erro ao atualizar:", err));
    } else {
      push(ref(db, 'financeiro'), dadosParaSalvar)
        .then(() => setShowModal(false));
    }
  };

  const handleExcluir = (id) => {
    if (!id) {
      alert("Erro interno Anubis Tech: ID do registro não encontrado.");
      return;
    }

    if (window.confirm("Anúbis Tech: Confirmar exclusão permanente deste registro?")) {
      remove(ref(db, `financeiro/${id}`))
        .catch((error) => {
          console.error("Erro ao remover:", error);
          alert("Erro ao excluir. Verifique sua conexão.");
        });
    }
  };

  return (
    <div className="animate-in fade-in pb-20 text-white font-black italic uppercase">
      <header className="flex justify-between items-end mb-10 border-b border-slate-800 pb-8">
        <div>
          <button onClick={onBack} className="text-slate-500 hover:text-blue-500 transition mb-4 flex items-center gap-2 uppercase text-[10px] tracking-widest">
            <ArrowLeft size={16}/> Voltar ao Painel
          </button>
          <h2 className="text-4xl font-black italic uppercase text-blue-500 tracking-tighter">Financeiro</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Anúbis Tech</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleOpenModal('entrada')} className="bg-green-600 p-4 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all focus:ring-2 ring-green-400 outline-none"><PlusCircle size={18}/> Entrada</button>
          <button onClick={() => handleOpenModal('saida')} className="bg-red-600 p-4 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all focus:ring-2 ring-red-400 outline-none"><MinusCircle size={18}/> Saída</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 font-black">
        <div className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 shadow-xl border-t-4 border-t-blue-500">
          <p className="text-slate-500 text-[9px] font-black uppercase mb-1">Bruto Total</p>
          <h4 className="text-2xl font-black italic text-white">R$ {total.toFixed(2)}</h4>
        </div>
        <div className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 shadow-xl border-t-4 border-t-green-500">
          <p className="text-green-500 text-[9px] font-black uppercase mb-1">Saldo Líquido</p>
          <h4 className="text-2xl font-black italic text-green-500">R$ {lucroLiquido.toFixed(2)}</h4>
        </div>
        <div className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 shadow-xl border-t-4 border-t-red-500">
          <p className="text-red-500 text-[9px] font-black uppercase mb-1">Total Saídas</p>
          <h4 className="text-2xl font-black italic text-red-500">R$ {totalSaidas.toFixed(2)}</h4>
        </div>
        <div className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 shadow-xl border-t-4 border-t-purple-500 text-purple-500">
          <p className="text-slate-500 text-[9px] font-black uppercase mb-1">Operações</p>
          <h4 className="text-2xl font-black italic text-white">{entradas.length} Unid.</h4>
        </div>
      </div>

      <div className="bg-[#161b2c] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left font-black">
          <tbody className="divide-y divide-slate-800">
            {historicoOrdenado.map(item => (
              <tr key={item.id} className="hover:bg-blue-600/5 transition-all group">
                <td className="p-8">
                   <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${item.fluxo === 'saida' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                        {item.fluxo === 'saida' ? <Receipt size={24}/> : <Wallet size={24}/>}
                      </div>
                      <div>
                        <div className="font-black italic uppercase text-white tracking-tighter text-2xl line-clamp-1">
                          {item.descricao || item.modelo}
                        </div>
                        <div className={`text-[10px] font-black uppercase ${item.fluxo === 'saida' ? 'text-red-500/70' : 'text-blue-500/70'}`}>
                          {item.dataRegistro} | {item.fluxo === 'saida' ? (item.servico || 'Despesa') : 'Lavagem'} | {item.pagamento}
                        </div>
                      </div>
                   </div>
                </td>
                <td className="p-8 text-right relative min-w-[200px]">
                  <div className={`font-black italic text-3xl mb-2 ${item.fluxo === 'saida' ? 'text-red-500' : 'text-green-500'}`}>
                    {item.fluxo === 'saida' ? '-' : ''}R$ {Number(item.valor || 0).toFixed(2)}
                  </div>
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <button onClick={() => handleOpenModal(item.fluxo || 'entrada', item)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all">
                      <Edit3 size={16}/>
                    </button>
                    <button onClick={() => handleExcluir(item.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-[#161b2c] w-full max-w-md rounded-[3rem] border border-slate-800 p-10 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter mb-8 text-center border-b border-slate-800 pb-4">
              {isEditing ? 'Ajustar' : 'Novo Registro'} : <span className={tipo === 'entrada' ? 'text-green-500' : 'text-red-500'}>{tipo}</span>
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 ml-2 uppercase tracking-widest font-black">Descrição do Fluxo</label>
                <input type="text" placeholder="Ex: Lavagem Completa ou Sabesp" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 font-black uppercase italic" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 ml-2 uppercase tracking-widest font-black">Valor da Operação (R$)</label>
                <input type="number" placeholder="0.00" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 font-black text-xl italic" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 ml-2 uppercase tracking-widest font-black">Método de Pagamento</label>
                <select value={form.pagamento} onChange={e => setForm({...form, pagamento: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none font-black uppercase text-xs">
                  <option value="pix">PIX</option>
                  <option value="dinheiro">DINHEIRO</option>
                  <option value="debito">DÉBITO</option>
                  <option value="credito">CRÉDITO</option>
                  {tipo === 'saida' && <option value="boleto">BOLETO</option>}
                </select>
              </div>

              {tipo === 'saida' && (
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 ml-2 uppercase tracking-widest font-black">Categoria de Custo</label>
                  <select value={form.servico} onChange={e => setForm({...form, servico: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none uppercase font-black text-xs">
                    <option value="enel">ENEL</option>
                    <option value="sabesp">SABESP</option>
                    <option value="internet">INTERNET</option>
                    <option value="folha">PAGAMENTO FUNCIONÁRIOS</option>
                    <option value="vale">VALE FUNCIONÁRIOS</option>
                    <option value="insumos">INSUMOS</option>
                    <option value="outros">OUTROS</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 p-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 bg-slate-800/30 hover:bg-slate-800 transition-all">Cancelar</button>
                <button onClick={handleSave} className={`flex-[2] p-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] text-white shadow-xl ${tipo === 'entrada' ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20' : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'}`}>
                  {isEditing ? 'Confirmar Edição' : 'Efetivar Registro'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financeiro;