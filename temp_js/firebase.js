import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: "AIzaSy...", // Dummy/Placeholder - User should provide real ones in .env
    authDomain: "lorvenlearn.firebaseapp.com",
    projectId: "lorvenlearn",
    storageBucket: "lorvenlearn.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// ── User Identity & Profile ───────────────────────────────────
export async function updateUserDetails(uid, data) {
    try {
        await updateDoc(doc(db, 'users', uid), data);
        return true;
    }
    catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
}
// ── Progress & Synchronization ───────────────────────────────
export async function syncCourseProgress(progress) {
    if (!auth.currentUser)
        return null;
    const id = `${auth.currentUser.uid}_${progress.courseId}`;
    try {
        const docRef = doc(db, 'progress', id);
        const snap = await getDoc(docRef);
        const data = {
            ...progress,
            uid: auth.currentUser.uid,
            updatedAt: new Date().toISOString(),
        };
        if (snap.exists()) {
            await updateDoc(docRef, data);
        }
        else {
            await setDoc(docRef, data);
        }
        return true;
    }
    catch (error) {
        console.error('Progress sync error:', error);
        return false;
    }
}
export async function fetchCourseProgress(courseId) {
    if (!auth.currentUser)
        return null;
    try {
        const id = `${auth.currentUser.uid}_${courseId}`;
        const snap = await getDoc(doc(db, 'progress', id));
        return snap.exists() ? snap.data() : null;
    }
    catch {
        return null;
    }
}
// ── Certification ─────────────────────────────────────────────
export async function issueCertificate(data) {
    try {
        const certRef = await addDoc(collection(db, 'certificates'), {
            ...data,
            id: `LL-CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            issueDate: new Date().toISOString(),
        });
        return { id: certRef.id, ...data };
    }
    catch (error) {
        console.error('Certificate issue error:', error);
        return null;
    }
}
// ── Personal Notes (Feature 51) ───────────────────────────────
export async function saveNote(note) {
    if (!auth.currentUser)
        return null;
    const id = `${auth.currentUser.uid}_${note.courseId}_${note.lessonId}`;
    try {
        await setDoc(doc(db, 'notes', id), {
            ...note,
            uid: auth.currentUser.uid,
            updatedAt: new Date().toISOString()
        });
        return true;
    }
    catch {
        return false;
    }
}
export async function fetchNote(courseId, lessonId) {
    if (!auth.currentUser)
        return null;
    const id = `${auth.currentUser.uid}_${courseId}_${lessonId}`;
    const snap = await getDoc(doc(db, 'notes', id));
    return snap.exists() ? snap.data() : null;
}
// ── Course Announcements (Feature 52) ─────────────────────────
export async function postAnnouncement(ann) {
    try {
        await addDoc(collection(db, 'announcements'), {
            ...ann,
            createdAt: new Date().toISOString()
        });
        return true;
    }
    catch {
        return false;
    }
}
// ── Study Streaks (Feature 53) ───────────────────────────────
export async function updateStudyStreak() {
    if (!auth.currentUser)
        return;
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists())
        return;
    const userData = snap.data();
    const lastDate = userData.streak?.lastActivityDate;
    const today = new Date().toISOString().split('T')[0];
    if (lastDate === today)
        return; // Already updated today
    let currentStreak = userData.streak?.currentStreak || 0;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (lastDate === yesterdayStr) {
        currentStreak += 1;
    }
    else {
        currentStreak = 1;
    }
    const longestStreak = Math.max(currentStreak, userData.streak?.longestStreak || 0);
    await updateDoc(userRef, {
        streak: {
            currentStreak,
            longestStreak,
            lastActivityDate: today
        }
    });
}
