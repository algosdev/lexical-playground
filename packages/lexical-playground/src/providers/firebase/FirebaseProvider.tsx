/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import isUndefined from 'lodash/isUndefined';
import omitBy from 'lodash/omitBy';
import { createContext, useContext, useEffect, useState } from 'react';

import {config} from './constants';
import Firebase from './Firebase';

const FirebaseContext = createContext({});
export default function FirebaseProvider({children}) {
  const [currentUser, setCurrentUser] = useState();
  const [firebaseInstance] = useState(() => new Firebase(config));

  const defaultFilterQuery = [];

  const getDocuments = ({filters = [], withDefaultFilter = true, ...rest}) =>
    firebaseInstance.getDocuments({
      filters: withDefaultFilter
        ? [...defaultFilterQuery, ...filters]
        : filters,
      ...rest,
    });
  const onCollectionChange = ({
    filters = [],
    withDefaultFilter = true,
    ...rest
  }) =>
    firebaseInstance.onCollectionChange({
      filters: withDefaultFilter
        ? [...defaultFilterQuery, ...filters]
        : filters,
      ...rest,
    });

  const createDocument = (data, options) => {
    const validated = omitBy(data, isUndefined);
    return firebaseInstance.createDocument(
      {...validated, userId: currentUser.uid},
      options,
    );
  };
  const updateDocument = (data, options) => {
    const validated = omitBy(data, isUndefined);
    return firebaseInstance.updateDocument(
      validated,
      options,
    );
  };

  useEffect(() => {
    const unsubscriber = firebaseInstance.subscribeAuthStateChange((user) => {
      setCurrentUser(user);
    });

    return unsubscriber;
  }, [firebaseInstance]);


  return (
    <FirebaseContext.Provider
      value={{
        ...firebaseInstance,
        createDocument,
        currentUser,
        getDocuments,
        isAuthenticated: !!currentUser,
        onCollectionChange,
        updateDocument,
      }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext);

export const useFirebaseSubscriptions = ({subscriptions = [], deps = []}) => {
  const {currentUser, onCollectionChange} = useFirebase();
  useEffect(() => {
    if (!currentUser) {
      return noop;
    }
    let unsubscribers = [];
    subscriptions.forEach((subscription) => {
      onCollectionChange(subscription)
        .then((unsubscribeFn) => {
          unsubscribers.push(unsubscribeFn);
        })
        .catch((err) => {
          console.error('Subscription failed: ', err);
        });
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      unsubscribers = [];
    };
  }, [currentUser, ...deps]);
};
