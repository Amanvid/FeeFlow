import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'temp-config.json');

export interface LocalNotificationSettings {
  smsEnabled: boolean;
  feeRemindersEnabled: boolean;
  paymentNotificationsEnabled: boolean;
  admissionNotificationsEnabled: boolean;
}

interface ServerStorageData {
  dueDate?: string;
  notifications?: LocalNotificationSettings;
  lastSync?: string;
}

/**
 * Save due date to server-side storage
 */
export function saveDueDateToServer(dueDate: string): { success: boolean; message: string } {
  try {
    let data: ServerStorageData = {};
    
    // Read existing data if file exists
    if (fs.existsSync(STORAGE_FILE)) {
      try {
        const existingData = fs.readFileSync(STORAGE_FILE, 'utf8');
        data = JSON.parse(existingData);
      } catch (error) {
        console.warn('Could not read existing storage file, creating new one');
      }
    }
    
    // Update due date
    data.dueDate = dueDate;
    data.lastSync = new Date().toISOString();
    
    // Write back to file
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
    
    return { success: true, message: 'Due date saved to server storage' };
  } catch (error) {
    console.error('Error saving due date to server storage:', error);
    return { success: false, message: 'Failed to save due date to server storage' };
  }
}

/**
 * Get due date from server-side storage
 */
export function getDueDateFromServer(): string | null {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return null;
    }
    
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    const parsed: ServerStorageData = JSON.parse(data);
    return parsed.dueDate || null;
  } catch (error) {
    console.error('Error getting due date from server storage:', error);
    return null;
  }
}

/**
 * Save notification settings to server-side storage
 */
export function saveNotificationsToServer(settings: LocalNotificationSettings): { success: boolean; message: string } {
  try {
    let data: ServerStorageData = {};
    
    // Read existing data if file exists
    if (fs.existsSync(STORAGE_FILE)) {
      try {
        const existingData = fs.readFileSync(STORAGE_FILE, 'utf8');
        data = JSON.parse(existingData);
      } catch (error) {
        console.warn('Could not read existing storage file, creating new one');
      }
    }
    
    // Update notifications
    data.notifications = settings;
    data.lastSync = new Date().toISOString();
    
    // Write back to file
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
    
    return { success: true, message: 'Notification settings saved to server storage' };
  } catch (error) {
    console.error('Error saving notifications to server storage:', error);
    return { success: false, message: 'Failed to save notification settings to server storage' };
  }
}

/**
 * Get notification settings from server-side storage
 */
export function getNotificationsFromServer(): LocalNotificationSettings | null {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return null;
    }
    
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    const parsed: ServerStorageData = JSON.parse(data);
    return parsed.notifications || null;
  } catch (error) {
    console.error('Error getting notifications from server storage:', error);
    return null;
  }
}

/**
 * Get last sync timestamp from server-side storage
 */
export function getLastSyncFromServer(): string | null {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return null;
    }
    
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    const parsed: ServerStorageData = JSON.parse(data);
    return parsed.lastSync || null;
  } catch (error) {
    console.error('Error getting last sync from server storage:', error);
    return null;
  }
}

/**
 * Check if server storage data is recent (within 24 hours)
 */
export function isServerDataRecent(): boolean {
  try {
    const lastSync = getLastSyncFromServer();
    if (!lastSync) return false;
    
    const lastSyncTime = new Date(lastSync).getTime();
    const currentTime = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    return (currentTime - lastSyncTime) < twentyFourHours;
  } catch (error) {
    console.error('Error checking if server data is recent:', error);
    return false;
  }
}

/**
 * Clear all server storage data
 */
export function clearServerStorage(): { success: boolean; message: string } {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      fs.unlinkSync(STORAGE_FILE);
    }
    return { success: true, message: 'Server storage cleared' };
  } catch (error) {
    console.error('Error clearing server storage:', error);
    return { success: false, message: 'Failed to clear server storage' };
  }
}