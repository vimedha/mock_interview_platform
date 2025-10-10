import {initializeApp, getApps, cert, applicationDefault}from 'firebase-admin/app';
import {getAuth}from 'firebase-admin/auth';
import {getFirestore}from 'firebase-admin/firestore';

function resolveFirebasePrivateKey(): string | undefined {
        const base64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;
        const raw = process.env.FIREBASE_PRIVATE_KEY || base64;
        if (!raw) return undefined;
        if (base64 && !process.env.FIREBASE_PRIVATE_KEY) {
                try { return Buffer.from(base64, 'base64').toString('utf8'); } catch { /* ignore */ }
        }
        let normalized = raw.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
        normalized = normalized.replace(/\\r?\\n/g, '\n');
        return normalized;
}

const initiFirebaseAdmin=()=>{
        const apps=getApps();
        if(!apps.length){
                const privateKey = resolveFirebasePrivateKey();
                try {
                        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                                initializeApp({ credential: applicationDefault() });
                        } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey){
                                initializeApp({
                                        credential:cert({
                                                projectId: process.env.FIREBASE_PROJECT_ID,
                                                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                                                privateKey,
                                        })
                                })
                        } else {
                                initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'prepwise-f285b' })
                        }
                } catch (_e) {
                        // Fallback to project-only init to avoid crashing in dev
                        initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'prepwise-f285b' })
                }
        }
        return {
                auth:getAuth(),
                db:getFirestore()
        }
}
export const {auth,db}=initiFirebaseAdmin();