import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, UserPlus, ClipboardList, 
  Wallet, Package, RefreshCw, DollarSign, 
  TrendingUp, Car, Users, AlertTriangle, Percent, ShieldCheck, LogOut 
} from 'lucide-center';
import { ref, push, onValue, remove, update } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "./services/firebaseConfig"; 

// Importação dos Componentes
import CheckIn from './components/CheckIn';
import Patio from './components/Patio';
import Financeiro from './components/Financeiro';
import Estoque from './components/Estoque';
import AuditoriaExecutiva from './components/AuditoriaExecutiva';
import LoginAdmin from './components/LoginAdmin'; 

const App = () => {
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [telaAtiva, setTelaAtiva] = useState('dashboard');
  const [veiculosNoPatio, setVeiculosNoPatio] = useState([]);
  const [servicosFinalizados, setServicosFinalizados] = useState([]);
  const [itensEstoque, setItensEstoque] = useState([]);
  const [modalPagamento, setModalPagamento] = useState({ aberto: false, veiculo: null });

  // Monitoramento da Sessão do Administrador
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuarioLogado(!!user);
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  // Sincronização em Tempo Real (Real-Time Sync)
  useEffect(() => {
    if (!usuarioLogado) return;

    // Monitoramento do Pátio
    onValue(ref(db, 'patio'), (snapshot) => {
      const data = snapshot.val();
      setVeiculosNoPatio(data ? Object.entries(data).map(([key, val]) => ({ id: key, ...val })) : []);
    });

    // Monitoramento Financeiro - BLINDAGEM DE REATIVIDADE ANUBIS TECH
    onValue(ref(db, 'financeiro'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Mapeamento via Object.entries para garantir a integridade do ID (Key do Firebase)
        const listaTratada = Object.entries(data).map(([key, value]) => ({
          ...value,
          id: key 
        }));
        
        // Spread operator para garantir que o React perceba a mudança de estado e limpe a tela
        setServicosFinalizados([...listaTratada]);
      } else {
        // Se o banco retornar vazio (após exclusão do último item), limpa o estado local
        setServicosFinalizados([]);
      }
    });

    // Monitoramento do Estoque
    onValue(ref(db, 'estoque'), (snapshot) => {
      const data = snapshot.val();
      setItensEstoque(data ? Object.entries(data).map(([key, val]) => ({ id: key, ...val })) : []);
    });
  }, [usuarioLogado]);

  const processarBaixaEstoque = (servicoNome) => {
    if (!servicoNome) return;
    const nomeServico = servicoNome.toLowerCase().trim();
    const obrigatorios = ['shampoo', 'pretinho', 'cheirinho', 'limpa vidro'];
    let extras = [];

    if (nomeServico.includes('cera')) extras.push('cera');
    if (nomeServico.includes('resina')) extras.push('resina');
    if (nomeServico.includes('prime')) extras.push('prime');

    const listaParaBaixa = [...obrigatorios, ...extras];

    listaParaBaixa.forEach(termoBusca => {
      const itemEstoque = itensEstoque.find(i => 
        i.nome.toLowerCase().trim().includes(termoBusca)
      );
      
      if (itemEstoque) {
        const consumo = 0.1;
        const atual = Number(itemEstoque.quantidade_atual);
        update(ref(db, `estoque/${itemEstoque.id}`), {
          quantidade_atual: Math.max(0, atual - consumo)
        });
      }
    });
  };

  const concluirServico = (id) => {
    const veiculo = veiculosNoPatio.find(v => v.id === id);
    if (veiculo) setModalPagamento({ aberto: true, veiculo: veiculo });
  };

  const finalizarComPagamento = (metodo) => {
    const { veiculo } = modalPagamento;
    if (!veiculo) return;

    const taxaMaquininha = (metodo === 'credito' || metodo === 'debito') ? 0.03 : 0;
    const valorOriginal = Number(veiculo.valor || 0);
    const valorLiquidoReal = valorOriginal * (1 - taxaMaquininha);

    push(ref(db, 'financeiro'), { 
      ...veiculo, 
      pagamento: metodo,
      taxaDeducao: valorOriginal * taxaMaquininha,
      valorLiquidoReal: valorLiquidoReal,
      fluxo: 'entrada',
      horaSaida: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dataRegistro: new Date().toLocaleDateString('pt-BR'),
      timestamp: Date.now()
    });
    
    processarBaixaEstoque(veiculo.servico);
    remove(ref(db, `patio/${veiculo.id}`));
    setModalPagamento({ aberto: false, veiculo: null });
  };

  const adicionarVeiculo = (novoVeiculo) => {
    push(ref(db, 'patio'), {
      ...novoVeiculo,
      status: 'fila',
      timestamp: Date.now(),
      dataRegistro: new Date().toLocaleDateString('pt-BR')
    });
  };

  const handleLogout = () => signOut(auth);

  if (carregando) return null;
  if (!usuarioLogado) return <LoginAdmin onLoginSucesso={() => setUsuarioLogado(true)} />;

  const faturamentoTotal = servicosFinalizados.reduce((acc, curr) => acc + Number(curr.valorLiquidoReal || curr.valor || 0), 0);
  const descontosTotais = servicosFinalizados.reduce((acc, curr) => acc + Number(curr.desconto || 0), 0);
  const itensCriticos = itensEstoque.filter(i => (Number(i.quantidade_atual) / Number(i.quantidade_total)) * 100 <= 30);

  return (
    <div className="flex min-h-screen bg-[#0b0f1a] text-white font-sans selection:bg-blue-500/30 font-black">
      
      {/* Sidebar Estratégica */}
      <aside className="w-64 bg-[#161b2c] border-r border-slate-800 flex flex-col p-6 fixed h-full z-50 shadow-2xl">
        <h2 className="text-2xl font-black italic text-blue-500 mb-8 tracking-tighter uppercase leading-none">
          Anúbis<br/><span className="text-white font-black">Tech</span>
        </h2>
        
        <nav className="flex-1 space-y-4">
          <button onClick={() => setTelaAtiva('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest ${telaAtiva === 'dashboard' ? 'bg-blue-600 shadow-lg shadow-blue-600/20 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> Painel
          </button>
          <button onClick={() => setTelaAtiva('checkin')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest ${telaAtiva === 'checkin' ? 'bg-blue-600 shadow-lg shadow-blue-600/20 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <UserPlus size={20} /> Check-in
          </button>
          <button onClick={() => setTelaAtiva('patio')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest ${telaAtiva === 'patio' ? 'bg-blue-600 shadow-lg shadow-blue-600/20 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <ClipboardList size={20} /> Pátio
          </button>
          <button onClick={() => setTelaAtiva('financeiro')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest ${telaAtiva === 'financeiro' ? 'bg-blue-600 shadow-lg shadow-blue-600/20 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Wallet size={20} /> Financeiro
          </button>
          <button onClick={() => setTelaAtiva('estoque')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest ${telaAtiva === 'estoque' ? 'bg-blue-600 shadow-lg shadow-blue-600/20 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Package size={20} /> ESTOQUE
          </button>
          <button onClick={() => setTelaAtiva('auditoria')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest ${telaAtiva === 'auditoria' ? 'bg-purple-600 shadow-lg shadow-purple-600/20 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <ShieldCheck size={20} /> Auditoria Estratégica
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-3 text-slate-500 hover:text-red-500 transition-all font-black uppercase text-[10px] tracking-widest">
          <LogOut size={20} /> Sair
        </button>
      </aside>

      <main className="flex-1 ml-64 p-8">
        {telaAtiva === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-10">
              <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">ControlFlow 2.0</h1>
              <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Sistema Ativo</span>
              </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 flex justify-between relative overflow-hidden shadow-2xl">
                <div className="z-10 font-black"><p className="text-slate-500 text-[10px] uppercase mb-1">Receita Real</p><h3 className="text-3xl italic text-green-500 tracking-tighter">R$ {faturamentoTotal.toFixed(2)}</h3></div>
                <DollarSign size={40} className="text-[#0b0f1a] absolute -right-2 -bottom-2 opacity-20" />
              </div>
              <div className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 flex justify-between relative overflow-hidden shadow-2xl">
                <div className="z-10 font-black"><p className="text-slate-500 text-[10px] uppercase mb-1 text-red-400">Marketing (Descontos)</p><h3 className="text-3xl italic text-red-500 tracking-tighter">R$ {descontosTotais.toFixed(2)}</h3></div>
                <Percent size={40} className="text-[#0b0f1a] absolute -right-2 -bottom-2 opacity-20" />
              </div>
              <div className="bg-[#161b2c] p-6 rounded-3xl border border-slate-800 flex justify-between relative overflow-hidden shadow-2xl">
                <div className="z-10 font-black"><p className="text-slate-500 text-[10px] uppercase mb-1 text-cyan-400">Insumos Críticos</p><h3 className={`text-3xl italic tracking-tighter ${itensCriticos.length > 0 ? 'text-red-500' : 'text-slate-500'}`}>{itensCriticos.length}</h3></div>
                <Package size={40} className="text-[#0b0f1a] absolute -right-2 -bottom-2 opacity-20" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div onClick={() => setTelaAtiva('patio')} className="bg-[#161b2c] p-8 rounded-3xl border border-slate-800 cursor-pointer hover:border-blue-500 transition-all group shadow-xl font-black">
                  <div className="flex gap-4 mb-4"><div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500"><Car size={24} /></div><span className="text-slate-500 text-[10px] uppercase mt-4 text-white">Veículos no Pátio</span></div>
                  <h3 className="text-6xl italic text-blue-500 tracking-tighter">{veiculosNoPatio.length}</h3>
               </div>
               <div className="bg-[#161b2c] p-8 rounded-3xl border border-slate-800 shadow-xl font-black">
                  <div className="flex gap-4 mb-4"><div className="bg-cyan-500/10 p-3 rounded-2xl text-cyan-500"><TrendingUp size={24} /></div><span className="text-slate-500 text-[10px] uppercase mt-4 text-white">Performance</span></div>
                  <p className="text-lg italic text-white leading-tight uppercase tracking-tighter">Ticket Médio:<br/><span className="text-cyan-500 text-3xl">R$ {servicosFinalizados.length > 0 ? (faturamentoTotal / servicosFinalizados.length).toFixed(2) : "0.00"}</span></p>
               </div>
            </div>
          </div>
        )}

        {telaAtiva === 'checkin' && <CheckIn onBack={() => setTelaAtiva('dashboard')} onFinalizar={adicionarVeiculo} />}
        {telaAtiva === 'patio' && <Patio onBack={() => setTelaAtiva('dashboard')} veiculos={veiculosNoPatio} onConcluir={concluirServico} />}
        {telaAtiva === 'financeiro' && <Financeiro onBack={() => setTelaAtiva('dashboard')} historico={servicosFinalizados} total={faturamentoTotal} />}
        {telaAtiva === 'estoque' && <Estoque onBack={() => setTelaAtiva('dashboard')} itens={itensEstoque} />}
        {telaAtiva === 'auditoria' && <AuditoriaExecutiva onBack={() => setTelaAtiva('dashboard')} historico={servicosFinalizados} />}
      </main>

      {/* Modal de Finalização de Pagamento */}
      {modalPagamento.aberto && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-[#161b2c] w-full max-w-sm rounded-[3rem] border border-slate-800 p-10 shadow-2xl animate-in zoom-in font-black">
            <h3 className="text-xl italic uppercase text-white tracking-tighter mb-8 text-center">Registrar Pagamento</h3>
            <div className="grid grid-cols-1 gap-3">
              {['pix', 'dinheiro', 'debito', 'credito'].map((metodo) => (
                <button 
                  key={metodo} 
                  onClick={() => finalizarComPagamento(metodo)} 
                  className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-blue-600 transition-all uppercase text-[10px] text-white tracking-widest font-black"
                >
                  {metodo}
                </button>
              ))}
              <button onClick={() => setModalPagamento({ aberto: false, veiculo: null })} className="mt-4 text-slate-500 uppercase text-[9px] hover:text-white w-full text-center">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;