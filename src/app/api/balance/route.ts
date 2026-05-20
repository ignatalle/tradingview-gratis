import { NextResponse } from 'next/server';

// Guardamos el saldo en memoria temporal del servidor
let saldoActual = { balance: "10000.00", asset: "USDT" };

export async function POST(request: Request) {
    try {
        const data = await request.json(); // Espera { balance: "9850.25" }
        saldoActual = {
            balance: Number(data.balance).toFixed(2),
            asset: data.asset || "USDT"
        };
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 400 });
    }
}

export async function GET() {
    return NextResponse.json(saldoActual);
}
