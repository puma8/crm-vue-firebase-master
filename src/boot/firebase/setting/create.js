import handleError from './error'

export default context => {
  return {
    general: {
      emailType: {
        create: createEmailType(context)
      },
      phoneType: {
        create: createPhoneType(context)
      }
    },
    person: {
      designation: {
        create: createDesignation(context)
      },
      role: {
        create: createRole(context)
      }
    },
    deal: {
      stage: {
        create: createStage(context)
      },
      customField: {
        create: createCustomField(context)
      },
      tag: {
        create: createTag(context)
      },
      folderTemplate: {
        create: createFolderTemplate(context, 'deal')
      }
    },
    project: {
      section: {
        create: createSection(context)
      },
      customField: {
        create: createProjectCustomField(context)
      },
      tag: {
        create: createTag(context)
      },
      folderTemplate: {
        create: createFolderTemplate(context, 'project')
      }
    }
  }
}

export const createEmailType = context => async data => {
  const {
    text
  } = data
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']

  try {
    const id = text.toLowerCase().replace(/\s/g, '_')
    await $firebase.db.doc(`organizations/${orgId}/settings/general`).update({
      emailTypes: $firebase.operator.arrayUnion({ id, text })
    })

    return {
      data: { id, text }
    }
  } catch (error) {
    handleError(error)
  }
}

export const createPhoneType = context => async data => {
  const {
    text
  } = data
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']

  try {
    const id = text.toLowerCase().replace(/\s/g, '_')
    await $firebase.db.doc(`organizations/${orgId}/settings/general`).update({
      phoneTypes: $firebase.operator.arrayUnion({ id, text })
    })

    return {
      data: { id, text }
    }
  } catch (error) {
    handleError(error)
  }
}

export const createDesignation = context => async data => {
  const {
    text
  } = data
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']

  try {
    const id = text.toLowerCase().replace(/\s/g, '_')
    await $firebase.db.doc(`organizations/${orgId}/settings/person`).update({
      designations: $firebase.operator.arrayUnion({ id, text })
    })

    return {
      data: { id, text }
    }
  } catch (error) {
    handleError(error)
  }
}

export const createRole = context => async data => {
  const {
    designationId,
    text
  } = data
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']

  try {
    const id = `${designationId}-${text.toLowerCase().replace(/\s/g, '_')}`
    await $firebase.db.doc(`organizations/${orgId}/settings/person`).update({
      roles: $firebase.operator.arrayUnion({ id, designationId, text })
    })

    return {
      data: { id, text }
    }
  } catch (error) {
    handleError(error)
  }
}

export const createStage = context => async data => {
  const { boardId, text, order } = data
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']

  try {
    const id = `${boardId}-${text.toLowerCase().replace(/\s/g, '_')}`

    await $firebase.db.doc(`organizations/${orgId}/settings/deal`).update({
      stages: $firebase.operator.arrayUnion({ id, boardId, text, order })
    })

    return {
      data: { id, text }
    }
  } catch (error) {
    handleError(error)
  }
}
export const createSection = context => async data => {
  const {
    text
  } = data
  const {
    store,
    Vue
  } = context
  const {
    $firebase
  } = Vue.prototype
  const {
    orgId
  } = store.getters['auth/user']

  try {
    const id = `${text.toLowerCase().replace(/\s/g, '_')}`

    await $firebase.db.doc(`organizations/${orgId}/settings/project`).update({
      sections: $firebase.operator.arrayUnion({
        id,
        text
      })
    })

    return {
      data: {
        id,
        text
      }
    }
  } catch (error) {
    handleError(error)
  }
}

export const createCustomField = context => async data => {
  const { fieldName, fieldTypeId } = data
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']

  try {
    const id = Date.now()

    await $firebase.db.doc(`organizations/${orgId}/settings/deal`).update({
      customFields: $firebase.operator.arrayUnion({
        id,
        fieldName,
        fieldTypeId
      })
    })

    return {
      data: id
    }
  } catch (error) {
    handleError(error)
  }
}

export const createProjectCustomField = context => async data => {
  const {
    fieldName,
    fieldTypeId
  } = data
  const {
    store,
    Vue
  } = context
  const {
    $firebase
  } = Vue.prototype
  const {
    orgId
  } = store.getters['auth/user']

  try {
    const id = Date.now()

    await $firebase.db.doc(`organizations/${orgId}/settings/project`).update({
      customFields: $firebase.operator.arrayUnion({
        id,
        fieldName,
        fieldTypeId
      })
    })

    return {
      data: id
    }
  } catch (error) {
    handleError(error)
  }
}

export const createTag = context => async data => {
  const {
    containerType,
    name,
    color
  } = data
  const {
    store,
    Vue
  } = context
  const {
    $firebase
  } = Vue.prototype
  const {
    id,
    orgId
  } = store.getters['auth/user']

  try {
    const tagId = `${id}_${Date.now()}`

    await $firebase.db.doc(`organizations/${orgId}/settings/${containerType}`).update({
      tags: $firebase.operator.arrayUnion({
        id: tagId,
        name,
        color
      })
    })

    return tagId
  } catch (error) {
    handleError(error)
  }
}

export const createFolderTemplate = (context, containerType) => async data => {
  const {
    store,
    Vue
  } = context
  const {
    $firebase
  } = Vue.prototype
  const {
    orgId
  } = store.getters['auth/user']

  try {
    await $firebase.db.doc(`organizations/${orgId}/settings/${containerType}`).update({
      folderTemplate: data
    })
  } catch (error) {
    handleError(error)
  }
}
