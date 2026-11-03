import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let adminAuthInstance: Auth | null = null;

try {
  if (!getApps().length) {
    initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
  adminAuthInstance = getAuth();
} catch (error) {
  console.warn('Firebase Admin initialization warning:', error);
}

export const adminAuth = {
  verifyIdToken: async (token: string) => {
    if (!adminAuthInstance) {
      throw new Error('Firebase Admin Auth is not initialized in this environment.');
    }
    return adminAuthInstance.verifyIdToken(token);
  },
};

