// useSubscribeNotification.js
import { messaging, getToken } from "../config/firebaseMessaging";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/config"; // adjust to your db export

const vapidKey = "BNQWHA6NGera-er7RjTZIRMrcc1P3SilwhkJI8VNz3IvAX3RtXqmmOR03FhBlWt6HbHHoqV4z0Np4raIlqB0WrY"; // paste it here

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey,
    });

    console.log("✅ User FCM Token:", token);

    // Save to Firestore — new collection: "notificationSubscribers"
    const ref = doc(db, "notificationSubscribers", token); // token as doc ID to avoid duplicates
    await setDoc(ref, {
      token,
      subscribedAt: Date.now(),
    });

    return token;
  } catch (err) {
    console.error("Error getting notification permission or token:", err);
    return null;
  }
};
