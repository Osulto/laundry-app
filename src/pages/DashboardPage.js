import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import { db } from '../firebase/config';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CreateOrderForm from '../components/orders/CreateOrderForm';
import OrderList from '../components/orders/OrderList';
import ChangePasswordForm from '../components/auth/ChangePasswordForm';
import { logger } from '../utils/logger';
import LogViewer from '../components/admin/LogViewer';

// --- User Management Component (for Admins) ---
const UserManagement = ({ currentUser }) => {
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
                logger.error('fetch_users_failure', {
                    success: false,
                    userId: currentUser.uid,
                    errorMessage: err.message
                });
                setError('Failed to fetch user data.');
            }
            setLoading(false);
        };

        fetchUsers();
    }, [currentUser.uid]);

    const handleRoleChange = async (userId, newRole) => {
        setError('');
        setSuccess('');
        try {
            const userDoc = doc(db, 'users', userId);
            await updateDoc(userDoc, { role: newRole });
            
            setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
            setSuccess(`Successfully updated role.`);
            
            logger.access('role_change_success', {
                success: true,
                adminId: currentUser.uid,
                details: { targetUserId: userId, newRole: newRole }
            });

        } catch (err) {
            logger.access('role_change_failure', {
                success: false,
                adminId: currentUser.uid,
                errorMessage: err.message,
                details: { targetUserId: userId, newRole: newRole }
            });
            setError('Failed to update user role. Please try again.');
        }
    };

    const handleDeleteUser = async (userId, userFullName) => {
        setError('');
        setSuccess('');
    
        if (window.confirm(`Are you sure you want to delete the user "${userFullName}"? This will remove their data.`)) {
            try {
                await deleteDoc(doc(db, 'users', userId));
                setUsers(users.filter(user => user.id !== userId));
                setSuccess(`Successfully deleted user ${userFullName}.`);
                
                logger.access('delete_user_success', {
                    success: true,
                    adminId: currentUser.uid,
                    details: { deletedUserId: userId, deletedUserName: userFullName }
                });

            } catch (err) {
                logger.access('delete_user_failure', {
                    success: false,
                    adminId: currentUser.uid,
                    errorMessage: err.message,
                    details: { targetUserId: userId }
                });
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
        <UserManagement currentUser={user} />
        <LogViewer />
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
    const [showModal, setShowModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('#user-dropdown')) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg text-left w-full max-w-5xl mx-auto">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-red-900 mt-2 max-w-md text-sm">
                        Last login was{' '}
                        <strong>
                            {lastLoginInfo && lastLoginInfo.timestamp
                                ? new Date(lastLoginInfo.timestamp).toLocaleString()
                                : 'No login data recorded yet'}
                        </strong>
                    </p>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Welcome, {user?.displayName || user?.fullName}!
                    </h1>

                </div>
                <div className="relative mt-1" id="user-dropdown">
                    <button
                        onClick={() => setShowDropdown((prev) => !prev)}
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                        title="User Menu"
                    >
                        <UserIcon className="h-7 w-7 text-gray-700" />
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                            <button
                                onClick={() => {
                                    setShowModal(true);
                                    setShowDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Change Password
                            </button>
                            <button
                                onClick={() => {
                                    onLogout();
                                    setShowDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                {showModal && <ChangePasswordForm onClose={() => setShowModal(false)} />}
            </div>
    
            {renderDashboardByRole()}
        </div>
    );
};

export default DashboardPage;
