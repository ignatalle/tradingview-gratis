'use client';

import React, { useEffect, useState } from 'react';

interface Operacion {
  accion: 'COMPRA' | 'VENTA';
  par: string;
  precio: number;
  cantidad: number;
  time: number;
  total: number;
}

interface WalletState {
  asset: 'USDT' | 'BTC' | 'ETH';
  balance: number;
}

export default function AnalyticsDashboard() {
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [wallet, setWallet] = useState<WalletState>({ asset: 'USDT', balance: 10000 });
  const [isMounted, setIsMounted] = useState(false);
  const CAPITAL_INICIAL = 10000;

  // Polling dinámico cada 3 segundos para mantener la interfaz viva
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resOps = await fetch('/api/operaciones', { cache: 'no-store' });
        const dataOps = await resOps.json();
        setOperaciones(dataOps);

        const resWallet = await fetch('/api/balance', { cache: 'no-store' });
        const dataWallet = await resWallet.json();
        
        // El endpoint devuelve balance como string para UI normal, lo convertimos a number para matemáticas aquí
        setWallet({
          asset: dataWallet.asset,
          balance: Number(dataWallet.balance)
        });
      } catch (err) {
        console.error('Error en el polling de analíticas:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    setIsMounted(true);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) {
    return <div className="w-full bg-[#0c0d14] px-6 py-8 min-h-[400px]"></div>;
  }

  // CÁLCULOS MATEMÁTICOS DEL PANEL
  const balanceActualUSDT = wallet.asset === 'USDT' 
    ? wallet.balance 
    : operaciones.length > 0 ? wallet.balance * operaciones[operaciones.length - 1].precio : CAPITAL_INICIAL;

  const pnlNeto = balanceActualUSDT - CAPITAL_INICIAL;
  const pnlPorcentaje = (pnlNeto / CAPITAL_INICIAL) * 100;

  // Lógica Opción A: Emparejar secuencialmente COMPRA y VENTA para calcular Win Rate
  let operacionesGanadas = 0;
  let ciclosCerrados = 0;

  for (let i = 0; i < operaciones.length; i++) {
    if (operaciones[i].accion === 'COMPRA' && operaciones[i + 1]?.accion === 'VENTA') {
      const precioCompra = operaciones[i].precio;
      const precioVenta = operaciones[i + 1].precio;
      if (precioVenta > precioCompra) {
        operacionesGanadas++;
      }
      ciclosCerrados++;
      i++; // Saltar la venta ya procesada en el bucle
    }
  }

  const winRate = ciclosCerrados > 0 ? (operacionesGanadas / ciclosCerrados) * 100 : 0;

  return (
    <div className="w-full bg-[#0c0d14] px-6 py-8 text-slate-200 border-t border-slate-800/50">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* TARJETAS DE MÉTRICAS (GLASSMORPHISM) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-lg">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Capital Inicial</p>
            <p className="text-2xl font-bold mt-2 text-slate-100">{CAPITAL_INICIAL.toFixed(2)} <span className="text-sm font-medium text-slate-400">USDT</span></p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-lg">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Balance Actual</p>
            <p className="text-2xl font-bold mt-2 text-slate-100">
              {wallet.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
              <span className="text-sm font-medium text-amber-400">{wallet.asset}</span>
            </p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-lg">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Rendimiento Neto (PnL)</p>
            <p className={`text-2xl font-bold mt-2 ${pnlNeto >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {pnlNeto >= 0 ? '+' : ''}{pnlNeto.toFixed(2)} USDT ({pnlPorcentaje.toFixed(2)}%)
            </p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-lg">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Efectividad (Win Rate)</p>
            <p className="text-2xl font-bold mt-2 text-slate-100">
              {winRate.toFixed(1)}% <span className="text-xs font-normal text-slate-400">({operacionesGanadas}/{ciclosCerrados} Trades)</span>
            </p>
          </div>
        </div>

        {/* TABLA DE HISTORIAL DE OPERACIONES */}
        <div className="bg-slate-900/20 border border-slate-800/60 rounded-xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Historial de Señales Ejecutadas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-400 bg-slate-900/10">
                  <th className="px-6 py-3 font-semibold">Fecha/Hora</th>
                  <th className="px-6 py-3 font-semibold">Activo</th>
                  <th className="px-6 py-3 font-semibold">Tipo</th>
                  <th className="px-6 py-3 font-semibold">Precio</th>
                  <th className="px-6 py-3 font-semibold">Cantidad</th>
                  <th className="px-6 py-3 font-semibold">Total Operado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {operaciones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500 font-medium">
                      Esperando la primera señal de TradingView...
                    </td>
                  </tr>
                ) : (
                  [...operaciones].reverse().map((op, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-3.5 text-slate-400 font-mono text-xs">
                        {new Date(op.time * 1000).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-200">{op.par}</td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${
                          op.accion === 'COMPRA' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {op.accion}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-slate-300">${op.precio.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-3.5 font-mono text-slate-300">{op.cantidad.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                      <td className="px-6 py-3.5 font-mono text-slate-400">${op.total.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
