import React, { useState } from 'react';
import { ArrowLeft, PlusCircle, MinusCircle, X, Trash2, Edit3 } from 'lucide-react';
import { ref, push, remove, update } from "firebase/database";
import { db } from "../services/firebaseConfig";

const Financeiro = ({ historico = [], onBack, total }) => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tipo, setTipo] = useState('entrada');
  const [editId, setEditId] = useState(null);
  
  // Estado do formulário expandido para preservar metadados na edição
  const [form, setForm] = useState({ 
    descricao: '', 
    valor: '', 
    pagamento: 'pix', 
    servico: 'enel',
    dataRegistro: '',
    timestamp: null
  });

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
    // Validação de integridade Anúbis Tech
    if (!form.valor || isNaN(form.valor)) {
      alert("Por favor, insira um valor numérico válido.");
      return;
    }

    const dadosParaSalvar = { 
      ...form, 
      fluxo: tipo, 
      valor: Number(form.valor), 
      // Preserva a cronologia original se for edição
      dataRegistro: isEditing ? form.dataRegistro : new Date().toLocaleDateString('pt-BR'), 
      timestamp: isEditing ? form.timestamp : Date.now() 
    };

    if (isEditing && editId) {
      // Executa o Update no nó específico do Firebase
      update(ref(db, `financeiro/${editId}`), dadosParaSalvar)
        .then(() => {
          setShowModal(false);
          setIsEditing(false);
        })
        .catch((error) => console.error("Erro ao atualizar registro:", error));
    } else {
      // Cria um novo registro
      push(ref(db, 'financeiro'), dadosParaSalvar)
        .then(() => {
          setShowModal(false);
        });
    }
  };

  const handleExcluir = (id) => {
    if (window.confirm("Anúbis Tech: Confirmar exclusão permanente deste registro financeiro?")) {
      remove(ref(db, `financeiro/${id}`));
    }
  };

  return (
    <div className="animate-in fade-in pb-20 text-white font-black">
      <header className="flex justify-between items-end mb-10 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-black italic uppercase text-blue-500 tracking-tighter">Financeiro</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Anúbis Tech</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleOpenModal('entrada')} className="bg-green-600 p-4 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all"><PlusCircle size={18}/> Entrada</button>
          <button onClick={() => handleOpenModal('saida')} className="bg-red-600 p-4 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all"><MinusCircle size={18}/> Saída</button>
        </div>
      </header>

      {/* Grid de KPIs Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 font-black">
        <div className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 shadow-xl border-t-4 border-t-blue-500">
          <p className="text-slate-500 text-[9px] font-black uppercase mb-1">Bruto</p>
          <h4 className="text-2xl font-black italic">R$ {total.toFixed(2)}</h4>
        </div>
        <div className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 shadow-xl border-t-4 border-t-green-500">
          <p className="text-slate-500 text-[9px] font-black uppercase mb-1 text-green-500">Líquido</p>
          <h4 className="text-2xl font-black italic text-green-500">R$ {lucroLiquido.toFixed(2)}</h4>
        </div>
        <div className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 shadow-xl border-t-4 border-t-red-500 text-red-500">
          <p className="text-slate-500 text-[9px] font-black uppercase mb-1">Saídas</p>
          <h4 className="text-2xl font-black italic">R$ {totalSaidas.toFixed(2)}</h4>
        </div>
        <div className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 shadow-xl border-t-4 border-t-purple-500">
          <p className="text-slate-500 text-[9px] font-black uppercase mb-1 text-purple-500 font-black">Produção</p>
          <h4 className="text-2xl font-black italic text-white font-black">{entradas.length} Unid.</h4>
        </div>
      </div>

      <div className="bg-[#161b2c] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left font-black">
          <tbody className="divide-y divide-slate-800">
            {historico.map(item => (
              <tr key={item.id} className="hover:bg-blue-600/5 transition-all group">
                <td className="p-8">
                  <div className="font-black italic uppercase text-white tracking-tighter text-2xl font-black">{item.descricao || item.modelo}</div>
                  <div className={`text-[10px] font-black uppercase ${item.fluxo === 'saida' ? 'text-red-500' : 'text-blue-500'}`}>
                    {item.dataRegistro} | {item.fluxo === 'saida' ? item.servico : 'Serviço'} | {item.pagamento}
                  </div>
                </td>
                <td className="p-8 text-right font-black">
                  <div className={`font-black italic text-3xl mb-2 ${item.fluxo === 'saida' ? 'text-red-500' : 'text-green-500'}`}>
                    {item.fluxo === 'saida' ? '-' : ''}R$ {Number(item.valor || 0).toFixed(2)}
                  </div>
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(item.fluxo || 'entrada', item)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Edit3 size={16}/></button>
                    <button onClick={() => handleExcluir(item.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 font-black">
          <div className="bg-[#161b2c] w-full max-w-md rounded-[3rem] border border-slate-800 p-8 shadow-2xl">
            <h3 className="text-xl font-black italic uppercase text-white tracking-tighter mb-6 text-center">{isEditing ? 'Editar' : 'Registrar'} {tipo}</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Descrição" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 font-black" />
              <input type="number" placeholder="Valor" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 font-black" />
              <select value={form.pagamento} onChange={e => setForm({...form, pagamento: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none font-black">
                <option value="pix">PIX</option><option value="dinheiro">DINHEIRO</option><option value="debito">DÉBITO</option><option value="credito">CRÉDITO</option>{tipo === 'saida' && <option value="boleto">BOLETO</option>}
              </select>
              {tipo === 'saida' && (
                <select value={form.servico} onChange={e => setForm({...form, servico: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none uppercase font-black text-[10px]">
                  <option value="enel">ENEL</option><option value="sabesp">SABESP</option><option value="internet">INTERNET</option><option value="folha">PAGAMENTO FUNCIONÁRIOS</option><option value="vale">VALE FUNCIONÁRIOS</option><option value="insumos">INSUMOS</option><option value="outros">OUTROS</option>
                </select>
              )}
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="flex-1 p-4 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-500 bg-slate-800/50 hover:bg-slate-800">Cancelar</button>
                <button onClick={handleSave} className={`flex-[2] p-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white ${tipo === 'entrada' ? 'bg-green-600' : 'bg-red-600'} hover:opacity-90 transition-opacity`}>{isEditing ? 'Salvar Alteração' : 'Registrar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financeiro;