const firebase = require('@firebase/testing')
const fs = require('fs')
const usersSample = require('./mock/users.json')
const organizationsSample = require('./mock/organizations.json')
const companiesSample = require('./mock/companies.json')
const peopleSample = require('./mock/people.json')
const dealsSample = require('./mock/deals.json')
const tasksSample = require('./mock/tasks.json')

/*
 * ============
 *    Setup
 * ============
 */
const projectId = 'mavrik-crm-9c6b2'
const coverageUrl = `http://localhost:8080/emulator/v1/projects/${projectId}:ruleCoverage.html`

const rules = fs.readFileSync('firestore.rules', 'utf8')

const admin = firebase.initializeAdminApp({ projectId })
const adminDb = admin.firestore()

/**
 * Creates a new app with authentication data matching the input.
 *
 * @param {object} auth the object to use for authentication (typically {uid: some-uid})
 * @return {object} the app.
 */
function authedApp (auth) {
  return firebase
    .initializeTestApp({ projectId, auth })
    .firestore()
}

async function setData (category) {
  if (category == 'users') {
    const promises = usersSample.map(user => {
      return new Promise(async (resolve) => {
        await adminDb.doc(`users/${user.id}`).set(user)
        resolve()
      })
    })

    await Promise.all(promises)
  }

  if (category == 'organizations') {
    const promises = organizationsSample.map(org => {
      return new Promise(async (resolve) => {
        const { settings, ...orgWithoutSettings } = org
        await adminDb.doc(`organizations/${org.id}`).set(orgWithoutSettings)
        await adminDb.doc(`organizations/${org.id}/settings/deal`).set(settings.deal)
        await adminDb.doc(`organizations/${org.id}/settings/general`).set(settings.general)
        await adminDb.doc(`organizations/${org.id}/settings/person`).set(settings.person)
        await adminDb.doc(`organizations/${org.id}/settings/security`).set(settings.security)
        resolve()
      })
    })

    await Promise.all(promises)
  }

  if (category == 'companies') {
    const promises = companiesSample.map(company => {
      return new Promise(async (resolve) => {
        await adminDb.doc(`companies/${company.id}`).set(company)
        resolve()
      })
    })

    await Promise.all(promises)
  }

  if (category == 'people') {
    const promises = peopleSample.map(person => {
      return new Promise(async (resolve) => {
        await adminDb.doc(`people/${person.id}`).set(person)
        resolve()
      })
    })

    await Promise.all(promises)
  }

  if (category == 'deals') {
    const promises = dealsSample.map(deal => {
      return new Promise(async (resolve) => {
        await adminDb.doc(`deals/${deal.id}`).set(deal)
        resolve()
      })
    })

    await Promise.all(promises)
  }

  if (category == 'tasks') {
    const promises = tasksSample.map(task => {
      return new Promise(async (resolve) => {
        const { subtasks, comments, ...taskData } = task

        await adminDb.doc(`tasks/${task.id}`).set(taskData)

        const promisesForSubtasks = subtasks.map(subtask => {
          return new Promise(async (resolve) => {
            await adminDb.doc(`tasks/${task.id}/subtasks/${subtask.id}`).set(subtask)
            resolve()
          })
        })

        await Promise.all(promisesForSubtasks)

        const promisesForComments = comments.map(comment => {
          return new Promise(async (resolve) => {
            await adminDb.doc(`tasks/${task.id}/comments/${comment.id}`).set(comment)
            resolve()
          })
        })

        await Promise.all(promisesForComments)

        resolve()
      })
    })

    await Promise.all(promises)
  }
}

/*
 * ============
 *  Test Cases
 * ============
 */

before(async () => {
  await firebase.loadFirestoreRules({ projectId, rules })
})

after(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()))
  console.log(`View rule coverage information at ${coverageUrl}\n`)
})

describe('My app', () => {
  describe('Security rules for users', () => {
    beforeEach(async () => {
      // Clear the database between tests
      await firebase.clearFirestoreData({ projectId })
      await setData('users')
    })

    it('require users to log in before creating a profile', async () => {
      const db = authedApp(null)
      const profile = db.collection('users').doc('owner-org1')
      await firebase.assertFails(profile.set({ name: 'alice penebaker' }))
    })

    it('should not let anyone read any user in other team', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1' })
      const profile = db.collection(`users`).doc('user-org2')
      await firebase.assertFails(profile.get())
    })

    it('should not let anyone query users in other team', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1' })
      const users = db.collection(`users`)
      await firebase.assertFails(users.get())
    })

    it('should not let anyone create a user on behalf of him', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1' })
      const users = db.collection(`users`)
      await firebase.assertFails(users.add({ name: 'sample user' }))
    })
  })

  describe('Security rules for teams', () => {
    beforeEach(async () => {
      // Clear the database between tests
      await firebase.clearFirestoreData({ projectId })
      await setData('organizations')
    })

    it('should let anyone read his team only', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1' })
      const org1 = db.collection(`organizations`).doc('org1')
      const org2 = db.collection(`organizations`).doc('org2')
      const orgs = db.collection(`organizations`)
      await firebase.assertSucceeds(org1.get())
      await firebase.assertFails(org2.get())
      await firebase.assertFails(orgs.get())
    })

    it('should not let anyone update another team', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      const org2 = db.collection(`organizations`).doc('org2')
      await firebase.assertFails(org2.update({ name: 'xxx' }))
    })

    it('should let only owner or admin update their team', async () => {
      const db = authedApp({ uid: 'user-org1', orgId: 'org1', roleId: 'user' })
      const ownerDb = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection(`organizations`).doc('org1').update({ name: 'xxx' })
      )
      await firebase.assertSucceeds(
        ownerDb.collection(`organizations`).doc('org1').update({ name: 'xxx' })
      )
    })

    it('should let not anyone create a new team or delete a team on behalf of him', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      const organizations = db.collection(`organizations`)
      await firebase.assertFails(organizations.add({ name: 'xxx' }))
      await firebase.assertFails(organizations.doc('org1').delete())
    })

    it("should let anyone read it's team settings and only", async () => {
      const db1 = authedApp({ uid: 'user-org1', orgId: 'org1', roleId: 'user' })
      const dealSetting = db1.collection(`organizations`).doc('org1').collection('settings').doc('deal')
      const securitySetting = db1.collection(`organizations`).doc('org1').collection('settings').doc('security')
      const otherOrgSecuritySetting = db1.collection(`organizations`).doc('org2').collection('settings').doc('security')
      await firebase.assertSucceeds(dealSetting.get())
      await firebase.assertSucceeds(securitySetting.get())
      await firebase.assertFails(otherOrgSecuritySetting.get())
    })

    it("should let not anyone write it's team security on behalf of him", async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      const dealSetting = db.collection(`organizations`).doc('org1').collection('settings').doc('deal')
      const securitySetting = db.collection(`organizations`).doc('org1').collection('settings').doc('security')
      await firebase.assertFails(securitySetting.update({ permissions: [] }))
      await firebase.assertSucceeds(dealSetting.update({ boards: [] }))
    })
  })

  describe('Security rules for companies', () => {
    beforeEach(async () => {
      // Clear the database between tests
      await firebase.clearFirestoreData({ projectId })
      await setData('companies')
    })

    it("should let anyone only read companies that were created in it's team", async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1' })
      await firebase.assertSucceeds(
        db.collection(`companies`).doc('comp1-org1').get()
      )
      await firebase.assertFails(
        db.collection(`companies`).doc('comp1-org2').get()
      )
      await firebase.assertFails(
        db.collection(`companies`).get()
      )
    })

    it('should let not anyone create a company for another team', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1' })
      await firebase.assertFails(
        db.collection(`companies`).add({ orgId: 'org2' })
      )
    })

    it('should let only owner or admin create a company for their team', async () => {
      const db = authedApp({ uid: 'user-org1', orgId: 'org1', roleId: 'user' })
      await firebase.assertFails(
        db.collection('companies').add({ orgId: 'org1' })
      )
    })

    it('should not let anyone update other team\'s company', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection('companies').doc('comp1-org2').update({ name: 'xxx' })
      )
    })

    it('should not let anyone do any accidental update of the company with other company\'s profile', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection('companies').doc('comp1-org1').update({
          id: 'comp2-org1',
          name: 'xxxx'
        })
      )
    })

    it('should let only owner or admin are permitted to update a company', async () => {
      const ownerDb = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      const userDb = authedApp({ uid: 'user-org1', orgId: 'org1', roleId: 'user' })
      await firebase.assertSucceeds(
        ownerDb.collection('companies').doc('comp1-org1').update({ name: 'xxx' })
      )
      await firebase.assertFails(
        userDb.collection('companies').doc('comp1-org1').update({ name: 'xxx' })
      )
    })

    it('should not let anyone is permitted to delete a company', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection('companies').doc('comp1-org1').delete()
      )
    })
  })

  describe('Security rules for people', () => {
    beforeEach(async () => {
      // Clear the database between tests
      await firebase.clearFirestoreData({ projectId })
      await setData('people')
    })

    it("should let anyone only read people that were created in it's team", async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1' })
      await firebase.assertSucceeds(
        db.collection(`people`).doc('per1-comp1-org1').get()
      )
      await firebase.assertFails(
        db.collection(`people`).doc('per1-comp1-org2').get()
      )
      await firebase.assertFails(
        db.collection(`people`).get()
      )
    })

    it('should let not anyone create a person for another team', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1' })
      await firebase.assertFails(
        db.collection(`people`).add({ orgId: 'org2' })
      )
    })

    it('should let only owner or admin create a person for their team', async () => {
      const db = authedApp({ uid: 'user-org1', orgId: 'org1', roleId: 'user' })
      await firebase.assertFails(
        db.collection('people').add({ orgId: 'org1' })
      )
    })

    it('should not let anyone update other team\'s people', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection('people').doc('per1-comp1-org2').update({ name: 'xxx' })
      )
    })

    it('should not let anyone do any accidental update of the person with other person\'s profile', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection('people').doc('per1-comp1-org1').update({
          id: 'per1-comp2-org1',
          name: 'xxxx'
        })
      )
    })

    it('should let only owner or admin are permitted to update a person', async () => {
      const ownerDb = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      const userDb = authedApp({ uid: 'user-org1', orgId: 'org1', roleId: 'user' })
      await firebase.assertSucceeds(
        ownerDb.collection('people').doc('per1-comp1-org1').update({ name: 'xxx' })
      )
      await firebase.assertFails(
        userDb.collection('people').doc('per1-comp1-org1').update({ name: 'xxx' })
      )
    })

    it('should not let anyone is permitted to delete a person', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection('people').doc('per1-comp1-org1').delete()
      )
    })
  })

  describe('Security rules for deals', () => {
    beforeEach(async () => {
      // Clear the database between tests
      await firebase.clearFirestoreData({ projectId })
      await setData('deals')
    })

    it("should let anyone only read deals that were created in it's team", async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1' })
      await firebase.assertSucceeds(
        db.collection(`deals`).doc('deal1-org1').get()
      )
      await firebase.assertFails(
        db.collection(`deals`).doc('deal1-org2').get()
      )
      await firebase.assertFails(
        db.collection(`deals`).get()
      )
    })

    it('should let not anyone create a deal for another team', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1' })
      await firebase.assertFails(
        db.collection(`deals`).add({ orgId: 'org2' })
      )
    })

    it('should let anyone with user role create a deal only on proposal board', async () => {
      const db = authedApp({ uid: 'user-org1', orgId: 'org1', roleId: 'user' })
      await firebase.assertSucceeds(
        db.collection('deals').add({ orgId: 'org1', boardId: 'proposal' })
      )
      await firebase.assertFails(
        db.collection('deals').add({ orgId: 'org1', boardId: 'job' })
      )
    })

    it('should let owner and admin create a deal on any board', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertSucceeds(
        db.collection('deals').add({ orgId: 'org1', boardId: 'job' })
      )
    })

    it('should not let anyone update other team\'s deal', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection('deals').doc('deal1-org2').update({ name: 'xxx' })
      )
    })

    it('should not let anyone do any accidental update of the deal with other deal\'s data', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection('deals').doc('deal1-org1').update({
          id: 'deal2-org1',
          name: 'xxxx'
        })
      )
    })

    it('should let anyone with user role is permitted to update a deal only on a proposal board', async () => {
      const db = authedApp({ uid: 'user-org1', orgId: 'org1', roleId: 'user' })
      await firebase.assertSucceeds(
        db.collection('deals').doc('deal1-org1').update({ name: 'xxx', boardId: 'proposal' })
      )
      await firebase.assertFails(
        db.collection('deals').doc('deal1-org1').update({ name: 'xxx', boardId: 'job' })
      )
    })

    it('should let owner and admin are permitted to update a deal on any board', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertSucceeds(
        db.collection('deals').doc('deal1-org1').update({ name: 'xxx', boardId: 'job' })
      )
    })

    it('should not let anyone is permitted to delete a deal', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection('deals').doc('deal1-org1').delete()
      )
    })
  })

  describe('Security rules for tasks', () => {
    beforeEach(async () => {
      // Clear the database between tests
      await firebase.clearFirestoreData({ projectId })
      await setData('tasks')
    })

    it("should let anyone only read tasks that were created in it's team", async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1' })
      await firebase.assertSucceeds(
        db.collection(`tasks`).doc('task1-deal1-org1').get()
      )
      await firebase.assertFails(
        db.collection(`tasks`).doc('task1-deal1-org2').get()
      )
      await firebase.assertFails(
        db.collection(`tasks`).get()
      )
    })

    it('should let not anyone create a task for another team', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1' })
      await firebase.assertFails(
        db.collection(`tasks`).add({ orgId: 'org2' })
      )
    })

    it('should let only owner or admin create a task for their team', async () => {
      const db = authedApp({ uid: 'user-org1', orgId: 'org1', roleId: 'user' })
      await firebase.assertFails(
        db.collection('tasks').add({ orgId: 'org1' })
      )
    })

    it('should not let anyone update other team\'s task', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection('tasks').doc('task1-deal1-org2').update({ name: 'xxx' })
      )
    })

    it('should not let anyone do any accidental update of the task with other task\'s data', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection('tasks').doc('task1-deal1-org1').update({
          id: 'task2-deal-org1',
          name: 'xxxx'
        })
      )
    })

    it('should let only owner or admin are permitted to update a task', async () => {
      const ownerDb = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      const userDb = authedApp({ uid: 'user-org1', orgId: 'org1', roleId: 'user' })
      await firebase.assertSucceeds(
        ownerDb.collection('tasks').doc('task1-deal1-org1').update({ name: 'xxx' })
      )
      await firebase.assertFails(
        userDb.collection('tasks').doc('task1-deal1-org1').update({ name: 'xxx' })
      )
    })

    it('should not let anyone is permitted to delete a task', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection('tasks').doc('task1-deal1-org1').delete()
      )
    })
  })

  describe('Security rules for subtasks', () => {
    beforeEach(async () => {
      // Clear the database between tests
      await firebase.clearFirestoreData({ projectId })
      await setData('tasks')
    })

    it("should let anyone only read subtasks that were created in it's team", async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1' })
      await firebase.assertSucceeds(
        db.collection(`tasks`).doc('task1-deal1-org1').collection('subtasks').doc('subtask1-task1-deal1-org1').get()
      )
      await firebase.assertFails(
        db.collection(`tasks`).doc('task1-deal1-org2').collection('subtasks').doc('subtask1-task1-deal1-org2').get()
      )
    })

    it('should let a new subtask be pushed only to the task which it was created on', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1' })
      await firebase.assertFails(
        db.collection(`tasks`).doc('task1-deal1-org1').collection('subtasks').add({ orgId: 'org1', taskId: 'task1-deal2-org1' })
      )
      await firebase.assertFails(
        db.collection(`tasks`).doc('task1-deal1-org1').collection('subtasks').add({ orgId: 'org2' })
      )
    })

    it('should let only owner or admin create a subtask for their team', async () => {
      const db = authedApp({ uid: 'user-org1', orgId: 'org1', roleId: 'user' })
      await firebase.assertFails(
        db.collection('tasks').doc('task1-deal1-org1').collection('subtasks').add({ orgId: 'org1' })
      )
    })

    it('should not let anyone update other team\'s subtask', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection('tasks').doc('task1-deal1-org2').collection('subtasks').doc('subtask1-task1-deal1-org2').update({ name: 'xxx' })
      )
    })

    it('should not let anyone do any accidental update of the subtask with other subtask\'s data', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection('tasks').doc('task1-deal1-org1').collection('subtasks').doc('subtask1-task1-deal1-org1').update({
          id: 'subtask2-task1-deal1-org1',
          name: 'xxxx'
        })
      )
    })

    it('should let only owner or admin are permitted to update a subtask', async () => {
      const ownerDb = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      const userDb = authedApp({ uid: 'user-org1', orgId: 'org1', roleId: 'user' })
      await firebase.assertSucceeds(
        ownerDb.collection('tasks').doc('task1-deal1-org1').collection('subtasks').doc('subtask1-task1-deal1-org1').update({ name: 'xxx' })
      )
      await firebase.assertFails(
        userDb.collection('tasks').doc('task1-deal1-org1').collection('subtasks').doc('subtask1-task1-deal1-org1').update({ name: 'xxx' })
      )
    })

    it('should not let anyone is permitted to delete a task', async () => {
      const db = authedApp({ uid: 'owner-org1', orgId: 'org1', roleId: 'owner' })
      await firebase.assertFails(
        db.collection('tasks').doc('task1-deal1-org1').collection('subtasks').doc('subtask1-task1-deal1-org1').delete()
      )
    })
  })
})
