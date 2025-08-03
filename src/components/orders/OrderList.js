import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import LoadingSpinner from '../common/LoadingSpinner';

const OrderList = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isManager = user.role === 'Manager' || user.role === 'Administrator';

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersCollection = collection(db, 'orders');
                let q;

                // If the user is a Manager/Admin, fetch all orders.
                // Otherwise, fetch only the orders for the current customer.
                if (isManager) {
                    q = query(ordersCollection);
                } else {
                    q = query(ordersCollection, where("customerId", "==", user.uid));
                }

                const orderSnapshot = await getDocs(q);
                const orderList = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Sort orders by creation date, newest first
                orderList.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
                
                setOrders(orderList);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError('Failed to fetch orders.');
            }
            setLoading(false);
        };

        fetchOrders();
    }, [user.uid, user.role, isManager]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const orderDoc = doc(db, 'orders', orderId);
            await updateDoc(orderDoc, { status: newStatus });
            setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
        } catch (err) {
            console.error("Error updating status:", err);
            setError('Failed to update order status.');
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Orders</h3>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
            
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            {isManager && <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>}
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Items</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? orders.map((order) => (
                            <tr key={order.id}>
                                {isManager && <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{order.customerName}</p></td>}
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <ul className="text-gray-900 whitespace-no-wrap list-disc list-inside space-y-1">
                                {Array.isArray(order.items)
                                    ? order.items.map((item, index) => (
                                        <li key={index}>{item.quantity} × {item.name}</li>
                                    ))
                                    : (
                                        <li className="text-red-600 text-sm">Invalid or missing items</li>
                                    )}
                                </ul>


                                    {order.notes && <p className="text-gray-600 text-xs mt-1">Notes: {order.notes}</p>}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{order.createdAt.toDate().toLocaleDateString()}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {isManager ? (
                                        <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="block w-full bg-white border border-gray-300 rounded-md p-1">
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Ready for Pickup">Ready for Pickup</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    ) : (
                                        <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                                            order.status === 'Completed' ? 'text-green-900' : 'text-yellow-900'
                                        }`}>
                                            <span aria-hidden className={`absolute inset-0 ${
                                                order.status === 'Completed' ? 'bg-green-200' : 'bg-yellow-200'
                                            } opacity-50 rounded-full`}></span>
                                            <span className="relative">{order.status}</span>
                                        </span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={isManager ? 4 : 3} className="text-center py-10 text-gray-500">No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderList;
