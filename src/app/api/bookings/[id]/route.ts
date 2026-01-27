import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/lib/bookings/bookingService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const booking = await bookingService.getById(params.id);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    return NextResponse.json(booking);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const booking = await bookingService.update(params.id, data);
    return NextResponse.json(booking);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const booking = await bookingService.delete(params.id);
    return NextResponse.json(booking);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
