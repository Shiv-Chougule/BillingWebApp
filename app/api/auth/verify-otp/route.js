import { NextResponse } from 'next/server';

// Access the same OTP store
const otpStore = new Map();

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    const storedData = otpStore.get(email);

    if (!storedData) {
      return NextResponse.json(
        { error: 'No OTP found for this email' },
        { status: 400 }
      );
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    if (storedData.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // OTP is valid, but don't delete it yet as it's needed for password reset
    return NextResponse.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
