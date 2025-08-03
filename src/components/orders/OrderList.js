import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import LoadingSpinner from '../common/LoadingSpinner';

const OrderList = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const toJsDate = (timestamp) => {
        if (!timestamp) return null;
        if (typeof timestamp.toDate === 'function') {
          return timestamp.toDate();
        }
        if (timestamp instanceof Date) return timestamp;
        return null;
      };
      

    const isManager = user.role === 'Manager' || user.role === 'Administrator';

    useEffect(() => {
        const ordersCollection = collection(db, 'orders');
        let q;
    
        if (isManager) {
            q = query(ordersCollection);
        } else {
            q = query(ordersCollection, where("customerId", "==", user.uid));
        }
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orderList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
    
            // Sort orders by date
            orderList.sort((a, b) => {
                const dateA = toJsDate(a.createdAt)?.getTime() ?? 0;
                const dateB = toJsDate(b.createdAt)?.getTime() ?? 0;
                return dateB - dateA;
              });
              
    
            setOrders(orderList);
            setLoading(false);
        }, (err) => {
            console.error("Error with real-time orders:", err);
            setError('Failed to load real-time orders.');
            setLoading(false);
        });
    
        return () => unsubscribe(); // Clean up listener when component unmounts
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

    const filteredOrders = orders.filter(order => {
        const query = searchQuery.toLowerCase();
        return (
            order.customerName?.toLowerCase().includes(query) ||
            order.status?.toLowerCase().includes(query)
        );
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Orders</h3>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}

            {isManager && (
                <input
                    type="text"
                    placeholder="Search by customer or status"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-4 p-2 border border-gray-300 rounded-md w-full"
                />
            )}


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
                        {filteredOrders.length > 0 ? filteredOrders.map(order => (
                            <tr key={order.id}>
                                {isManager && (
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{order.customerName}</p>
                                    </td>
                                )}
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <ul className="text-gray-900 whitespace-no-wrap list-inside space-y-1">
                                        {Array.isArray(order.items)
                                            ? order.items.map((item, index) => (
                                                <li key={index}>{item.quantity} × {item.name}</li>
                                            ))
                                            : <li className="text-red-600 text-sm">Invalid or missing items</li>
                                        }
                                    </ul>
                                    {order.notes && <p className="text-gray-600 text-xs mt-1">Notes: {order.notes}</p>}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">{toJsDate(order.createdAt)?.toLocaleDateString() ?? 'No date available'}</p>

                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {isManager ? (
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className="block w-full bg-white border border-gray-300 rounded-md p-1"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Ready for Pickup">Ready for Pickup</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    ) : (
                                        <span
                                            className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full
                                                ${
                                                order.status === 'Completed'
                                                    ? 'text-green-900 bg-green-200'
                                                    : order.status === 'Pending'
                                                    ? 'text-yellow-900 bg-yellow-200'
                                                    : order.status === 'In Progress'
                                                    ? 'text-blue-900 bg-blue-200'
                                                    : order.status === 'Ready for Pickup'
                                                    ? 'text-purple-900 bg-purple-200'
                                                    : 'text-gray-900 bg-gray-200'
                                                }
                                            `}
                                            >
                                            {order.status}
                                            </span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={isManager ? 4 : 3} className="text-center py-10 text-gray-500">No matching orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderList;
