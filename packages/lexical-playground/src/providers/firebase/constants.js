/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
export const config = {
  apiKey: 'AIzaSyBiOfBSQ0FJicHn1xdIc-e4TOeBOcbbcKs',
  appId: '1:841550241453:web:735915f0fe9d18a581f024',
  authDomain: 'bmi-km.firebaseapp.com',
  measurementId: 'G-3FDKNQRDGV',
  messagingSenderId: '841550241453',
  projectId: 'bmi-km',
  storageBucket: 'bmi-km.appspot.com',
};

export const FIRESTORE_COLLECTIONS = {
  defaultTeamSnippets: 'defaultTeamSnippets',
  drafts: 'drafts',
  preferences: 'preferences',
  snippets: 'snippetsV2',
  timeEntryDrafts: 'timeEntryDrafts',
  timers: 'timers',
};

export const generateTimerId = ({memberId, ticketId}) =>
  `${memberId}-${ticketId}`;
export const generateDraftId = ({memberId, ticketId}) =>
  `${memberId}-${ticketId}`;
