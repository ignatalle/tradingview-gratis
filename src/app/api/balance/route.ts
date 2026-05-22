import { NextResponse } from 'next/server';
import { getWallet } from '@/lib/server/memory';

export const dynamic = 'force-dynamic';

export async function GET() {
  const wallet = getWallet();
  return NextResponse.json(wallet);
}
