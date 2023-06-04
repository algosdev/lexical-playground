/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {getAnalytics} from 'firebase/analytics';
import {getApp, initializeApp} from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile,
} from 'firebase/auth';
import firebase from 'firebase/compat/app';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  initializeFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import noop from 'lodash/noop';

const captureException = (err, ...rest) =>
  // eslint-disable-next-line no-console
  console.log(`ERROR: ${err.message}`, ...rest);
// Firebase errors are captured for Sentry right here in methods
// but still being propagated to top
// DO NOT record errors again in catch block
class Firebase {
  constructor(firebaseKeys) {
    // Do not initialize the app if this step was already done.
    if (firebase.apps.length) {
      this.app = getApp();
    } else {
      this.app = initializeApp(firebaseKeys);
    }
    this.analytics = getAnalytics(this.app);
    this.auth = getAuth(this.app);
    this.firestore = initializeFirestore(this.app, {
      experimentalAutoDetectLongPolling: true,
    });
    this.signIn({email: 'sam@tuit.uz', password: '123456'});
  }

  subscribeAuthStateChange = (nextOrObserver) => {
    try {
      return this.auth.onAuthStateChanged(nextOrObserver);
    } catch (err) {
      captureException(err);
      return noop;
    }
  };

  createUser = ({email, password, fullname}) =>
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        userCredential.updateProfile({
          displayName: fullname,
        });
        return user;
      })
      .catch((error) => {
        captureException(error);
        throw error;
      });

  signIn = ({email, password}) =>
    signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return user;
      })
      .catch((error) => {
        captureException(error);
        throw error;
      });

  updateProfile = (data) => fbUpdateProfile(this.auth.currentUser, data);

  getDocument = async ({collectionName, id}) => {
    try {
      const docRef = doc(this.firestore, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (err) {
      captureException(err, {
        extra: {
          collectionName,
          id,
          operation: 'getDoc',
          uid: this.auth.currentUser?.uid,
        },
      });
      throw err;
    }
  };

  getReference = ({collectionName, id}) => {
    return doc(this.firestore, collectionName, id);
  };

  createDocument = async (data, {collectionName, id, shouldReturnDoc}) => {
    try {
      const payloadWithTimestamp = {
        ...data,
        createdAt: serverTimestamp(),
      };
      let res;
      // if id is not provided, random id is generated
      if (id) {
        res = await setDoc(
          doc(this.firestore, collectionName, id),
          payloadWithTimestamp,
        );
      } else {
        console.log('payloadWithTimestamp', payloadWithTimestamp, this, {
          collectionName,
          id,
          shouldReturnDoc,
        });
        res = await addDoc(
          collection(this.firestore, collectionName),
          payloadWithTimestamp,
        );
      }
      if (shouldReturnDoc) {
        const docRef = doc(this.firestore, collectionName, res.id);
        const docSnap = await getDoc(docRef);
        return {...docSnap.data(), id: res.id};
      }
      return res;
    } catch (err) {
      captureException(err, {
        extra: {
          collectionName,
          id,
          operation: 'setDoc',
          uid: this.auth.currentUser?.uid,
        },
      });
      throw err;
    }
  };

  batchWriteDocs = async ({type, requests, collectionName}) => {
    try {
      const batch = writeBatch(this.firestore);
      requests.forEach((req) => {
        switch (type) {
          case 'create': {
            const sfRef = doc(collection(this.firestore, collectionName));
            batch.set(sfRef, req);
            break;
          }
          case 'update': {
            const sfRef = doc(this.firestore, collectionName, req.docId);
            batch.update(sfRef, req.payload);
            break;
          }
          default:
            break;
        }
      });
      const res = await batch.commit();
      return res;
    } catch (err) {
      captureException(err, {
        extra: {
          collectionName,
          operation: 'batch',
          type,
          uid: this.auth.currentUser?.uid,
        },
      });
      throw err;
    }
  };

  updateDocument = async (data, {id, collectionName}) => {
    try {
      const payloadWithTimestamp = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      const ref = doc(this.firestore, collectionName, id);
      const res = await updateDoc(ref, payloadWithTimestamp);
      return res;
    } catch (err) {
      captureException(err, {
        extra: {
          collectionName,
          id,
          operation: 'updateDoc',
          uid: this.auth.currentUser?.uid,
        },
      });
      throw err;
    }
  };

  deleteDocument = async ({collectionName, id}) => {
    try {
      const ref = doc(this.firestore, collectionName, id);
      const res = await deleteDoc(ref);
      return res;
    } catch (err) {
      captureException(err, {
        extra: {
          collectionName,
          id,
          operation: 'deleteDoc',
          uid: this.auth.currentUser?.uid,
        },
      });
      throw err;
    }
  };

  getDocuments = async ({
    collectionName,
    returnOnlyFirst,
    withDocumentId = true,
    dataNormalizer,
    filters,
  }) => {
    try {
      const queryFilterArray = filters.map((filter) =>
        where(filter.key, filter.operator, filter.value),
      );
      const queryFilter = query(
        collection(this.firestore, collectionName),
        ...queryFilterArray,
      );
      const querySnapshot = await getDocs(queryFilter);
      const result = querySnapshot.docs.map((document) => {
        const data = {
          ...document.data(),
          ...(withDocumentId && {
            id: document.id,
          }),
        };
        return data;
      });

      if (dataNormalizer) {
        return dataNormalizer(result);
      }
      return returnOnlyFirst ? result?.[0] : result;
    } catch (err) {
      captureException(err, {
        extra: {
          collectionName,
          filters,
          operation: 'getDocs',
          uid: this.auth.currentUser?.uid,
        },
      });
      throw err;
    }
  };

  onCollectionChange = async ({
    collectionName,
    withDocumentId = true,
    filters,
    onChangeCallback = () => {},
  }) => {
    try {
      const queryFilterArray = filters.map((filter) =>
        where(filter.key, filter.operator, filter.value),
      );
      const queryFilter = query(
        collection(this.firestore, collectionName),
        ...queryFilterArray,
      );
      const unsubcribe = onSnapshot(
        queryFilter,
        (querySnapshot) => {
          const result = querySnapshot.docs.map((document) => {
            const data = {
              ...document.data(),
              ...(withDocumentId && {
                id: document.id,
              }),
            };
            return data;
          });
          onChangeCallback(result);
        },
        (err) => {
          captureException(err, {
            extra: {
              collectionName,
              filters,
              operation: 'onSnapshot',
              uid: this.auth.currentUser?.uid,
            },
          });
        },
      );
      return unsubcribe;
    } catch (err) {
      captureException(err, {
        extra: {
          collectionName,
          filters,
          operation: 'onSnapshot',
          uid: this.auth.currentUser?.uid,
        },
      });
      throw err;
    }
  };

  signOut = () => fbSignOut(this.auth);
}

export default Firebase;
