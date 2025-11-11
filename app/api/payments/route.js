import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Payment from '../../../models/Payments';
import mongoose from 'mongoose';

export async function POST(request) {
  try { 
    await connectDB();
    const body = await request.json();

    // Convert string amounts to numbers
    const paymentData = {
      customerName: body.customerName,
      outstandingAmount: parseFloat(body.outstandingAmount),
      bankCharges: parseFloat(body.bankCharges || 0),
      paymentDate: new Date(body.paymentDate),
      paymentMode: body.paymentMode,
      paymentNumber: body.payment, // Map frontend's 'payment' to schema's 'paymentNumber'
      referenceNumber: body.referenceNumber,
      notes: body.notes,
      markedInvoices: body.markedInvoices?.map(invoice => ({
        invoiceId: new mongoose.Types.ObjectId(invoice.invoiceId),
        originalAmount: parseFloat(invoice.originalAmount),
        amountPaid: parseFloat(invoice.amountPaid),
        remainingAmount: parseFloat(invoice.remainingAmount)
      })),
      totalPaid: parseFloat(body.totalPaid)
    };

    // Validate required fields
    if (!paymentData.customerName || isNaN(paymentData.outstandingAmount) || !paymentData.paymentDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newPayment = await Payment.create(paymentData);

    return NextResponse.json(
      { success: true, data: newPayment },
      { status: 201 }
    );

  } catch (error) {
    console.error('Payment creation error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Payment reference already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const customerName = searchParams.get('customerName');
    const paymentMode = searchParams.get('paymentMode');

    let query = {};
    
    if (customerName) {
      query.customerName = new RegExp(customerName, 'i');
    }

    if (paymentMode) {
      query.paymentMode = paymentMode;
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'markedInvoices.invoiceId',
        select: 'invoiceNumber invoiceDate'
      })
      .sort({ paymentDate: -1 });

    // Return consistent response format
    return NextResponse.json({
      success: true,
      data: payments,
      count: payments.length
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch payments',
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}