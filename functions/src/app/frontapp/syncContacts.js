import admin from 'firebase-admin'
import {
  getContacts
} from '../../thirdParty/frontapp'
import {
  arrayResolver
} from '../../utils/array'

const fStore = admin.firestore()

export default async orgId => {
  const orgSyncDoc = await fStore.doc(`sync/${orgId}`).get()
  const orgSync = orgSyncDoc.data()
  let nextPage = orgSync.frontContacts.nextPage
  const response = await getContacts(nextPage)
  const contacts = response._results.map(contact => ({
    frontContactId: contact.id,
    name: contact.name,
    emails: contact.handles
      .filter(handle => handle.source === 'email')
      .map(handle => ({
        type: 'main',
        text: handle.handle
      }))
  }))

  const contactResolver = async contact => {
    const newContact = fStore.collection('people').doc()
    await fStore.doc(`people/${newContact.id}`).set({
      id: newContact.id,
      orgId,
      ...contact
    })
  }
  await arrayResolver(contacts, contactResolver)

  nextPage = response._pagination.next
  if (nextPage) {
    fStore.doc(`sync/${orgId}`).update({
      frontContacts: {
        status: 'syncing',
        nextPage
      }
    })
  } else {
    fStore.doc(`sync/${orgId}`).update({
      frontContacts: {
        status: 'complete'
      }
    })
  }
}
