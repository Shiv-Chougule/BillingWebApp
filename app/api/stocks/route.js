import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Item from '../../../models/Stocks'; 

// POST: Create new item
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      category, 
      name, 
      quantity,
      type, 
      HSNCode, 
      itemCode,
      sellingPrice, 
      purchasePrice,
      account
    } = body;

    const newItem = new Item({
      category,
      name,
      quantity,
      type,
      HSNCode,
      itemCode,
      sellingPrice,
      purchasePrice,
      account
    });

    await newItem.save();

    return NextResponse.json({ message: 'Item created successfully', item: newItem }, { status: 201 });
  } catch (error) {
    console.error('API error:', error.message, error.stack);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET: Fetch all items or single item by ID
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Fetch single item by ID
      const item = await Item.findById(id);
      if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      return NextResponse.json({ item }, { status: 200 });
    } else {
      // Fetch all items
      const items = await Item.find();
      return NextResponse.json({ items }, { status: 200 });
    }
  } catch (error) {
    console.error('GET API error:', error.message, error.stack);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}
// PUT: Update item data (general update or quantity increment/decrement)
export async function PUT(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );  
    }

    const body = await request.json();
    const { action, quantity, ...updateData } = body;

    console.log('PUT /api/stocks request:', { id, action, quantity, updateData }); // Debug log

    // Check if item exists
    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    let update = {};
    
    // Handle quantity increment/decrement if action is specified
    if (action) {
      if (!['increment', 'decrement'].includes(action)) {
        return NextResponse.json(
          { error: 'Action must be either "increment" or "decrement"' },
          { status: 400 }
        );
      }

      if (!Number.isInteger(quantity) || quantity < 0) {
        return NextResponse.json(
          { error: 'Valid non-negative quantity required' },
          { status: 400 }
        );
      }

      console.log('Current stock:', item.quantity); // Debug log

      // Prevent negative stock
      if (action === 'decrement' && item.quantity < quantity) {
        return NextResponse.json(
          { 
            error: `Insufficient stock. Available: ${item.quantity}`,
            availableQuantity: item.quantity 
          },
          { status: 400 }
        );
      }

      update.$inc = { quantity: action === 'increment' ? quantity : -quantity };
    }

    // Handle general data updates (excluding quantity if action is used)
    if (Object.keys(updateData).length > 0) {
      // Remove quantity from updateData if we're handling it via action
      if (action && updateData.hasOwnProperty('quantity')) {
        delete updateData.quantity;
      }
      
      // Add the remaining update data
      Object.keys(updateData).forEach(key => {
        update[key] = updateData[key];
      });
    }

    console.log('Update operation:', update); // Debug log

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true }
    );

    console.log('Updated item:', updatedItem); // Debug log

    return NextResponse.json(
      { 
        message: 'Item updated successfully',
        item: updatedItem,
        ...(action && { 
          actionPerformed: action,
          quantityChanged: quantity 
        })
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/stocks error:', error);
    return NextResponse.json(
      { 
        error: 'Server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
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
        { error: 'stock ID is required' },
        { status: 400 }
      );
    }

    const deletedStock = await Item.findByIdAndDelete(id);
    
    if (!deletedStock) {
      return NextResponse.json(
        { error: 'stock not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'stock deleted successfully',
        stock: deletedStock 
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
