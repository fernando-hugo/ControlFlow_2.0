import React, { useState } from 'react';
import { ArrowLeft, PlusCircle, MinusCircle, X, Trash2 } from 'lucide-react';
import { ref, push, remove } from "firebase/database";
import { db } from "../services/firebaseConfig";

const Financeiro = ({ historico = [], onBack, total }) => {
  const [showModal, setShowModal] = useState(false);
  const [tipo, setTipo] = useState('entrada');
  const [form, setForm] = useState({ descricao: '', valor: '', pagamento: 'pix', servico: 'enel' });

  const entradas = historico.filter(i => i.fluxo !== 'saida');
  const saidas = historico.filter(i => i.fluxo === 'saida');
  const totalSaidas = saidas.reduce((acc, i) => acc + Number(i.valor || 0), 0);
  const lucroLiquido = total - totalSaidas;

  return (
    <div className="animate-in fade-in pb-20 text-white">
      <header className="flex justify-between items-end mb-10 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-black italic uppercase text-blue-500 tracking-tighter">Financeiro</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Anúbis Tech</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setTipo('entrada'); setShowModal(true); }} className="bg-green-600 p-4 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase shadow-lg"><PlusCircle size={18}/> Entrada</button>
          <button onClick={() => { setTipo('saida'); setShowModal(true); }} className="bg-red-600 p-4 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase shadow-lg"><MinusCircle size={18}/> Saída</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 shadow-xl border-t-4 border-t-blue-500">
          <p className="text-slate-500 text-[9px] font-black uppercase mb-1">Bruto</p>
          <h4 className="text-2xl font-black italic">R$ {total.toFixed(2)}</h4>
        </div>
        <div className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 shadow-xl border-t-4 border-t-green-500">
          <p className="text-slate-500 text-[9px] font-black uppercase mb-1 text-green-500">Líquido</p>
          <h4 className="text-2xl font-black italic text-green-500">R$ {lucroLiquido.toFixed(2)}</h4>
        </div>
        <div className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 shadow-xl border-t-4 border-t-red-500">
          <p className="text-slate-500 text-[9px] font-black uppercase mb-1 text-red-500">Insumos</p>
          <h4 className="text-2xl font-black italic text-red-500">{(entradas.length * 0.1).toFixed(1)}L</h4>
        </div>
        <div className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 shadow-xl border-t-4 border-t-purple-500">
          <p className="text-slate-500 text-[9px] font-black uppercase mb-1 text-purple-500">Produção</p>
          <h4 className="text-2xl font-black italic text-white">{entradas.length} Unid.</h4>
        </div>
      </div>

      <div className="bg-[#161b2c] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-800">
            {historico.map(item => (
              <tr key={item.id} className="hover:bg-blue-600/5 transition-all">
                <td className="p-8">
                  <div className="font-black italic uppercase text-white tracking-tighter text-2xl">{item.descricao || item.modelo}</div>
                  <div className={`text-[10px] font-black uppercase ${item.fluxo === 'saida' ? 'text-red-500' : 'text-blue-500'}`}>
                    {item.dataRegistro} | {item.fluxo === 'saida' ? item.servico : 'Serviço'}
                  </div>
                </td>
                <td className={`p-8 text-right font-black italic text-3xl ${item.fluxo === 'saida' ? 'text-red-500' : 'text-green-500'}`}>
                  {item.fluxo === 'saida' ? '-' : ''}R$ {Number(item.valor || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#161b2c] w-full max-w-md rounded-[3rem] border border-slate-800 p-8 shadow-2xl">
            <h3 className="text-xl font-black italic uppercase text-white tracking-tighter mb-6 text-center">Registrar {tipo}</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Descrição" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500" />
              <input type="number" placeholder="Valor" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 font-black" />
              <select value={form.pagamento} onChange={e => setForm({...form, pagamento: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none">
                <option value="pix">PIX</option><option value="dinheiro">DINHEIRO</option><option value="debito">DÉBITO</option><option value="credito">CRÉDITO</option>{tipo === 'saida' && <option value="boleto">BOLETO</option>}
              </select>
              {tipo === 'saida' && (
                <select value={form.servico} onChange={e => setForm({...form, servico: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-white outline-none uppercase font-black text-[10px]">
                  <option value="enel">ENEL</option><option value="sabesp">SABESP</option><option value="internet">INTERNET</option><option value="folha">PAGAMENTO FUNCIONÁRIOS</option><option value="vale">VALE FUNCIONÁRIOS</option><option value="insumos">INSUMOS</option><option value="outros">OUTROS</option>
                </select>
              )}
              <button onClick={() => {
                push(ref(db, 'financeiro'), { ...form, fluxo: tipo, valor: Number(form.valor), dataRegistro: new Date().toLocaleDateString('pt-BR'), timestamp: Date.now() });
                setShowModal(false);
              }} className={`w-full p-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white ${tipo === 'entrada' ? 'bg-green-600' : 'bg-red-600'}`}>Registrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financeiro;