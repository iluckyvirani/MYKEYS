import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';

/**
 * POST /api/owner/reviews/[reviewId]/response
 * Owner responds to a review on their property
 */
export const POST = withAuth(async (request: NextRequest, user: JWTPayload, context: any) => {
  try {
    const { reviewId } = await context.params;
    const body = await request.json();

    if (!body.response || body.response.trim().length === 0) {
      return NextResponse.json(
        { error: 'Response text is required' },
        { status: 400 }
      );
    }

    // Fetch the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        property: {
          select: { ownerId: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Verify user is the property owner
    if (review.property?.ownerId !== user.userId) {
      return NextResponse.json(
        { error: 'Only property owner can respond to reviews' },
        { status: 403 }
      );
    }

    // Update the review with the response
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        response: body.response.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedReview,
        message: 'Response added successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error responding to review:', error);
    return NextResponse.json(
      { error: 'Failed to respond to review' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/owner/reviews/[reviewId]/response
 * Owner deletes their response to a review
 */
export const DELETE = withAuth(async (request: NextRequest, user: JWTPayload, context: any) => {
  try {
    const { reviewId } = await context.params;

    // Fetch the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        property: {
          select: { ownerId: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Verify user is the property owner
    if (review.property?.ownerId !== user.userId) {
      return NextResponse.json(
        { error: 'Only property owner can delete their response' },
        { status: 403 }
      );
    }

    // Check if there's a response to delete
    if (!review.response) {
      return NextResponse.json(
        { error: 'No response found to delete' },
        { status: 404 }
      );
    }

    // Delete the response
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        response: null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Response deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting review response:', error);
    return NextResponse.json(
      { error: 'Failed to delete response' },
      { status: 500 }
    );
  }
});
