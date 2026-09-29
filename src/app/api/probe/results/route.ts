import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inngest } from '@/inngest/client';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    // Hash the token to compare with DB (SHA-256)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const probe = await prisma.probe.findFirst({
      where: { tokenHash, isActive: true }
    });

    if (!probe) {
      return NextResponse.json({ error: 'Invalid probe token' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.results || !Array.isArray(body.results)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Update probe lastSeenAt
    await prisma.probe.update({
      where: { id: probe.id },
      data: { lastSeenAt: new Date() }
    });

    const savedResults = [];

    for (const res of body.results) {
      // Validate structure
      if (!res.websiteId || !res.status) continue;

      const record = await prisma.probeCheckResult.create({
        data: {
          websiteId: res.websiteId,
          probeId: probe.id,
          status: res.status,
          blockType: res.blockType || null,
          stage: res.stage || null,
          resolvedIps: res.resolvedIps ? JSON.stringify(res.resolvedIps) : null,
          httpStatus: res.httpStatus || null,
          redirectChain: res.redirectChain ? JSON.stringify(res.redirectChain) : null,
          errorCode: res.errorCode || null,
          latencyMs: res.latencyMs || null,
          checkedAt: res.checkedAt ? new Date(res.checkedAt) : new Date(),
        }
      });
      
      savedResults.push(record);

      // Trigger Aggregation Job per website
      await inngest.send({
        name: 'website/aggregate.probe',
        data: {
          websiteId: res.websiteId,
        }
      });
    }

    return NextResponse.json({ success: true, count: savedResults.length });
  } catch (error: any) {
    console.error('Probe API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
