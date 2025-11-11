import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Customer from '../../../models/Customer';

// Common validation function
const validateCustomerData = (body) => {
  const requiredFields = {
    customerName: 'Customer Name is required',
    companyName: 'Company Name is required',
    email: 'Email is required',
    phone: 'Phone is required'
  };

  const missingFields = Object.keys(requiredFields).filter( 
    field => !body[field] || body[field].trim() === ''
  );

  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: 'Missing required fields',
      details: missingFields.map(field => requiredFields[field])
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }

  return { isValid: true };
};

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate request body
    const validation = validateCustomerData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error, details: validation.details },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existingCustomer = await Customer.findOne({ email: body.email });
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 400 }
      );
    }

    // Create new customer
    const newCustomer = new Customer(body);
    await newCustomer.save();

    return NextResponse.json(
      { 
        message: 'Customer created successfully', 
        customer: newCustomer 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = validateCustomerData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error, details: validation.details },
        { status: 400 }
      );
    }

    // Check if customer exists
    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed to an existing one
    if (body.email && body.email !== existingCustomer.email) {
      const customerWithEmail = await Customer.findOne({ email: body.email });
      if (customerWithEmail) {
        return NextResponse.json(
          { error: 'Customer with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { 
        message: 'Customer updated successfully',
        customer: updatedCustomer
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const deletedCustomer = await Customer.findByIdAndDelete(id);
    
    if (!deletedCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Customer deleted successfully',
        customer: deletedCustomer 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Get single customer
      const customer = await Customer.findById(id);
      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ customer });
    } else {
      // Get all customers
      const customers = await Customer.find().sort({ createdAt: -1 });
      return NextResponse.json({ customers });
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}