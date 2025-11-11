import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Item from '../../../models/Bank';

// POST: Create new item
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
          transactionID,
          transactionDate,
          transactionType,
          amount,
          description
    } = body;

    const newItem = new Item({
          transactionID,
          transactionDate,
          transactionType,
          amount,
          description
    });

    await newItem.save();

    return NextResponse.json({ message: 'Entry created successfully', item: newItem }, { status: 201 });
  } catch (error) {
    console.error('API error:', error.message, error.stack);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET: Fetch all items
export async function GET() {
  try {
    await connectDB();

    const items = await Item.find();

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('GET API error:', error.message, error.stack);
    return NextResponse.json({ error: 'Failed to fetch Entry' }, { status: 500 });
  }
}

