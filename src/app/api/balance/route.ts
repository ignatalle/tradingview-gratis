import { NextResponse } from 'next/server';
import { getWallet, setWallet } from '@/lib/server/memory';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const data = await request.json(); 
        
        // Permite resetear la billetera o forzar un balance específico
        setWallet({
            balance: data.balance ? Number(data.balance) : 10000.00,
            asset: data.asset || "USDT"
        });
        
        return NextResponse.json({ success: true, wallet: getWallet() });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 400 });
    }
}

export async function GET() {
    const wallet = getWallet();
    
    // Formatear el balance para que no tenga demasiados decimales en UI
    const formattedBalance = wallet.asset === 'USDT' 
        ? wallet.balance.toFixed(2) 
        : wallet.balance.toFixed(6);

    return NextResponse.json({
        balance: formattedBalance,
        asset: wallet.asset
    });
}
