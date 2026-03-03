import React, { useState, useMemo } from 'react';
import { Car, CheckCircle, ArrowLeft, Tag, User, Phone, Palette, Info } from 'lucide-react';

const CheckIn = ({ onBack, onFinalizar }) => {
  const [placa, setPlaca] = useState('');
  const [isNovo, setIsNovo] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [modelo, setModelo] = useState('');
  const [cor, setCor] = useState('');
  
  const [servicoSelecionado, setServicoSelecionado] = useState('');
  const [desconto, setDesconto] = useState(0);

  const tabelaPrecos = useMemo(() => ({
    "Moto": { "Moto P": 25, "Moto G": 30 },
    "Carro P": { "Ducha": 25, "Completa": 50, "Completa c/ Cera": 60, "Completa c/ Resina": 70, "Completa c/ Prime": 80 },
    "Carro G": { "Ducha": 30, "Completa": 60, "Completa c/ Cera": 70, "Completa c/ Resina": 80, "Completa c/ Prime": 90 },
    "Motor (S/ Óleo)": { "Só por cima": 60, "Completo": 120 },
    "Motor (C/ Óleo)": { "Só por cima": 80, "Completo": 130 },
    "Especiais": { "Chassis": 100, "Motor e chassis s/ óleo": 150, "Motor e chassis c/ óleo": 180 }
  }), []);

  const valorFinal = useMemo(() => {
    if (!servicoSelecionado) return 0;
    const [cat, serv] = servicoSelecionado.split('|');
    const precoBase = tabelaPrecos[cat][serv];
    return Math.max(0, precoBase - Number(desconto));
  }, [servicoSelecionado, desconto, tabelaPrecos]);

  const handleFinalizar = (e) => {
    e.preventDefault();
    
    // Termo: Data Persistence - Enviando os dados financeiros para o Firebase
    const dadosVeiculo = {
      nome,
      whatsapp,
      modelo,
      cor,
      placa: placa.toUpperCase(),
      servico: servicoSelecionado.split('|')[1],
      valor: valorFinal,
      desconto: Number(desconto)
    };

    if (onFinalizar) onFinalizar(dadosVeiculo);
    setSucesso(true);
    setTimeout(() => onBack(), 1500);
  };

  if (sucesso) {
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-[#161b2c] rounded-3xl border border-green-500/30 animate-in zoom-in">
        <CheckCircle size={56} className="text-green-500 mb-4 animate-bounce" />
        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Check-in Concluído!</h3>
        <p className="text-slate-400 mt-2 font-bold uppercase">{modelo} - {placa.toUpperCase()}</p>
        <p className="text-blue-500 font-black mt-1 text-3xl italic drop-shadow-md">R$ {valorFinal.toFixed(2)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in pb-10">
      <div className="bg-[#161b2c] p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
        <button onClick={onBack} className="absolute left-6 top-6 text-slate-500 hover:text-white transition">
          <ArrowLeft size={24} />
        </button>
        
        <header className="text-center mb-8 pt-4">
          <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500">
            <Car size={32} />
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-widest text-white">Check-in ControlFlow</h2>
        </header>

        {!isNovo ? (
          <form onSubmit={(e) => { e.preventDefault(); setIsNovo(true); }} className="space-y-6">
            <div className="space-y-2 text-center">
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Placa do Veículo</label>
              <input 
                type="text" placeholder="ABC1234" 
                className="w-full bg-[#0b0f1a] border border-slate-700 p-5 rounded-2xl text-4xl text-center font-mono uppercase tracking-widest focus:border-blue-500 outline-none transition-all text-white shadow-inner"
                value={placa} onChange={(e) => setPlaca(e.target.value)} required 
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-600/20 transition-all active:scale-95 uppercase italic">
              Continuar Registro
            </button>
          </form>
        ) : (
          <form onSubmit={handleFinalizar} className="space-y-6 animate-in slide-in-from-bottom-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative"><User className="absolute left-3 top-3.5 text-slate-500" size={18} /><input type="text" placeholder="Nome do Cliente" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-[#0b0f1a] border border-slate-700 p-3 pl-10 rounded-xl outline-none focus:border-blue-500 text-white" required /></div>
              <div className="relative"><Phone className="absolute left-3 top-3.5 text-slate-500" size={18} /><input type="text" placeholder="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full bg-[#0b0f1a] border border-slate-700 p-3 pl-10 rounded-xl outline-none focus:border-blue-500 text-white" required /></div>
              <div className="relative"><Info className="absolute left-3 top-3.5 text-slate-500" size={18} /><input type="text" placeholder="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} className="w-full bg-[#0b0f1a] border border-slate-700 p-3 pl-10 rounded-xl outline-none focus:border-blue-500 text-white" required /></div>
              <div className="relative"><Palette className="absolute left-3 top-3.5 text-slate-500" size={18} /><input type="text" placeholder="Cor" value={cor} onChange={(e) => setCor(e.target.value)} className="w-full bg-[#0b0f1a] border border-slate-700 p-3 pl-10 rounded-xl outline-none focus:border-blue-500 text-white" required /></div>
            </div>

            <select className="w-full bg-[#0b0f1a] border border-slate-700 p-4 rounded-xl outline-none cursor-pointer focus:border-blue-500 text-white" value={servicoSelecionado} onChange={(e) => setServicoSelecionado(e.target.value)} required>
              <option value="" className="text-slate-500">Selecione o serviço...</option>
              {Object.keys(tabelaPrecos).map(cat => (
                <optgroup key={cat} label={cat} className="bg-[#161b2c] text-blue-400 font-bold uppercase text-[10px]">
                  {Object.keys(tabelaPrecos[cat]).map(serv => (
                    <option key={serv} value={`${cat}|${serv}`} className="text-white font-medium italic">{serv} - R$ {tabelaPrecos[cat][serv].toFixed(2)}</option>
                  ))}
                </optgroup>
              ))}
            </select>

            {/* Seção de Rentabilidade Financeira */}
            <div className="bg-[#0b0f1a] p-5 rounded-2xl border border-slate-800 shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] text-slate-400 flex items-center gap-2 font-black uppercase tracking-widest"><Tag size={14} className="text-green-500" /> Aplicar Desconto (R$)</span>
                <input 
                  type="number" 
                  className="bg-slate-900 border border-slate-700 w-24 p-2 rounded-lg text-right text-green-500 font-black outline-none focus:border-green-500 transition-colors"
                  value={desconto}
                  onChange={(e) => setDesconto(e.target.value)}
                />
              </div>
              <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                <span className="font-black text-slate-300 italic uppercase text-xs tracking-widest">Valor Final Estimado:</span>
                <span className="text-3xl font-black text-blue-500 italic drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                  R$ {valorFinal.toFixed(2)}
                </span>
              </div>
            </div>

            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#0b0f1a] py-4 rounded-2xl font-black text-lg uppercase italic transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]">
              INICIAR SERVIÇO AGORA
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckIn;