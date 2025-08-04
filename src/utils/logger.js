import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 *
 *
 * @param {object} logData - The data to be logged.
 * @param {string} logData.eventType - The type of event (e.g., 'auth', 'validation', 'access_control', 'error').
 * @param {string} logData.eventAction - The specific action (e.g., 'login_attempt', 'user_creation', 'delete_order').
 * @param {boolean} logData.success - Whether the event was successful or a failure.
 * @param {string} [logData.userId] - The ID of the user involved, if applicable.
 * @param {string} [logData.userEmail] - The email of the user involved.
 * @param {string} [logData.errorMessage] - The error message for failed events.
 * @param {object} [logData.details] 
 */
const logEvent = async (logData) => {
    try {
        const logCollectionRef = collection(db, 'logs');
        await addDoc(logCollectionRef, {
            ...logData,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent,
        });
    } catch (error) {
        
        console.error("Failed to write to log:", error);
    }
};

export const logger = {
    auth: (eventAction, details) => logEvent({ eventType: 'auth', eventAction, ...details }),
    validation: (eventAction, details) => logEvent({ eventType: 'validation', eventAction, ...details }),
    access: (eventAction, details) => logEvent({ eventType: 'access_control', eventAction, ...details }),
    error: (eventAction, details) => logEvent({ eventType: 'error', eventAction, ...details }),
};
