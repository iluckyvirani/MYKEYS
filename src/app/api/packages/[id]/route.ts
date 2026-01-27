import { NextRequest, NextResponse } from 'next/server';
import { packageService } from '@/lib/packages/packageService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pkg = await packageService.getById(params.id);
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    return NextResponse.json(pkg);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const pkg = await packageService.update(params.id, data);
    return NextResponse.json(pkg);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pkg = await packageService.delete(params.id);
    return NextResponse.json(pkg);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}
