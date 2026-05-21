import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Memoria temporal: guardará las últimas 50 operaciones
let operaciones: Array<{
  accion: string;
  precio: number;
  par: string;
  time: number;
}> = [];

export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        // Agregar timestamp si no viene incluido
        const nuevaOperacion = {
            accion: data.accion,
            precio: Number(data.precio),
            par: data.par || "BTCUSDT",
            time: data.time || Math.floor(Date.now() / 1000)
        };

        operaciones.push(nuevaOperacion);

        // Mantener solo las últimas 50 operaciones
        if (operaciones.length > 50) {
            operaciones = operaciones.slice(operaciones.length - 50);
        }

        return NextResponse.json({ success: true, operacion: nuevaOperacion });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 400 });
    }
}

export async function GET() {
    return NextResponse.json(operaciones);
}
