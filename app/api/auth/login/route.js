import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../../../../models/User';


export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create user object without password
    const userWithoutPassword = {
      _id: user._id,
      businessName: user.businessName,
      email: user.email,
      country: user.country,
      city: user.city,
      businessType: user.businessType,
      phone: user.phone,
      state: user.state,
      address: user.address,
      isGstRegistered: user.isGstRegistered,
      createdAt: user.createdAt,
    };

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
} 