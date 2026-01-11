import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from './ScrollToTop';

const api = axios.create({
  baseURL: '/api/v1/admin',
});

// Add request interceptor to set Authorization header with fresh token on each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const MasterAdminDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [batchStats, setBatchStats] = useState([]);
  
  // Form state for creating new admin
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    assignedBatches: [],
  });

  // Available batches (can be dynamic)
  const availableBatches = [21, 22, 23, 24, 25];

  useEffect(() => {
    fetchAdmins();
    fetchBatchStats();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admins', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admins');
      setLoading(false);
    }
  };

  const fetchBatchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/batch-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBatchStats(response.data.data);
    } catch (error) {
      console.error('Error fetching batch stats:', error);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/admins/create', newAdmin, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Batch admin created successfully!');
      setShowCreateModal(false);
      setNewAdmin({ username: '', email: '', password: '', assignedBatches: [] });
      fetchAdmins();
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(error.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/admins/${selectedAdmin._id}`, {
        role: selectedAdmin.role,
        assignedBatches: selectedAdmin.assignedBatches,
        email: selectedAdmin.email,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Admin updated successfully!');
      setShowEditModal(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error(error.response?.data?.message || 'Failed to update admin');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admins/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Admin deleted successfully!');
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error(error.response?.data?.message || 'Failed to delete admin');
    }
  };

  const handleBatchToggle = (batch, isNew = false) => {
    if (isNew) {
      setNewAdmin(prev => ({
        ...prev,
        assignedBatches: prev.assignedBatches.includes(batch)
          ? prev.assignedBatches.filter(b => b !== batch)
          : [...prev.assignedBatches, batch]
      }));
    } else {
      setSelectedAdmin(prev => ({
        ...prev,
        assignedBatches: prev.assignedBatches.includes(batch)
          ? prev.assignedBatches.filter(b => b !== batch)
          : [...prev.assignedBatches, batch]
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <ScrollToTop />
      <ToastContainer position="top-right" />
      
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Master Admin Dashboard
      </h1>

      {/* Batch Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Batch Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {batchStats.map((stat) => (
            <div key={stat._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-blue-700">
                Batch K{stat._id}
              </h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-800">
                  Total: <span className="font-bold text-gray-900">{stat.total}</span>
                </p>
                <p className="text-sm text-green-700">
                  Verified: <span className="font-bold">{stat.verified}</span>
                </p>
                <p className="text-sm text-orange-600">
                  Pending: <span className="font-bold">{stat.unverified}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Management Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Manage Admins
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
          >
            + Create Batch Admin
          </button>
        </div>

        {/* Admins Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Assigned Batches
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {admin.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {admin.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      admin.role === 'master' 
                        ? 'bg-purple-200 text-purple-800'
                        : 'bg-blue-200 text-blue-800'
                    }`}>
                      {admin.role === 'master' ? 'Master Admin' : 'Batch Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {admin.role === 'master' 
                      ? 'All Batches'
                      : admin.assignedBatches?.map(b => `K${b}`).join(', ') || 'None'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {admin.role !== 'master' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setShowEditModal(true);
                          }}
                          className="text-blue-700 hover:text-blue-900 font-semibold mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin._id)}
                          className="text-red-700 hover:text-red-900 font-semibold"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Create Batch Admin
            </h3>
            <form onSubmit={handleCreateAdmin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  minLength={6}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign Batches
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableBatches.map((batch) => (
                    <button
                      key={batch}
                      type="button"
                      onClick={() => handleBatchToggle(batch, true)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        newAdmin.assignedBatches.includes(batch)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                      }`}
                    >
                      K{batch}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Edit Admin: {selectedAdmin.username}
            </h3>
            <form onSubmit={handleUpdateAdmin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={selectedAdmin.email}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assigned Batches
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableBatches.map((batch) => (
                    <button
                      key={batch}
                      type="button"
                      onClick={() => handleBatchToggle(batch, false)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedAdmin.assignedBatches?.includes(batch)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                      }`}
                    >
                      K{batch}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAdmin(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterAdminDashboard;
