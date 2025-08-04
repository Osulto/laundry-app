import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import LoadingSpinner from '../common/LoadingSpinner';

const LogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const logsCollection = collection(db, 'logs');
                // This query fetches the logs and orders them by timestamp directly from the database.
                const q = query(logsCollection, orderBy('timestamp', 'desc'));
                const logSnapshot = await getDocs(q);
                
                if (logSnapshot.empty) {
                    setLogs([]);
                } else {
                    const logList = logSnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            // Safely convert the timestamp to a readable string
                            timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : 'Invalid Date'
                        };
                    });
                    setLogs(logList);
                }
            } catch (err) {
                console.error("Error fetching logs:", err);
                setError(`Failed to fetch security logs. Please ensure you have administrator permissions and that the required Firestore index is created. Error: ${err.message}`);
            }
            setLoading(false);
        };

        fetchLogs();
    }, []);

    if (loading) {
        return <div className="flex justify-center mt-8"><LoadingSpinner /></div>;
    }

    if (error) {
        return <p className="bg-red-100 text-red-700 p-3 rounded-md mt-6 text-sm">{error}</p>;
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Security Event Logs</h3>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Timestamp</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Outcome</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length > 0 ? logs.map(log => (
                            <tr key={log.id}>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{log.timestamp}</p>
                                </td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap capitalize">{log.eventType || 'N/A'}</p>
                                </td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{log.eventAction || 'N/A'}</p>
                                </td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full ${
                                        log.success ? 'text-green-900 bg-green-200' : 'text-red-900 bg-red-200'
                                    }`}>
                                        {log.success ? 'Success' : 'Failure'}
                                    </span>
                                </td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{log.userEmail || 'N/A'}</p>
                                </td>
                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-600 whitespace-no-wrap">{log.errorMessage || 'No additional details'}</p>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-gray-500">No logs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LogViewer;
