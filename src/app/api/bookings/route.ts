import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/lib/bookings/bookingService';

export async function GET() {
  try {
    const bookings = await bookingService.getAll();
    return NextResponse.json(bookings);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const booking = await bookingService.create(data);
    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
