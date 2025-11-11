'use client';

const History = ({ stock }) => {
  return (
    <div className="max-w-4xl mx-auto text-black rounded shadow-md overflow-hidden">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 font-semibold text-gray-800">Item Created Date</th>
            <th className="px-4 py-2 font-semibold text-gray-800">Created By</th>
            <th className="px-4 py-2 font-semibold text-gray-800">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white">
            <td className="px-4 py-2">
              {new Date(stock.createdAt).toLocaleString()}
            </td>
            <td className="px-4 py-2">
              {stock.createdBy || 'System'}
            </td>
            <td className="px-4 py-2">
              {stock.updatedAt ? new Date(stock.updatedAt).toLocaleString() : 'Never'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default History;