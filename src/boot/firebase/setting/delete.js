import handleError from './error'

export default context => {
  return {
    deal: {
      stage: {
        delete: deleteStage(context)
      },
      customField: {
        delete: deleteCustomField(context)
      },
      tag: {
        delete: deleteTag(context)
      }
    },
    project: {
      section: {
        delete: deleteSection(context)
      },
      tag: {
        delete: deleteTag(context)
      }
    }
  }
}

export const deleteStage = context => async data => {
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']
  const stages = store.getters['settings/deal'].stages

  try {
    await $firebase.db.doc(`organizations/${orgId}/settings/deal`).update({
      stages: stages.filter(stage => stage.id !== data.id)
    })
    return {
      data: {
        success: true
      }
    }
  } catch (error) {
    handleError(error)
  }
}
export const deleteSection = context => async data => {
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']
  const sections = store.getters['settings/project'].sections

  try {
    await $firebase.db.doc(`organizations/${orgId}/settings/project`).update({
      sections: sections.filter(section => section.id !== data.id)
    })
    return {
      data: {
        success: true
      }
    }
  } catch (error) {
    handleError(error)
  }
}

export const deleteCustomField = context => async data => {
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']
  const customFields = store.getters['settings/deal'].customFields

  try {
    await $firebase.db.doc(`organizations/${orgId}/settings/deal`).update({
      customFields: customFields.filter(cf => cf.id !== data.id)
    })
  } catch (error) {
    handleError(error)
  }
}

export const deleteTag = context => async data => {
  const {
    containerType,
    tag: { id: tagId }
  } = data
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']
  const { tags } = store.getters[`settings/${containerType}`]

  try {
    await $firebase.db
      .doc(`organizations/${orgId}/settings/${containerType}`)
      .update({
        tags: tags.filter(tag => tag.id !== tagId)
      })
  } catch (error) {
    handleError(error)
  }
}
