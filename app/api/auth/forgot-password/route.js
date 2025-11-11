import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';

// Configure nodemailer with more detailed options
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false // Only use this in development
  }
});

// Store OTPs temporarily (in production, use a proper database)
const otpStore = new Map();

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Verify email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email configuration missing');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Send email with OTP
    const mailOptions = {
      from: `"Password Reset" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Password Reset Request</h1>
          <p>Your OTP for password reset is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; color: #2563eb;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This OTP will expire in 5 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully to:', email);

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again later.' },
      { status: 500 }
    );
  }
}
