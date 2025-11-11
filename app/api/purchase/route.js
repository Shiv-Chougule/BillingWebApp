import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Purchase from '../../../models/Purchase';
//import Vendor from '../../../models/Vendor';
import Stock from '../../../models/Stocks';

export async function POST(request) {
  try {
    await connectDB(); // Connect to MongoDB
 
    const body = await request.json();

    const {
      vendor, // Changed from vendorName to vendor (ObjectId)
      purchaseOrder,
      purchaseDate,
      dueDate,
      items,
      // Optional fields
      salesperson,
      referenceNumber,
      subject,
      terms,
      subTotal,
      total,
      adjustment = 0,
      discount = 0,
      paymentStatus = 'pending',
      totalPaid = 0,
      termsAndConditions,
      vendorNotes
    } = body;

    // Basic validation - only check required fields
    if (
      !vendor ||
      !purchaseOrder ||
      !purchaseDate ||
      !dueDate ||
      !items?.length ||
      subTotal === undefined ||
      total === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields: vendor, purchaseOrder, purchaseDate, dueDate, items, subTotal, and total are required' }, 
        { status: 400 }
      );
    }

    // Validate items structure
    for (const item of items) {
      if (!item.name || !item.quantity || !item.price || item.amount === undefined) {
        return NextResponse.json(
          { error: 'Invalid item structure: name, quantity, price, and amount are required for each item' },
          { status: 400 }
        );
      }
    }
    // Update stock quantities before creating the purchase
    const stockUpdates = [];
    const stockItems = [];
    
    for (const item of items) {
      if (item.itemId) {
        // Validate stock item exists
        const stockItem = await Stock.findById(item.itemId);
        if (!stockItem) {
          return NextResponse.json(
            { error: `Stock item with ID ${item.itemId} not found` },
            { status: 400 }
          );
        }
        
        // Add to stock updates
        stockUpdates.push({
          updateOne: {
            filter: { _id: item.itemId },
            update: { 
              $inc: { quantity: item.quantity },
              $set: { 
                purchasePrice: item.price, // Set the purchase price from the purchase item
                lastUpdated: new Date()
              }
            }
          }
        });
        
        stockItems.push(item.itemId);
      }
    }
      // Update all stock items in bulk
      if (stockUpdates.length > 0) {
        await Stock.bulkWrite(stockUpdates);
      }

    // Save the purchase
    const newPurchase = new Purchase({
      vendor,
      purchaseOrder,
      purchaseDate: new Date(purchaseDate),
      dueDate: new Date(dueDate),
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        gst: item.gst || 0,
        amount: item.amount,
        itemId: item.itemId || null
      })),
      stock: stockItems.length > 0 ? stockItems[0] : null,
      salesperson,
      referenceNumber,
      subject,
      terms,
      subTotal,
      adjustment,
      discount,
      total,
      paymentStatus,
      totalPaid,
      termsAndConditions,
      vendorNotes,
      // createdAt is automatically added
    });

    await newPurchase.save();

    return NextResponse.json(
      { 
        message: 'Purchase created successfully', 
        purchase: newPurchase 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error.message,
        ...(error.code === 11000 && { 
          duplicateError: 'Purchase order number must be unique' 
        })
      },
      { status: 500 }
    );
  }
}
export async function GET(request) { 
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const itemName = searchParams.get('item'); 
    const paymentStatus = searchParams.get('status');
    const aggregate = searchParams.get('aggregate');

    let query = {};
    
    // Vendor ID filter
    if (vendorId && vendorId.trim() !== '') {
      if (!mongoose.Types.ObjectId.isValid(vendorId)) {
        return NextResponse.json(
          { error: "Invalid vendor ID format" },
          { status: 400 }
        );
      }
      query.vendor = new mongoose.Types.ObjectId(vendorId);
    }

    // Item name filter
    if (itemName && itemName.trim() !== '') {
      query['items.name'] = new RegExp(itemName.trim(), 'i');
    }

    // Payment status filter
    if (paymentStatus && paymentStatus.trim() !== '') {
      query.paymentStatus = paymentStatus.trim();
    }

    // Aggregation for vendor totals
    if (aggregate === 'totals' && vendorId) {
      const result = await Purchase.aggregate([
        { $match: { vendor: new mongoose.Types.ObjectId(vendorId) } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$total" },
            totalPaid: { $sum: "$totalPaid" },
            count: { $sum: 1 }
          }
        }
      ]);

      return NextResponse.json({ 
        success: true,
        totals: result[0] || { totalAmount: 0, totalPaid: 0, count: 0 }
      });
    }
 
    // Main query for purchases - handle case where no filters are applied
    const purchases = await Purchase.find(query)
      .populate({
        path: 'vendor',
        select: 'vendorName firstName lastName companyName email phone'
      })
      .sort({ purchaseDate: -1 })
      .lean(); // Add lean() for better performance

    // Transform data only when filtering by item
    if (itemName && itemName.trim() !== '') {
      const transformedData = purchases.map(purchase => {
        const item = purchase.items.find(i => 
          i.name && i.name.toLowerCase().includes(itemName.toLowerCase())
        ) || purchase.items[0];
        
        const vendorName = purchase.vendor?.vendorName || 
                           `${purchase.vendor?.firstName || ''} ${purchase.vendor?.lastName || ''}`.trim() || 
                           purchase.vendor?.companyName || 'Unknown Vendor';
        
        return {
          date: purchase.purchaseDate,
          purchaseOrder: purchase.purchaseOrder,
          vendorName: vendorName,
          quantity: item?.quantity || 0,
          itemPrice: item?.price || 0,
          totalAmount: purchase.total,
          status: purchase.paymentStatus || 'pending',
          type: 'purchase'
        };
      });

      return NextResponse.json(transformedData);
    }

    // Return full purchase data when not filtering by item
    return NextResponse.json({ 
      success: true,
      count: purchases.length,
      purchases
    });

  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch purchases',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const purchaseId = searchParams.get('id');

    if (!purchaseId || !mongoose.Types.ObjectId.isValid(purchaseId)) {
      return NextResponse.json(
        { error: 'Invalid or missing purchase ID' },
        { status: 400 }
      );
    }

    const deletedPurchase = await Purchase.findByIdAndDelete(purchaseId);

    if (!deletedPurchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Purchase deleted successfully', purchase: deletedPurchase },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting purchase:', error);
    return NextResponse.json(
      { error: 'Failed to delete purchase', message: error.message },
      { status: 500 }
    );
  }
}   