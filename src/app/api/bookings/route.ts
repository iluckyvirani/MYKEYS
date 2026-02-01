import { NextRequest, NextResponse } from 'next/server';
import { CreateShortBookingRequest, BookingResponse, BookingListResponse, BookingFilters, ShortBookingDTO, BookingStatus, PaymentStatus, BookingType } from '@/types/bookings';

// Extend BookingFilters to include date range filters if not already defined
interface ExtendedBookingFilters extends BookingFilters {
  from?: string;
  to?: string;
}

/**
 * GET /api/bookings
 * Fetch bookings with filters
 * Query params: propertyId, guestId, ownerId, status, paymentStatus, from, to, page, pageSize
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const filters: ExtendedBookingFilters = {
      propertyId: searchParams.get('propertyId') || undefined,
      guestId: searchParams.get('guestId') || undefined,
      ownerId: searchParams.get('ownerId') || undefined,
      status: searchParams.get('status') as any || undefined,
      paymentStatus: searchParams.get('paymentStatus') as any || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '10'),
    };

    // TODO: Query database with filters
    // const bookings = await bookingService.getBookings(filters);

    // Hardcoded response structure for now
    const response: BookingListResponse = {
      success: true,
      message: 'Bookings retrieved successfully',
      data: {
        items: [],
        total: 0,
        page: filters.page || 1,
        pageSize: filters.pageSize || 10,
        totalPages: 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings', data: null },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings
 * Create a new short-term booking (nights-based)
 * Body: CreateShortBookingRequest
 */
export async function POST(req: NextRequest) {
  try {
    const body: CreateShortBookingRequest = await req.json();

    // Validate required fields
    if (!body.propertyId || !body.checkInDate || !body.checkOutDate || !body.numberOfGuests) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields', data: null },
        { status: 400 }
      );
    }

    // Validate dates
    const checkIn = new Date(body.checkInDate);
    const checkOut = new Date(body.checkOutDate);
    
    if (checkOut <= checkIn) {
      return NextResponse.json(
        { success: false, message: 'Check-out date must be after check-in date', data: null },
        { status: 400 }
      );
    }

    // TODO: 
    // 1. Fetch property details
    // 2. Validate numberOfGuests <= property.maxGuests
    // 3. Check property availability
    // 4. Calculate pricing
    // 5. Process payment
    // 6. Create booking in database
    // 7. Send confirmation email

    const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    const booking: ShortBookingDTO = {
      id: `BOOK-${Date.now()}`,
      bookingType: BookingType.SHORT_TERM,
      propertyId: body.propertyId,
      propertyTitle: 'Sample Property',
      guestId: 'USER-1', // TODO: Get from auth
      guestName: 'Guest Name',
      guestEmail: 'guest@example.com',
      guestPhone: '1234567890',
      checkInDate: body.checkInDate,
      checkOutDate: body.checkOutDate,
      numberOfNights,
      numberOfGuests: body.numberOfGuests,
      pricePerNight: 100, // TODO: From property
      totalNights: numberOfNights,
      subtotal: 100 * numberOfNights,
      cleaningFee: 50,
      serviceFee: 25,
      totalAmount: (100 * numberOfNights) + 50 + 25,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: body.paymentMethod,
      paidAmount: 0,
      balanceAmount: (100 * numberOfNights) + 50 + 25,
      status: BookingStatus.PENDING,
      specialRequests: body.specialRequests,
      ownerId: 'OWNER-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: BookingResponse = {
      success: true,
      message: 'Booking created successfully',
      data: booking,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create booking', data: null },
      { status: 500 }
    );
/* `>>>>>>> Stashed changes` is a merge conflict marker that indicates there are conflicting changes in
the code that need to be resolved. In this case, it appears that there are changes in the code that
were stashed (saved temporarily) and now there is a conflict when trying to merge those changes back
into the codebase. */
  }
}

