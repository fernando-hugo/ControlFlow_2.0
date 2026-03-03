import React, { useState } from 'react';
import { 
  ArrowLeft, Target, TrendingUp, Droplets, AlertCircle, 
  X, FileText, Calendar, DollarSign, CreditCard, 
  MinusCircle, Car 
} from 'lucide-react';

const AuditoriaExecutiva = ({ historico = [], onBack }) => {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [modalDetalhes, setModalDetalhes] = useState({ aberto: false, titulo: '', dados: [], tipo: '' });

  // Normalização para comparação de datas
  const normalizarData = (d) => {
    if (!d) return 0;
    const partes = d.includes('-') ? d.split('-') : d.split('/').reverse();
    return parseInt(partes.join(''));
  };

  const filtrados = (historico || []).filter(i => {
    if (!dataInicio || !dataFim) return true;
    const itemDataNum = normalizarData(i.dataRegistro);
    const startNum = normalizarData(dataInicio);
    const endNum = normalizarData(dataFim);
    return itemDataNum >= startNum && itemDataNum <= endNum;
  });

  // Business Intelligence Engine
  const entradas = filtrados.filter(i => i.fluxo !== 'saida');
  const saidas = filtrados.filter(i => i.fluxo === 'saida');
  
  const lucroBruto = entradas.reduce((acc, i) => acc + Number(i.valor || 0), 0);
  const faturamentoLiquido = entradas.reduce((acc, i) => acc + Number(i.valorLiquidoReal || i.valor || 0), 0);
  const taxasCartao = entradas.reduce((acc, i) => acc + Number(i.taxaDeducao || 0), 0);
  const totalGastos = saidas.reduce((acc, i) => acc + Number(i.valor || 0), 0);
  const netProfitFinal = faturamentoLiquido - totalGastos;

  const abrirRelatorio = (tipo, titulo, lista) => {
    setModalDetalhes({ aberto: true, titulo, dados: lista, tipo });
  };

  const CardKPI = ({ titulo, valor, cor, icone: Icone, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-[#161b2c] p-6 rounded-[2rem] border border-slate-800 border-t-4 ${cor} shadow-2xl cursor-pointer hover:scale-[1.02] transition-all group relative overflow-hidden`}
    >
      <Icone className={`absolute -right-4 -top-4 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity`} />
      <p className="text-slate-500 text-[10px] font-black uppercase mb-2 tracking-widest">{titulo}</p>
      <h4 className="text-2xl font-black italic tracking-tighter text-white font-black">{valor}</h4>
      <p className="text-[9px] text-blue-500 mt-2 font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Ver Relatório</p>
    </div>
  );

  return (
    <div className="animate-in slide-in-from-right duration-500 pb-20 text-white font-black italic uppercase">
      <header className="flex justify-between items-end mb-12 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl text-blue-500 tracking-tighter">Auditoria Estratégica</h2>
          <p className="text-slate-500 text-[10px] tracking-[0.4em]">Anúbis Tech Intelligence</p>
        </div>

        <div className="flex gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
          <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="bg-black text-white text-xs p-2 rounded-xl border border-slate-700 outline-none" />
          <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="bg-black text-white text-xs p-2 rounded-xl border border-slate-700 outline-none" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <CardKPI titulo="Total de Carros" valor={`${entradas.length} Unid.`} cor="border-t-purple-500" icone={Car} onClick={() => abrirRelatorio('carros', 'Relatório de Lavagens', entradas)} />
        <CardKPI titulo="Lucro Bruto" valor={`R$ ${lucroBruto.toFixed(2)}`} cor="border-t-blue-500" icone={DollarSign} onClick={() => abrirRelatorio('bruto', 'Relatório Bruto', entradas)} />
        <CardKPI titulo="Lucro Líquido" valor={`R$ ${netProfitFinal.toFixed(2)}`} cor="border-t-green-500" icone={TrendingUp} onClick={() => abrirRelatorio('liquido', 'Relatório Líquido', filtrados)} />
        <CardKPI titulo="Gastos (Saídas)" valor={`R$ ${totalGastos.toFixed(2)}`} cor="border-t-red-500" icone={MinusCircle} onClick={() => abrirRelatorio('gastos', 'Relatório de Despesas', saidas)} />
        <CardKPI titulo="Taxas de Cartão" valor={`R$ ${taxasCartao.toFixed(2)}`} cor="border-t-orange-500" icone={CreditCard} onClick={() => abrirRelatorio('taxas', 'Custos de Cartão', entradas.filter(i => i.taxaDeducao > 0))} />
        <CardKPI titulo="Gasto de Insumos" valor={`${(entradas.length * 0.1).toFixed(1)}L`} cor="border-t-cyan-500" icone={Droplets} onClick={() => abrirRelatorio('insumos', 'Projeção de Insumos', entradas)} />
      </div>

      <button onClick={onBack} className="mt-8 text-slate-600 hover:text-white transition-all text-[11px] font-black tracking-[0.4em] flex items-center gap-4"><ArrowLeft size={20} /> Voltar</button>

      {modalDetalhes.aberto && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[300] flex items-center justify-center p-6">
          <div className="bg-[#0b0f1a] w-full max-w-5xl h-[85vh] rounded-[3rem] border border-slate-800 flex flex-col shadow-2xl overflow-hidden">
            <header className="p-10 border-b border-slate-800 flex justify-between items-center bg-[#161b2c]">
              <h3 className="text-3xl text-white tracking-tighter flex items-center gap-3"><FileText className="text-blue-500" /> {modalDetalhes.titulo}</h3>
              <button onClick={() => setModalDetalhes({ ...modalDetalhes, aberto: false })} className="p-4 bg-slate-800 hover:bg-red-600 rounded-2xl text-white transition-all"><X size={24} /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-10 font-black italic">
              <table className="w-full text-left">
                <thead className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800">
                  <tr>
                    <th className="pb-4 px-4">Data</th>
                    <th className="pb-4 px-4">Descrição</th>
                    <th className="pb-4 px-4 text-right">Bruto</th>
                    <th className="pb-4 px-4 text-right">Taxa</th>
                    <th className="pb-4 px-4 text-right">Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {modalDetalhes.dados.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-600/5 transition-all text-sm group">
                      <td className="py-4 px-4 text-slate-400 text-[11px] uppercase">{item.dataRegistro}</td>
                      <td className="py-4 px-4 text-white uppercase text-lg tracking-tighter">{item.placa || item.modelo || item.descricao}</td>
                      <td className="py-4 px-4 text-right text-slate-400">R$ {Number(item.valor || 0).toFixed(2)}</td>
                      <td className="py-4 px-4 text-right text-red-500/50 font-black">- R$ {Number(item.taxaDeducao || 0).toFixed(2)}</td>
                      <td className={`py-4 px-4 text-right font-black tracking-tighter text-lg ${item.fluxo === 'saida' ? 'text-red-500' : 'text-green-500'}`}>R$ {Number(item.valorLiquidoReal || item.valor || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <footer className="p-10 border-t border-slate-800 bg-[#161b2c] flex justify-between items-center">
               <span className="text-[10px] text-slate-500 tracking-[0.4em]">Anúbis Tech ControlFlow 2.0</span>
               <div className="text-2xl text-white">Total: <span className="text-blue-500">R$ {modalDetalhes.dados.reduce((acc, i) => acc + (Number(i.valorLiquidoReal || i.valor || 0) * (i.fluxo === 'saida' ? -1 : 1)), 0).toFixed(2)}</span></div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditoriaExecutiva;