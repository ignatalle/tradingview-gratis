import { NextResponse } from 'next/server';
import { getWallet, setWallet, addOperacion, getOperaciones } from '@/lib/server/memory';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getOperaciones());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accion, par, precio } = body;

    if (!accion || !par) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos (accion, par)' }, { status: 400 });
    }

    // Si la señal no provee un precio, se asume un precio de referencia simulado para BTC
    const precioMercado = precio || 77000;
    const walletActual = getWallet();
    const timestamp = Math.floor(Date.now() / 1000);

    // LÓGICA DE COMPRA: Cambiar todo el saldo de USDT a Cripto
    if (accion === 'COMPRA') {
      if (walletActual.asset !== 'USDT' || walletActual.balance <= 0) {
        return NextResponse.json({ status: 'Ignorado', detalle: 'Billetera sin USDT disponibles para comprar' });
      }

      const cantidadComprada = walletActual.balance / precioMercado;
      const nuevaOperacion = {
        accion: 'COMPRA' as const,
        par,
        precio: precioMercado,
        cantidad: cantidadComprada,
        time: timestamp,
        total: walletActual.balance
      };

      addOperacion(nuevaOperacion);
      setWallet({ asset: 'BTC', balance: cantidadComprada });

      return NextResponse.json({ status: 'Procesado', detalle: 'Compra simulada con éxito', wallet: getWallet() });
    }

    // LÓGICA DE VENTA: Cambiar todo el saldo de Cripto a USDT
    if (accion === 'VENTA') {
      if (walletActual.asset !== 'BTC' || walletActual.balance <= 0) {
        return NextResponse.json({ status: 'Ignorado', detalle: 'Billetera sin activos cripto para vender' });
      }

      const totalUSDT = walletActual.balance * precioMercado;
      const nuevaOperacion = {
        accion: 'VENTA' as const,
        par,
        precio: precioMercado,
        cantidad: walletActual.balance,
        time: timestamp,
        total: totalUSDT
      };

      addOperacion(nuevaOperacion);
      setWallet({ asset: 'USDT', balance: totalUSDT });

      return NextResponse.json({ status: 'Procesado', detalle: 'Venta simulada con éxito', wallet: getWallet() });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
