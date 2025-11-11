import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req) {
  try {
    const data = await req.json();
    const filePath = join(process.cwd(), 'public', 'invoices.json');

    // Read existing data (if file exists)
    let invoices = [];
    try {
      const existingData = await import(`@/public/invoices.json`);
      invoices = existingData.default || [];
    } catch (error) {
      console.log("No existing file, creating a new one.", error);
    }

    // Append new invoice
    invoices.push(data);

    // Save data to JSON file
    await writeFile(filePath, JSON.stringify(invoices, null, 2), 'utf8');

    return Response.json({ message: 'Invoice saved successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Error saving invoice:', error);
    return Response.json({ error: 'Failed to save invoice' }, { status: 500 });
  }
}
