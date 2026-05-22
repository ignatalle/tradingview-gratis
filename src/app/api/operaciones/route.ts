import { NextResponse } from 'next/server';
import { getWallet, setWallet, addOperacion, getOperaciones, Operacion } from '@/lib/server/memory';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        const accion = data.accion as 'COMPRA' | 'VENTA';
        const precio = Number(data.precio);
        const par = data.par || "BTCUSDT";
        const time = data.time || Math.floor(Date.now() / 1000);

        if (!accion || isNaN(precio)) {
            return NextResponse.json({ success: false, error: 'Faltan datos requeridos (accion, precio)' }, { status: 400 });
        }

        const wallet = getWallet();
        let cantidad = 0;
        let total = 0;

        // MOTOR DE PAPER TRADING
        if (accion === 'COMPRA') {
            // Compramos con todo el saldo de USDT
            if (wallet.asset === 'USDT' && wallet.balance > 0) {
                cantidad = wallet.balance / precio;
                total = wallet.balance;
                
                // Actualizar billetera
                setWallet({
                    asset: par.replace('USDT', ''), // ej: BTC
                    balance: cantidad
                });
            }
        } else if (accion === 'VENTA') {
            // Vendemos toda la cripto a USDT
            if (wallet.asset !== 'USDT' && wallet.balance > 0) {
                cantidad = wallet.balance;
                total = wallet.balance * precio;
                
                // Actualizar billetera
                setWallet({
                    asset: 'USDT',
                    balance: total
                });
            }
        }

        const nuevaOperacion: Operacion = {
            accion,
            precio,
            par,
            time,
            cantidad,
            total
        };

        addOperacion(nuevaOperacion);

        return NextResponse.json({ success: true, operacion: nuevaOperacion, wallet: getWallet() });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 400 });
    }
}

export async function GET() {
    return NextResponse.json(getOperaciones());
}
