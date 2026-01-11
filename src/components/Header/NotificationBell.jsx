import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDate } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';
import { ar } from '../../translations/ar';
import { en } from '../../translations/en';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'egg': return '🥚';
      case 'expense': return '💸';
      case 'reject': return '⚠️';
      default: return '🔔';
    }
  };

  const getTranslatedMessage = (notification) => {
    const { titleKey, messageKey, params } = notification;
    if (!titleKey || !messageKey) return { title: notification.title, message: notification.message };

    const translations = language === 'ar' ? ar : en;
    
    // Improved nested value lookup that handles prefix keys properly
    const getNestedValue = (obj, path) => {
      if (!path) return null;
      const parts = path.split('.');
      let current = obj;
      
      for (const part of parts) {
        if (current && current[part] !== undefined) {
          current = current[part];
        } else {
          return null;
        }
      }
      return typeof current === 'string' ? current : null;
    };

    let title = getNestedValue(translations, titleKey);
    let message = getNestedValue(translations, messageKey);

    // Dynamic search for keys in root or inventory.notifications
    if (!title || !message) {
      const findKeyInTree = (obj, targetKey) => {
        // Direct match
        const direct = getNestedValue(obj, targetKey);
        if (direct) return direct;

        // Try with inventory prefix
        const withInv = getNestedValue(obj, `inventory.${targetKey}`);
        if (withInv) return withInv;

        // Try searching last part
        const parts = targetKey.split('.');
        const lastPart = parts[parts.length - 1];
        
        // Search in possible locations
        return obj.notifications?.types?.[lastPart] || 
               obj.notifications?.messages?.[lastPart] ||
               obj.inventory?.notifications?.types?.[lastPart] ||
               obj.inventory?.notifications?.messages?.[lastPart];
      };

      if (!title) title = findKeyInTree(translations, titleKey) || notification.title || titleKey;
      if (!message) message = findKeyInTree(translations, messageKey) || notification.message || messageKey;
    }

    // Replace params in message
    if (params) {
      Object.keys(params).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        message = message.replace(regex, params[key]);
      });
    }

    return { title, message };
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className={`absolute top-12 ${language === 'ar' ? 'left-0' : 'right-0'} w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden`}>
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-800">{language === 'ar' ? 'الإشعارات' : 'Notifications'}</span>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-amber-600 hover:text-amber-700 font-bold"
                >
                  {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  {language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
                </div>
              ) : (
                notifications.map(n => {
                  const { title, message } = getTranslatedMessage(n);
                  return (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-amber-50/50' : ''}`}
                    >
                      <div className="flex gap-3">
                        <span className="text-xl mt-1">{getIcon(n.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!n.read ? 'font-bold' : ''} text-gray-800`}>{title}</p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{message}</p>
                          <p className="text-[10px] text-gray-400 mt-2">{formatDate(n.createdAt?.toDate?.() || n.createdAt, language)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
