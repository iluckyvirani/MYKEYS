import { NextRequest, NextResponse } from 'next/server';
import { inquiryService } from '@/lib/inquiries/inquiryService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const inquiry = await inquiryService.getById(params.id);
    if (!inquiry) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    return NextResponse.json(inquiry);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch inquiry' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const inquiry = await inquiryService.update(params.id, data);
    return NextResponse.json(inquiry);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const inquiry = await inquiryService.delete(params.id);
    return NextResponse.json(inquiry);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
  }
}
