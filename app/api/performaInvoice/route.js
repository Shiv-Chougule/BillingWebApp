import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Invoice from '../../../models/PerformaInvoice';
import Customer from '../../../models/Customer'; 
import Stock from '../../../models/Stocks'; 
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    console.log("Incoming data:", body);

    // Validate required fields - only these are required 
const requiredFields = [
  'customer','invoiceNumber', 'salesperson',
  'invoiceDate', 'dueDate', 'items'
];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate customer ID
    if (!mongoose.Types.ObjectId.isValid(body.customer)) {
      return NextResponse.json(
        { error: "Invalid customer ID format" },
        { status: 400 }
      );
    }

    // Check if customer exists
    const customerExists = await Customer.findById(body.customer);
    if (!customerExists) {
      return NextResponse.json(
        { error: "Customer not found with the provided ID" },
        { status: 404 }
      );
    }
      // Check if stock exists
      const stockExists = await Stock.findById(body.stock);
      if (!stockExists) {
        return NextResponse.json(
          { error: "Stock not found with the provided ID" },
          { status: 404 }
        );
      }
    // Check for duplicate invoice number
    const existingInvoice = await Invoice.findOne({ invoiceNumber: body.invoiceNumber });
    if (existingInvoice) {
      return NextResponse.json(
        { error: "Invoice number already exists" },
        { status: 409 }
      );
    }

    // Date validation (unchanged)
    let parsedInvoiceDate, parsedDueDate;
    try {
      if (typeof body.invoiceDate !== 'string' || typeof body.dueDate !== 'string') {
        throw new Error('Dates must be provided as strings');
      }

      parsedInvoiceDate = new Date(body.invoiceDate);
      parsedDueDate = new Date(body.dueDate);

      if (isNaN(parsedInvoiceDate.getTime())) {
        throw new Error(`Invalid invoice date: ${body.invoiceDate}`);
      }
      if (isNaN(parsedDueDate.getTime())) {
        throw new Error(`Invalid due date: ${body.dueDate}`);
      }

      if (parsedDueDate < parsedInvoiceDate) {
        throw new Error('Due date must be after invoice date');
      }
    } catch (dateError) {
      console.error('Date validation failed:', dateError);
      return NextResponse.json(
        { 
          error: "Invalid date format",
          details: dateError.message,
          expectedFormat: "YYYY-MM-DD",
          received: {
            invoiceDate: body.invoiceDate,
            dueDate: body.dueDate
          }
        },
        { status: 400 }
      );
    }

    // Validate items (unchanged)
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }

    const validatedItems = body.items.map(item => {
      const amount = item.amount || item.price * item.quantity * (1 + (item.gst || 0)/100);
      return {
        name: item.name,
        quantity: Math.max(1, item.quantity || 1),
        price: Math.max(0, item.price || 0),
        gst: Math.max(0, item.gst || 0),
        discount: Math.max(0, item.discount || 0),
        amount: parseFloat(amount.toFixed(2) || Number(item.amount)),
        stockId: item.stockId || null 
      };
    });

    // Calculate totals (unchanged)
    const calculatedSubTotal = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const calculatedTotal = calculatedSubTotal + 
      validatedItems.reduce((sum, item) => sum + (item.price * item.quantity * item.gst/100), 0) +
      (body.adjustment || 0) - 
      (body.discount || 0);

      let stockValue = null;
if (body.stock) {
  stockValue = body.stock;
} else {
  // Try to get stock from items, or use null
  const stockItems = validatedItems.filter(item => item.stockId);
  stockValue = stockItems.length > 0 ? stockItems[0].stockId : null;
}
    // Create new invoice with customer reference
    const newInvoice = new Invoice({
      customer: body.customer,
      stock: stockValue,  
      invoiceNumber: body.invoiceNumber,
      salesperson: body.salesperson || '',
      orderNumber: body.orderNumber || '',
      subject: body.subject || '',
      paymentStatus: body.paymentStatus || 'pending',
      performaStatus: body.performaStatus || 'pending Approval',
      terms: body.terms || '',
      invoiceDate: parsedInvoiceDate,
      dueDate: parsedDueDate,
      items: validatedItems,
      subTotal: body.subTotal || calculatedSubTotal,
      adjustment: body.adjustment || 0,
      discount: body.discount || 0,
      total: body.total || calculatedTotal,
      totalPaid: body.paymentStatus === 'paid' ? (body.total) : 0,
      
    });

    await newInvoice.save();
    return NextResponse.json(
      { 
        message: 'Invoice created successfully',
        invoice: newInvoice 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {  
        error: "Internal server error",
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message,
          stack: error.stack
        })
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const { invoiceIds, PerformaStatus } = await request.json();

    // Validate required fields
    if (!invoiceIds || !PerformaStatus) {
      return NextResponse.json(
        { error: "Both invoiceIds and PerformaStatus are required" },
        { status: 400 }
      );
    }

    // Validate invoiceIds is an array
    if (!Array.isArray(invoiceIds)) {
      return NextResponse.json(
        { error: "invoiceIds must be an array" },
        { status: 400 }
      );
    }

    // Validate each invoice ID
    const invalidIds = invoiceIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid invoice ID format: ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate PerformaStatus
    const validStatuses = ['Pending Approval', 'Cancelled', 'Approved', 'Converted to Sales'];
    if (!validStatuses.includes(PerformaStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Update invoices
    const result = await Invoice.updateMany(
      { _id: { $in: invoiceIds } },
      { $set: { performaStatus: PerformaStatus } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "No invoices found with the provided IDs" },
        { status: 404 }
      );
    }

    // Fetch updated invoices to return
    const updatedInvoices = await Invoice.find({ _id: { $in: invoiceIds } })
      .populate({
        path: 'customer',
        select: 'customerName firstName lastName companyName email phone'
      });

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} invoice(s) updated successfully`,
      updatedCount: result.modifiedCount,
      invoices: updatedInvoices
    });

  } catch (error) {
    console.error('Error updating invoice status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update invoice status',
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const itemName = searchParams.get('item');
    const paymentStatus = searchParams.get('status');
    const aggregate = searchParams.get('aggregate');

    let query = {};
    
    // Customer ID filter
    if (customerId) {
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return NextResponse.json(
          { error: "Invalid customer ID format" },
          { status: 400 }
        );
      }
      query.customer = customerId;
    }

    // Item name filter
    if (itemName) {
      query['items.name'] = itemName;
    }

    // Payment status filter
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Aggregation for customer totals
    if (aggregate === 'totals' && customerId) {
      const result = await Invoice.aggregate([
        { $match: { customer: new mongoose.Types.ObjectId(customerId) } },
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

    // Main query for invoices
    const invoices = await Invoice.find(query)
      .populate({
        path: 'customer',
        select: 'customerName firstName lastName companyName email phone'
      })
      .sort({ invoiceDate: -1 });

    // Transform data only when filtering by item
    if (itemName) {
      const transformedData = invoices.map(invoice => {
        const item = invoice.items.find(i => i.name === itemName) || invoice.items[0];
        const customerName = invoice.customer?.customerName || 
                           `${invoice.customer?.firstName} ${invoice.customer?.lastName}` || 
                           invoice.customer?.companyName;
        
        return {
          date: invoice.invoiceDate,
          invoiceNumber: invoice.invoiceNumber,
          customerName: customerName || 'Unknown Customer',
          quantity: item?.quantity || 0,
          itemPrice: item?.price || 0,
          totalAmount: invoice.total,
          status: invoice.paymentStatus || 'pending',
          type: 'sale'
        };
      });

      return NextResponse.json(transformedData);
    }

    // Return full invoice data when not filtering by item
    return NextResponse.json({ 
      success: true,
      count: invoices.length,
      invoices
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch invoices',
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}
// In your route.js
export async function DELETE(request) {
  try {
    await connectDB();
    
    // Extract ID from URL search parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Validate ID exists
    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid invoice ID format" },
        { status: 400 }
      );
    }

    // Delete the invoice
    const deletedInvoice = await Invoice.findByIdAndDelete(id);
    
    // Check if invoice was found and deleted
    if (!deletedInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Successful response
    return NextResponse.json(
      { 
        success: true,
        message: `Invoice ${deletedInvoice.invoiceNumber} deleted successfully`,
        deletedInvoiceId: deletedInvoice._id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete invoice error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete invoice',
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}