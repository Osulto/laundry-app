// The Cloud Functions for Firebase SDK to create Cloud Functions and set up
// triggers.
const functions = require("firebase-functions");
// The Firebase Admin SDK to access Firebase services.
const admin = require("firebase-admin");

// Initialize the app so it can connect to our Firebase project
admin.initializeApp();

/**
 * Creates a log entry in the 'logs' collection in Firestore.
 * This function can be called from the client-side to record security events.
 */
exports.logEvent = functions.https.onCall(async (data, context) => {
  // We don't require authentication here because we want to log
  // failed login attempts, where a user might not be authenticated.
  const {eventType, eventData} = data;

  if (!eventType) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with an 'eventType' argument.",
    );
  }

  const logEntry = {
    eventType, // E.g., 'LOGIN_SUCCESS', 'LOGIN_FAILURE'
    eventData, // E.g., {email: 'user@example.com'}
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ipAddress: context.rawRequest.ip, // Log the IP address
    userAgent: context.rawRequest.headers["user-agent"], // Log browser info
    // If the user is authenticated, log their UID.
    actorUid: context.auth ? context.auth.uid : "anonymous",
  };

  try {
    await admin.firestore().collection("logs").add(logEntry);
    return {success: true, message: "Log event recorded."};
  } catch (error) {
    console.error("Error writing to log:", error);
    // We don't throw an error back to the client to avoid revealing
    // logging status. We just log it server-side.
    return {success: false, message: "Failed to record log event."};
  }
});

