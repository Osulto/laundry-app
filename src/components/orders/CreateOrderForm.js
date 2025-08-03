import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import LoadingSpinner from '../common/LoadingSpinner';

const CreateOrderForm = ({ user }) => {
    const [items, setItems] = useState([{ name: '', quantity: '' }]);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        updatedItems[index][field] = value;
        setItems(updatedItems);
    };

    const addItemField = () => {
        setItems([...items, { name: '', quantity: '' }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Validation
        if (items.some(item => !item.name.trim() || !item.quantity)) {
            setError('Please fill in all item fields.');
            setLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, 'orders'), {
                customerId: user.uid,
                customerName: user.fullName,
                items: items, // array of { name, quantity }
                notes: notes,
                status: 'Pending',
                createdAt: serverTimestamp(),
            });

            setSuccess('Your order has been placed successfully!');
            setItems([{ name: '', quantity: '' }]);
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
                    <label className="block text-gray-700 text-sm font-bold mb-2">Items</label>
                    {items.map((item, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
                            <input
                                type="text"
                                placeholder="Item name (e.g., Shirt)"
                                value={item.name}
                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                className="flex-1 shadow-sm border rounded-md py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Qty"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                className="w-20 shadow-sm border rounded-md py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addItemField}
                        className="mt-2 text-blue-600 hover:underline text-sm"
                    >
                        + Add another item
                    </button>
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
