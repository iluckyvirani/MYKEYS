import { NextRequest, NextResponse } from 'next/server';
import { UpdateInquiryRequest, InquiryResponse } from '@/types/inquiry';

/**
 * GET /api/inquiries/{id}
 * Fetch a specific inquiry by ID
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Inquiry ID is required', data: null },
        { status: 400 }
      );
    }

    // TODO: Fetch inquiry from database
    // const inquiry = await inquiryService.getById(id);
    // if (!inquiry) return NextResponse.json({ success: false, message: 'Inquiry not found', data: null }, { status: 404 });

    return NextResponse.json(
      { success: false, message: 'Inquiry not found', data: null },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch inquiry', data: null },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/inquiries/{id}
 * Update inquiry status with owner response (owner action)
 * Only owner can respond to inquiries
 * Body: UpdateInquiryRequest
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body: UpdateInquiryRequest = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Inquiry ID is required', data: null },
        { status: 400 }
      );
    }

    if (!body.status || !body.ownerResponse) {
      return NextResponse.json(
        { success: false, message: 'status and ownerResponse are required', data: null },
        { status: 400 }
      );
    }

    // TODO:
    // 1. Verify user is the property owner
    // 2. Fetch inquiry from database
    // 3. Update status and ownerResponse
    // 4. Send email to guest with owner's response
    // 5. Update lastReplyAt timestamp

    const response: InquiryResponse = {
      success: true,
      message: `Inquiry status updated to ${body.status}`,
      data: {
        id,
        propertyId: 'PROP-1',
        propertyTitle: 'Sample Property',
        guestId: 'USER-1',
        guestName: 'Guest Name',
        guestEmail: 'guest@example.com',
        guestPhone: '1234567890',
        ownerId: 'OWNER-1',
        message: 'Initial inquiry message',
        ownerResponse: body.ownerResponse,
        status: body.status as any,
        inquiryType: 'LONG_RENT' as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update inquiry', data: null },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/inquiries/{id}
 * Close/delete an inquiry
 * Can be done by guest (original inquirer) or owner
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Inquiry ID is required', data: null },
        { status: 400 }
      );
    }

    // TODO:
    // 1. Verify user is either the guest or owner
    // 2. Mark inquiry as CLOSED instead of actually deleting
    // 3. Send notification email to both parties

    return NextResponse.json(
      { success: true, message: 'Inquiry closed successfully', data: null },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error closing inquiry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to close inquiry', data: null },
      { status: 500 }
    );
  }
}
