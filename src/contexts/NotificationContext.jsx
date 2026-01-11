import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || 0;
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || 0;
          return dateB - dateA;
        });
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const sendNotification = async (userId, title, message, type = 'info') => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const notifyAllInvestors = async (titleKey, messageKey, type = 'info', relatedId = null, params = {}) => {
    try {
      const investorsSnapshot = await getDocs(collection(db, 'users'));
      const batch = writeBatch(db);
      
      investorsSnapshot.docs.forEach(userDoc => {
        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, {
          userId: userDoc.id,
          titleKey,
          messageKey,
          params,
          type,
          read: false,
          createdAt: serverTimestamp(),
          relatedId
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error notifying all investors:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await writeBatch(db).update(notificationRef, { read: true }).commit();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach(n => {
        const ref = doc(db, 'notifications', n.id);
        batch.update(ref, { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotificationsByRelatedId = async (relatedId) => {
    try {
      const q = query(collection(db, 'notifications'), where('relatedId', '==', relatedId));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error deleting notifications by related ID:", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      sendNotification, 
      notifyAllInvestors,
      markAsRead, 
      markAllAsRead,
      deleteNotificationsByRelatedId
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
