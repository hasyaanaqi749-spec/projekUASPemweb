import { NextResponse } from 'next/server';
import { createBookingAction } from '@/app/actions/bookingActions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createBookingAction(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Format permintaan tidak valid.' }, { status: 500 });
  }
}