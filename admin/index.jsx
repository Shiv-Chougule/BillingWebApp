import AdminLayout from '../../components/page';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Stats Cards */}
          {[
            { title: 'Total Users', value: '1,234', change: '+12%', icon: 'people' },
            { title: 'Total Revenue', value: '$34,567', change: '+8%', icon: 'attach_money' },
            { title: 'Pending Orders', value: '56', change: '-3%', icon: 'shopping_cart' },
            { title: 'Active Products', value: '189', change: '+5%', icon: 'inventory' },
          ].map((stat) => (
            <div key={stat.title} className="bg-white p-4 rounded-lg shadow border border-gray-100">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <span className="material-icons text-blue-500 text-3xl">
                  {stat.icon}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { event: 'New order', user: 'John Doe', time: '2 min ago', status: 'Completed' },
                  { event: 'User registration', user: 'Jane Smith', time: '10 min ago', status: 'Pending' },
                  { event: 'Payment received', user: 'Robert Johnson', time: '1 hour ago', status: 'Completed' },
                  { event: 'Product update', user: 'Admin', time: '3 hours ago', status: 'Completed' },
                ].map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.event}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;