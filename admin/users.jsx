import AdminLayout from '../../components/page';

const AdminUsers = () => {
  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        {/* User management content goes here */}
        <p>This is the users page content.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;