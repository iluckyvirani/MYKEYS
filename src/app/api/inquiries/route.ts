import { NextRequest, NextResponse } from 'next/server';
import { inquiryService } from '@/lib/inquiries/inquiryService';

export async function GET() {
  try {
    const inquiries = await inquiryService.getAll();
    return NextResponse.json(inquiries);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const inquiry = await inquiryService.create(data);
    return NextResponse.json(inquiry, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 });
  }
}
