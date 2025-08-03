import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { TrashIcon } from '@heroicons/react/24/outline';
import { db } from '../firebase/config';
import LoadingSpinner from '../components/common/LoadingSpinner';
// Import the new components
import CreateOrderForm from '../components/orders/CreateOrderForm';
import OrderList from '../components/orders/OrderList';

// --- User Management Component (for Admins) ---
const UserManagement = () => {
    // ... (This component's code remains the same as before)
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, 'users');
                const userSnapshot = await getDocs(usersCollection);
                const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUsers(userList);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError('Failed to fetch user data.');
            }
            setLoading(false);
        };

        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        setError('');
        setSuccess('');
        try {
            const userDoc = doc(db, 'users', userId);
            await updateDoc(userDoc, { role: newRole });
            
            setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
            setSuccess(`Successfully updated role.`);
        } catch (err) {
            console.error("Error updating role:", err);
            setError('Failed to update user role. Please try again.');
        }
    };

    const handleDeleteUser = async (userId, userFullName) => {
        setError('');
        setSuccess('');

        if (window.confirm(`Are you sure you want to delete the user "${userFullName}"? This will permanently remove their login and all their data.`)) {
            try {
                const functions = getFunctions();
                const deleteUserCallable = httpsCallable(functions, 'deleteUser');
                
                await deleteUserCallable({ uid: userId });

                setUsers(users.filter(user => user.id !== userId));
                setSuccess(`Successfully deleted user ${userFullName}.`);
                
            } catch (err) {
                console.error("Error calling deleteUser function:", err);
                setError(`Failed to delete user: ${err.message}`);
            }
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">User Management</h3>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
            {success && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm">{success}</p>}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Role</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Change Role</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th> 
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{user.fullName}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{user.email}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                                        user.role === 'Administrator' ? 'text-red-900' :
                                        user.role === 'Manager' ? 'text-green-900' : 'text-blue-900'
                                    }`}>
                                        <span aria-hidden className={`absolute inset-0 ${
                                            user.role === 'Administrator' ? 'bg-red-200' :
                                            user.role === 'Manager' ? 'bg-green-200' : 'bg-blue-200'
                                        } opacity-50 rounded-full`}></span>
                                        <span className="relative">{user.role}</span>
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="block w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={user.role === 'Administrator'}
                                    >
                                        <option value="Customer">Customer</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Administrator">Administrator</option>
                                    </select>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <div className="flex justify-center items-center h-full">
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.fullName)}
                                            disabled={user.role === 'Administrator'}
                                            className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                            title="Delete User"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- Dashboard Components ---
const AdminDashboard = ({ user }) => (
    <div>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <h3 className="font-bold">Administrator View</h3>
            <p>You have full system control.</p>
        </div>
        <UserManagement />
    </div>
);

const ManagerDashboard = ({ user }) => (
    <div>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-6">
            <h3 className="font-bold">Manager Dashboard</h3>
            <p>You can view and manage all customer orders.</p>
        </div>
        <OrderList user={user} />
    </div>
);

const CustomerDashboard = ({ user }) => (
    <div>
        <div className="bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700 p-4 rounded-md">
            <h3 className="font-bold">Customer Dashboard</h3>
            <p>Place a new order or view your existing orders below.</p>
        </div>
        <CreateOrderForm user={user} />
        <OrderList user={user} />
    </div>
);


// --- Main Dashboard Page Component ---
const DashboardPage = ({ user, onLogout, lastLoginInfo }) => {
    const renderDashboardByRole = () => {
        switch (user.role) {
            case 'Administrator':
                return <AdminDashboard user={user} />;
            case 'Manager':
                return <ManagerDashboard user={user} />;
            case 'Customer':
            default:
                return <CustomerDashboard user={user} />;
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg text-left w-full max-w-5xl mx-auto">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.displayName || user?.fullName}!</h1>
                    {lastLoginInfo && (
                        <p className="bg-yellow-100 text-yellow-900 p-3 rounded-md mt-2 max-w-md text-sm">
                        Last login was on{' '}
                        <strong>{new Date(lastLoginInfo.timestamp).toLocaleString()}</strong> -{' '}
                        {lastLoginInfo.success ? 'Successful' : 'Failed'}
                        </p>
                    )}
                </div>
                <button
                    onClick={onLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
                >
                    Logout
                </button>
            </div>
            
            {renderDashboardByRole()}
        </div>
    );
};

export default DashboardPage;
