import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Invoice from '../../../models/Invoice';
import Customer from '../../../models/Customer'; 
import Stock from '../../../models/Stocks';
import mongoose from 'mongoose';
import PerformaInvoice from '../../../models/PerformaInvoice';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    console.log("Incoming data:", body);

    // Check if this is a conversion from performa invoice
    const isPerformaConversion = body.convertedFromPerforma;

    if (isPerformaConversion) {
      // Handle performa invoice conversion
      return await handlePerformaConversion(body);
    } else {
      // Handle regular invoice creation (existing functionality)
      return await handleRegularInvoiceCreation(body);
    }

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

// Handle performa invoice conversion
async function handlePerformaConversion(body) {
  try {
    // Validate that we have the performa invoice ID
    if (!body.convertedFromPerforma) {
      return NextResponse.json(
        { error: "Performa invoice ID is required for conversion" },
        { status: 400 }
      );
    }

    // Fetch the performa invoice with populated customer
    const performaInvoice = await PerformaInvoice.findById(body.convertedFromPerforma)
      .populate('customer');
    
    if (!performaInvoice) {
      return NextResponse.json(
        { error: "Performa invoice not found" },
        { status: 404 }
      );
    }

    console.log("Performa invoice found:", performaInvoice);

    // Validate customer exists and get the ID
    const customerId = performaInvoice.customer?._id || performaInvoice.customer;
    if (!customerId) {
      return NextResponse.json(
        { error: "No customer associated with this performa invoice" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID format in performa invoice" },
        { status: 400 }
      );
    }

    const customerExists = await Customer.findById(customerId);
    if (!customerExists) {
      return NextResponse.json(
        { error: "Customer not found with the provided ID" },
        { status: 404 }
      );
    }

    // Check for duplicate invoice number
    const invoiceNumber = body.invoiceNumber || performaInvoice.invoiceNumber;
    const existingInvoice = await Invoice.findOne({ invoiceNumber });
    if (existingInvoice) {
      return NextResponse.json(
        { error: "Invoice number already exists" },
        { status: 409 }
      );
    }

    // Date validation
    let parsedInvoiceDate, parsedDueDate;
    try {
      parsedInvoiceDate = new Date(performaInvoice.invoiceDate);
      parsedDueDate = new Date(performaInvoice.dueDate);

      if (isNaN(parsedInvoiceDate.getTime())) {
        throw new Error(`Invalid invoice date: ${performaInvoice.invoiceDate}`);
      }
      if (isNaN(parsedDueDate.getTime())) {
        throw new Error(`Invalid due date: ${performaInvoice.dueDate}`);
      }

      if (parsedDueDate < parsedInvoiceDate) {
        throw new Error('Due date must be after invoice date');
      }
    } catch (dateError) {
      return NextResponse.json(
        { 
          error: "Invalid date format in performa invoice",
          details: dateError.message
        },
        { status: 400 }
      );
    }

    // Validate items
    if (!performaInvoice.items || !Array.isArray(performaInvoice.items) || performaInvoice.items.length === 0) {
      return NextResponse.json(
        { error: "Performa invoice must have at least one item" },
        { status: 400 }
      );
    }

    // Process stock updates and find the first valid stock ID
    const stockUpdates = [];
    let firstStockId = null;

    for (const item of performaInvoice.items) {
      if (item.stockId) {
        const stockItem = await Stock.findById(item.stockId);
        if (!stockItem) {
          return NextResponse.json(
            { error: `Stock item with ID ${item.stockId} not found` },
            { status: 400 }
          );
        }
        
        if (stockItem.quantity < item.quantity) {
          return NextResponse.json(
            { 
              error: `Insufficient stock for item: ${item.name}`,
              available: stockItem.quantity,
              requested: item.quantity,
              itemName: item.name
            },
            { status: 400 }
          );
        }
        
        stockUpdates.push({
          updateOne: {
            filter: { _id: item.stockId },
            update: { 
              $inc: { quantity: -item.quantity },
              $set: { lastUpdated: new Date() }
            }
          }
        });
        
        // Set the first valid stock ID
        if (!firstStockId) {
          firstStockId = item.stockId;
        }
      }
    }
    
    // Update stock if needed
    if (stockUpdates.length > 0) {
      await Stock.bulkWrite(stockUpdates);
    }

    // If no stock ID found in items, try to get one from the request body
    if (!firstStockId && body.stock) {
      firstStockId = body.stock;
    }

    // Prepare items with proper validation according to your schema
    const validatedItems = performaInvoice.items.map(item => {
      const baseAmount = (item.price || 0) * (item.quantity || 1);
      const gstAmount = baseAmount * ((item.gst || 0) / 100);
      const totalAmount = baseAmount + gstAmount - (item.discount || 0);
      
      return {
        name: item.name || 'Unnamed Item',
        quantity: Math.max(1, item.quantity || 1),
        price: Math.max(0, item.price || 0),
        gst: Math.max(0, item.gst || 0),
        discount: Math.max(0, item.discount || 0),
        amount: parseFloat(totalAmount.toFixed(2))
      };
    });

    // Calculate totals according to your schema requirements
    const calculatedSubTotal = validatedItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    
    const gstTotal = validatedItems.reduce((sum, item) => 
      sum + (item.price * item.quantity * item.gst / 100), 0);
    
    const calculatedTotal = calculatedSubTotal + gstTotal + 
      (Number(performaInvoice.adjustment) || 0) - 
      (Number(performaInvoice.discount) || 0);
    // Get stock ID from performa invoice
    const stockId = performaInvoice.stock?._id || performaInvoice.stock;

    if (!stockId) {
      return NextResponse.json(
        { error: "Performa invoice is missing stock reference" },
        { status: 400 }
      );
    }

    // Validate stock exists
    const stockExists = await Stock.findById(stockId);
    if (!stockExists) {
      return NextResponse.json(
        { error: "Stock item not found with the provided ID" },
        { status: 404 }
      );
    }

    // Use the stock ID in the new invoice
    const newInvoice = new Invoice({
      customer: customerId,
      stock: stockId, // Use the stock ID from performa invoice// This is required by your schema
      invoiceNumber: invoiceNumber,
      salesperson: performaInvoice.salesperson || 'Unknown Salesperson', // Required by schema
      orderNumber: performaInvoice.orderNumber || '',
      subject: performaInvoice.subject || `Converted from Performa Invoice ${performaInvoice.invoiceNumber}`,
      paymentStatus: 'Pending', // Must match your schema enum
      terms: performaInvoice.terms || '',
      invoiceDate: parsedInvoiceDate,
      dueDate: parsedDueDate,
      items: validatedItems,
      subTotal: performaInvoice.subTotal || calculatedSubTotal,
      adjustment: performaInvoice.adjustment || 0,
      discount: performaInvoice.discount || 0,
      total: performaInvoice.total || calculatedTotal,
      totalPaid: 0,
      convertedFromPerforma: performaInvoice._id
    });

    console.log("Creating invoice with data:", newInvoice);

    await newInvoice.save();

    // Update the performa invoice status to "Converted to Sales"
    await PerformaInvoice.findByIdAndUpdate(
      performaInvoice._id,
      { performaStatus: "Converted to Sales" }
    );

    return NextResponse.json(
      { 
        message: 'Performa invoice converted to sales successfully',
        invoice: newInvoice 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Performa conversion error:", error);
    return NextResponse.json(
      { 
        error: "Failed to convert performa invoice",
        details: error.message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack
        })
      },
      { status: 500 }
    );
  }
}
// Handle regular invoice creation (existing functionality)
async function handleRegularInvoiceCreation(body) {
  // Your existing regular invoice creation code goes here
  // This should be the exact same code that was in your original POST function
  // I'll include it for completeness:

  const requiredFields = [
    'customer', 'invoiceNumber',
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

  // Check for duplicate invoice number
  const existingInvoice = await Invoice.findOne({ invoiceNumber: body.invoiceNumber });
  if (existingInvoice) {
    return NextResponse.json(
      { error: "Invoice number already exists" },
      { status: 409 }
    );
  }

  // Date validation
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

  // Validate items
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: "At least one item is required" },
      { status: 400 }
    );
  }

  // Stock update logic
  const stockUpdates = [];
  const stockItems = [];
  
  for (const item of body.items) {
    if (item.stockId) {
      const stockItem = await Stock.findById(item.stockId);
      if (!stockItem) {
        return NextResponse.json(
          { error: `Stock item with ID ${item.stockId} not found` },
          { status: 400 }
        );
      }
      
      if (stockItem.quantity < item.quantity) {
        return NextResponse.json(
          { 
            error: `Insufficient stock for item: ${item.name}`,
            available: stockItem.quantity,
            requested: item.quantity,
            itemName: item.name
          },
          { status: 400 }
        );
      }
      
      stockUpdates.push({
        updateOne: {
          filter: { _id: item.stockId },
          update: { 
            $inc: { quantity: -item.quantity },
            $set: { lastUpdated: new Date() }
          }
        }
      });
      
      stockItems.push(item.stockId);
    }
  }
  
  if (stockUpdates.length > 0) {
    await Stock.bulkWrite(stockUpdates);
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

  const calculatedSubTotal = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const calculatedTotal = calculatedSubTotal + 
    validatedItems.reduce((sum, item) => sum + (item.price * item.quantity * item.gst/100), 0) +
    (body.adjustment || 0) - 
    (body.discount || 0);

  const newInvoice = new Invoice({
    customer: body.customer,
    stock: stockItems.length > 0 ? stockItems[0] : null,
    invoiceNumber: body.invoiceNumber,
    salesperson: body.salesperson || '',
    orderNumber: body.orderNumber || '',
    subject: body.subject || '',
    paymentStatus: body.paymentStatus || 'pending',
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
}

// Keep your existing PUT and GET methods unchanged below...
export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    console.log("Incoming update data:", body);

    // Validate required fields
    if (!body.id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // Validate invoice ID
    if (!mongoose.Types.ObjectId.isValid(body.id)) {
      return NextResponse.json(
        { error: "Invalid invoice ID format" },
        { status: 400 }
      );
    }

    // Check if invoice exists
    const existingInvoice = await Invoice.findById(body.id);
    if (!existingInvoice) {
      return NextResponse.json(
        { error: "Invoice not found with the provided ID" },
        { status: 404 }
      );
    }

    // Validate the total amount
    if (body.total !== undefined && isNaN(parseFloat(body.total))) {
      return NextResponse.json(
        { error: "Invalid total amount" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {};
    if (body.total !== undefined) {
      updateData.total = parseFloat(body.total);
    }

    // Update totalPaid if payment is being applied
    if (body.amountPaid !== undefined) {
      const amountPaid = parseFloat(body.amountPaid);
      if (isNaN(amountPaid)) {
        return NextResponse.json(
          { error: "Invalid payment amount" },
          { status: 400 }
        );
      }

      // Calculate new totalPaid (add to existing totalPaid)
      const newTotalPaid = (existingInvoice.totalPaid || 0) + amountPaid;
      
      // Validate that payment doesn't exceed invoice total
      if (newTotalPaid > existingInvoice.total) {
        return NextResponse.json(
          { 
            error: "Payment exceeds invoice total",
            invoiceTotal: existingInvoice.total,
            currentTotalPaid: existingInvoice.totalPaid,
            attemptedPayment: amountPaid
          },
          { status: 400 }
        );
      }

      updateData.totalPaid = newTotalPaid;
      
      // Update payment status
      if (newTotalPaid >= existingInvoice.total) {
        updateData.paymentStatus = 'paid';
      } else if (newTotalPaid > 0) {
        updateData.paymentStatus = 'partial';
      }
    }

    // Update the invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      body.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customer');

    return NextResponse.json(
      { 
        message: 'Invoice updated successfully',
        invoice: updatedInvoice 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating invoice:", error);
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