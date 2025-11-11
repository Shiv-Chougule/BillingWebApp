export default async function handler(req, res) {
    if (req.method === 'PUT') {
      try {
        const { invoiceIds, status } = req.body;
        
        // Update invoices in your database here
        // Example with MongoDB:
        const { db } = await connectToDatabase();
        await db.collection('invoices').updateMany(
          { _id: { $in: invoiceIds } },
          { $set: { paymentStatus: status } }
        );
        
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update invoices', error });
      }
    } else {
      res.setHeader('Allow', ['PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }