import React, { useState } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import LoadingSpinner from '../common/LoadingSpinner';

const CreateOrderForm = ({ user }) => {
    const [items, setItems] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Basic validation
        if (!items.trim()) {
            setError('Please describe the items for laundry.');
            setLoading(false);
            return;
        }
        if (quantity < 1 || quantity > 100) {
            setError('Quantity must be between 1 and 100.');
            setLoading(false);
            return;
        }

        try {
            const ordersCollection = collection(db, 'orders');
            await addDoc(ordersCollection, {
                customerId: user.uid,
                customerName: user.fullName,
                items: items,
                quantity: Number(quantity),
                notes: notes,
                status: 'Pending', // Initial status for all new orders
                createdAt: serverTimestamp(),
            });
            setSuccess('Your order has been placed successfully!');
            // Reset form
            setItems('');
            setQuantity(1);
            setNotes('');
        } catch (err) {
            console.error("Error creating order: ", err);
            setError('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Place a New Laundry Order</h3>
            <form onSubmit={handleSubmit}>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                {success && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm">{success}</p>}
                
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="items">
                        Items (e.g., "3 shirts, 2 pairs of jeans")
                    </label>
                    <input
                        id="items"
                        type="text"
                        value={items}
                        onChange={(e) => setItems(e.target.value)}
                        className="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
                        Total Quantity
                    </label>
                    <input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        max="100"
                        className="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                        Special Notes (e.g., "use gentle detergent")
                    </label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="3"
                        className="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-300 disabled:bg-blue-300 flex items-center justify-center"
                >
                    {loading ? <LoadingSpinner small /> : 'Place Order'}
                </button>
            </form>
        </div>
    );
};

export default CreateOrderForm;
