import { NextRequest, NextResponse } from 'next/server';
import { packageService } from '@/lib/packages/packageService';

export async function GET() {
  try {
    const packages = await packageService.getAll();
    return NextResponse.json(packages);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const pkg = await packageService.create(data);
    return NextResponse.json(pkg, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}
