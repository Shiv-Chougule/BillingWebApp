import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Item from '../../../models/Expenses';

// POST: Create new item
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
        category,
        date,
        amount,
        paymentMethod,
        description,
        invoiceID
    } = body;

    const newItem = new Item({
        category,
        date,
        amount,
        paymentMethod,
        description,
        invoiceID
    });

    await newItem.save();

    return NextResponse.json({ message: 'Item created successfully', item: newItem }, { status: 201 });
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

    // Return the items as an array directly
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error('GET API error:', error.message, error.stack);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}