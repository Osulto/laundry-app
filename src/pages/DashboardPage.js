import React from 'react';

// --- Placeholder Dashboards ---
// We will move these to their own files in src/components/dashboard/ later
const AdminDashboard = ({ user }) => (
    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md">
        <h3 className="font-bold">Admin Dashboard</h3>
        <p>Full system control. Can manage Managers and view logs.</p>
    </div>
);

const ManagerDashboard = ({ user }) => (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
        <h3 className="font-bold">Manager (Role A) Dashboard</h3>
        <p>Can manage orders and customer interactions.</p>
    </div>
);

const CustomerDashboard = ({ user }) => (
    <div className="bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700 p-4 rounded-md">
        <h3 className="font-bold">Customer (Role B) Dashboard</h3>
        <p>Can create and view their own laundry orders.</p>
    </div>
);


const DashboardPage = ({ user, onLogout }) => {
    const renderDashboardByRole = () => {
        switch (user.role) {
            case 'Administrator':
                return <AdminDashboard user={user} />;
            case 'Manager':
                return <ManagerDashboard user={user} />;
            case 'Customer':
                return <CustomerDashboard user={user} />;
            default:
                return <p className="text-red-500">Your role is not recognized. Please contact support.</p>;
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg text-left w-full max-w-2xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.displayName || user?.fullName}!</h1>
                    <p className="text-gray-600">Role: <span className="font-semibold text-blue-600">{user?.role}</span></p>
                </div>
                <button
                    onClick={onLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
                >
                    Logout
                </button>
            </div>
            
            {/* This is where role-specific content will go */}
            {renderDashboardByRole()}

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Actions</h2>
                {/* We will populate this section with CRUD operations later */}
                <p className="text-gray-500">Your available actions will appear here based on your role.</p>
            </div>
        </div>
    );
};

export default DashboardPage;
