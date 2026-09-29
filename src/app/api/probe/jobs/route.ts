import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const probe = await prisma.probe.findFirst({
      where: { tokenHash, isActive: true }
    });

    if (!probe) {
      return NextResponse.json({ error: 'Invalid probe token' }, { status: 401 });
    }

    // Get active websites
    const websites = await prisma.website.findMany({
      where: { isActive: true },
      select: { id: true, url: true }
    });

    // Get block signatures
    const sigs = await prisma.blockSignature.findMany({
      where: { isActive: true, OR: [{ isp: null }, { isp: probe.isp }] }
    });

    const signatures = {
      ips: sigs.filter(s => s.type === 'IP').map(s => s.value),
      hostnames: sigs.filter(s => s.type === 'HOSTNAME').map(s => s.value),
      keywords: sigs.filter(s => s.type === 'KEYWORD').map(s => s.value),
    };

    return NextResponse.json({
      probe: { id: probe.id, isp: probe.isp },
      websites,
      signatures
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
