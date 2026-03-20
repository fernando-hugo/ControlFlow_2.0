import React, { useState, useEffect, useMemo } from 'react';
import { Car, CheckCircle, ArrowLeft, Tag, User, Phone, Palette, Info, Edit3, Save, X } from 'lucide-react';
import { ref, onValue, update } from "firebase/database";
import { db } from "../services/firebaseConfig";

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

  const [tabelaPrecos, setTabelaPrecos] = useState({});
  const [modoEdicao, setModoEdicao] = useState(false);
  const [loading, setLoading] = useState(true);

  // Removidas as barras (/) das chaves para evitar erro no Firebase
  const defaultPrecos = {
    "Moto": { "Moto P": 25, "Moto G": 30 },
    "Carro P": { "Ducha": 25, "Completa": 50, "Completa com Cera": 60, "Completa com Resina": 70, "Completa com Prime": 80 },
    "Carro G": { "Ducha": 30, "Completa": 60, "Completa com Cera": 70, "Completa com Resina": 80, "Completa com Prime": 90 },
    "Motor Sem Oleo": { "So por cima": 60, "Completo": 120 },
    "Motor Com Oleo": { "So por cima": 80, "Completo": 130 },
    "Especiais": { "Chassis": 100, "Motor e chassis sem oleo": 150, "Motor e chassis com oleo": 180 }
  };

  useEffect(() => {
    const precosRef = ref(db, 'configuracoes/tabelaPrecos');
    const unsubscribe = onValue(precosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTabelaPrecos(data);
      } else {
        setTabelaPrecos(defaultPrecos);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEditPreco = (cat, serv, valor) => {
    setTabelaPrecos(prev => ({
      ...prev,
      [cat]: { ...prev[cat], [serv]: Number(valor) }
    }));
  };

  const salvarPrecos = async () => {
    try {
      await update(ref(db, 'configuracoes'), { tabelaPrecos });
      setModoEdicao(false);
      alert("Anubis Tech: Tabela de preços sincronizada com sucesso!");
    } catch (error) {
      alert("Erro ao salvar preços: " + error.message);
    }
  };

  const buscarHistoricoCliente = (placaDigitada) => {
    const placaLimpa = placaDigitada.toUpperCase().trim();
    if (placaLimpa.length < 7) {
      setIsNovo(true);
      return;
    }

    const financeiroRef = ref(db, 'financeiro');
    onValue(financeiroRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const registros = Object.values(data);
        const clienteRecente = registros
          .reverse()
          .find(item => item.placa?.toUpperCase() === placaLimpa);

        if (clienteRecente) {
          setNome(clienteRecente.nome || '');
          setWhatsapp(clienteRecente.whatsapp || '');
          setModelo(clienteRecente.modelo || '');
          setCor(clienteRecente.cor || '');
        }
      }
      setIsNovo(true);
    }, { onlyOnce: true });
  };

  const valorFinal = useMemo(() => {
    if (!servicoSelecionado || !tabelaPrecos) return 0;
    const [cat, serv] = servicoSelecionado.split('|');
    if (!tabelaPrecos[cat] || !tabelaPrecos[cat][serv]) return 0;
    const precoBase = tabelaPrecos[cat][serv];
    return Math.max(0, precoBase - Number(desconto));
  }, [servicoSelecionado, desconto, tabelaPrecos]);

  const handleFinalizar = (e) => {
    e.preventDefault();
    const dadosVeiculo = {
      nome,
      whatsapp,
      modelo,
      cor,
      placa: placa.toUpperCase(),
      servico: servicoSelecionado.split('|')[1],
      valor: valorFinal,
      desconto: Number(desconto),
      data: new Date().toISOString()
    };
    if (onFinalizar) onFinalizar(dadosVeiculo);
    setSucesso(true);
    setTimeout(() => onBack(), 1500);
  };

  if (loading) return <div className="text-white text-center p-10 font-black italic uppercase">Carregando Sistema...</div>;

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

        <button 
          onClick={() => setModoEdicao(!modoEdicao)} 
          className={`absolute right-6 top-6 transition-all ${modoEdicao ? 'text-red-500' : 'text-slate-500 hover:text-blue-500'}`}
        >
          {modoEdicao ? <X size={24} /> : <Edit3 size={24} />}
        </button>
        
        <header className="text-center mb-8 pt-4">
          <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500">
            <Car size={32} />
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-widest text-white font-black">
            {modoEdicao ? "Ajustar Tarifário" : "Check-in ControlFlow"}
          </h2>
        </header>

        {modoEdicao ? (
          <div className="space-y-4 animate-in slide-in-from-top-4">
            <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {Object.keys(tabelaPrecos).map(cat => (
                <div key={cat} className="bg-[#0b0f1a] p-4 rounded-xl border border-slate-800">
                  <h3 className="text-blue-400 font-black text-[10px] uppercase mb-3 tracking-widest">{cat}</h3>
                  {Object.keys(tabelaPrecos[cat]).map(serv => (
                    <div key={serv} className="flex justify-between items-center mb-2 last:mb-0">
                      <span className="text-xs text-white font-bold italic">{serv}</span>
                      <div className="flex items-center bg-[#161b2c] border border-slate-700 rounded-lg px-2">
                        <span className="text-[10px] text-green-500 mr-1 font-black">R$</span>
                        <input 
                          type="number"
                          className="bg-transparent w-16 p-1 text-right text-white font-black outline-none text-xs"
                          value={tabelaPrecos[cat][serv]}
                          onChange={(e) => handleEditPreco(cat, serv, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button 
              onClick={salvarPrecos}
              className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 uppercase italic shadow-lg shadow-green-600/20"
            >
              <Save size={20} /> Salvar Nova Tabela
            </button>
          </div>
        ) : (
          !isNovo ? (
            <form onSubmit={(e) => { e.preventDefault(); buscarHistoricoCliente(placa); }} className="space-y-6">
              <div className="space-y-2 text-center font-black">
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Placa do Veículo</label>
                <input 
                  type="text" placeholder="ABC1234" 
                  className="w-full bg-[#0b0f1a] border border-slate-700 p-5 rounded-2xl text-4xl text-center font-mono uppercase tracking-widest focus:border-blue-500 outline-none transition-all text-white shadow-inner font-black"
                  value={placa} onChange={(e) => setPlaca(e.target.value)} required 
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-600/20 transition-all active:scale-95 uppercase italic">
                Continuar Registro
              </button>
            </form>
          ) : (
            <form onSubmit={handleFinalizar} className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-black">
                <div className="relative"><User className="absolute left-3 top-3.5 text-slate-500" size={18} /><input type="text" placeholder="Nome do Cliente" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-[#0b0f1a] border border-slate-700 p-3 pl-10 rounded-xl outline-none focus:border-blue-500 text-white font-black" required /></div>
                <div className="relative"><Phone className="absolute left-3 top-3.5 text-slate-500" size={18} /><input type="text" placeholder="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full bg-[#0b0f1a] border border-slate-700 p-3 pl-10 rounded-xl outline-none focus:border-blue-500 text-white font-black" required /></div>
                <div className="relative"><Info className="absolute left-3 top-3.5 text-slate-500" size={18} /><input type="text" placeholder="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} className="w-full bg-[#0b0f1a] border border-slate-700 p-3 pl-10 rounded-xl outline-none focus:border-blue-500 text-white font-black" required /></div>
                <div className="relative"><Palette className="absolute left-3 top-3.5 text-slate-500" size={18} /><input type="text" placeholder="Cor" value={cor} onChange={(e) => setCor(e.target.value)} className="w-full bg-[#0b0f1a] border border-slate-700 p-3 pl-10 rounded-xl outline-none focus:border-blue-500 text-white font-black" required /></div>
              </div>

              <select className="w-full bg-[#0b0f1a] border border-slate-700 p-4 rounded-xl outline-none cursor-pointer focus:border-blue-500 text-white font-black" value={servicoSelecionado} onChange={(e) => setServicoSelecionado(e.target.value)} required>
                <option value="" className="text-slate-500">Selecione o serviço...</option>
                {Object.keys(tabelaPrecos).map(cat => (
                  <optgroup key={cat} label={cat} className="bg-[#161b2c] text-blue-400 font-bold uppercase text-[10px]">
                    {Object.keys(tabelaPrecos[cat]).map(serv => (
                      <option key={serv} value={`${cat}|${serv}`} className="text-white font-medium italic">{serv} - R$ {tabelaPrecos[cat][serv].toFixed(2)}</option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <div className="bg-[#0b0f1a] p-5 rounded-2xl border border-slate-800 shadow-inner font-black">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] text-slate-400 flex items-center gap-2 font-black uppercase tracking-widest"><Tag size={14} className="text-green-500 font-black" /> Aplicar Desconto (R$)</span>
                  <input 
                    type="number" 
                    className="bg-slate-900 border border-slate-700 w-24 p-2 rounded-lg text-right text-green-500 font-black outline-none focus:border-green-500 transition-colors"
                    value={desconto}
                    onChange={(e) => setDesconto(e.target.value)}
                  />
                </div>
                <div className="border-t border-slate-800 pt-4 flex justify-between items-center font-black">
                  <span className="font-black text-slate-300 italic uppercase text-xs tracking-widest font-black">Valor Final Estimado:</span>
                  <span className="text-3xl font-black text-blue-500 italic drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] font-black">
                    R$ {valorFinal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#0b0f1a] py-4 rounded-2xl font-black text-lg uppercase italic transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]">
                INICIAR SERVIÇO AGORA
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
};

export default CheckIn;