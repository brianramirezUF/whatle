import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    const serviceAccount = require('./serviceAccount.json');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.projectId
    });
}

export const adminAuth = admin.auth();
export const adminDB = admin.firestore();