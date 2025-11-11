import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Vendor from '../../../models/Vendor';

export async function POST(request) {
  try {
    await connectDB(); // Connect to MongoDB

    const body = await request.json();

    const {
      vendorName,
      companyName,
      firstName,
      lastName,
      email,
      phone,
      pan,
      address1,
      address2,
      city,
      state,
      country,
      zipCode,
      altName,
      altPhone,
      altEmail,
    } = body;

    // Validation helper function
    const isValidString = (val) => typeof val === 'string' && val.trim().length > 0;

    // Validate required fields
    if (!isValidString(vendorName)) {
      return NextResponse.json({ error: 'Vendor name is required' }, { status: 400 });
    }
    if (!isValidString(phone)) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    // Optional fields: validate type if provided
    const errors = [];

    if (email && typeof email !== 'string') errors.push('Email must be a string');
    if (altEmail && typeof altEmail !== 'string') errors.push('Alt Email must be a string');
    if (companyName && typeof companyName !== 'string') errors.push('Company name must be a string');
    if (firstName && typeof firstName !== 'string') errors.push('First name must be a string');
    if (lastName && typeof lastName !== 'string') errors.push('Last name must be a string');
    if (pan && typeof pan !== 'string') errors.push('PAN must be a string');
    if (address1 && typeof address1 !== 'string') errors.push('Address1 must be a string');
    if (address2 && typeof address2 !== 'string') errors.push('Address2 must be a string');
    if (city && typeof city !== 'string') errors.push('City must be a string');
    if (state && typeof state !== 'string') errors.push('State must be a string');
    if (country && typeof country !== 'string') errors.push('Country must be a string');
    if (zipCode && typeof zipCode !== 'string') errors.push('Zip Code must be a string');
    if (altName && typeof altName !== 'string') errors.push('Alt Name must be a string');
    if (altPhone && typeof altPhone !== 'string') errors.push('Alt Phone must be a string');

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const newVendor = new Vendor({
      vendorName,
      companyName,
      firstName,
      lastName,
      email,
      phone,
      pan,
      address1,
      address2,
      city,
      state,
      country,
      zipCode,
      altName,
      altPhone,
      altEmail,
    });

    await newVendor.save();

    return NextResponse.json({ message: 'Vendor created successfully', Vendor: newVendor }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    if (vendorId) {
      // Fetch a specific vendor by ID
      const vendor = await Vendor.findById(vendorId);

      if (!vendor) {
        return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
      }

      return NextResponse.json(vendor);
    }

    // Fetch all vendors if no vendorId is provided
    const vendors = await Vendor.find();
    return NextResponse.json({ vendors });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}
export async function PUT(request) {
  try {
    await connectDB();

    // Get vendorId from URL
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('id'); // or 'vendorId' depending on what you use

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
    }

    const body = await request.json();
    
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId, 
      body, // Use entire body as update data
      { new: true }
    );

    if (!updatedVendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Vendor updated successfully', 
      vendor: updatedVendor 
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    const deletedVendor = await Vendor.findByIdAndDelete(id);
    
    if (!deletedVendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Vendor deleted successfully',
        vendor: deletedVendor 
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