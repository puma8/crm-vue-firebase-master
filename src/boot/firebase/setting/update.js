import handleError from './error'

export default context => {
  return {
    deal: {
      stage: {
        update: updateDealStage(context)
      },
      customField: {
        update: updateCustomField(context)
      },
      tag: {
        update: updateTag(context)
      }
    },
    project: {
      section: {
        update: updateProjectSection(context)
      },
      customField: {
        update: updateProjectCustomField(context)
      },
      tag: {
        update: updateTag(context)
      }
    }
  }
}

export const updateDealStage = context => async data => {
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']
  const stages = store.getters['settings/deal'].stages

  try {
    await $firebase.db.doc(`organizations/${orgId}/settings/deal`).update({
      stages: stages.map(stage =>
        stage.id === data.id
          ? {
            ...stage,
            ...data
          }
          : stage
      )
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

export const updateCustomField = context => async data => {
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']
  const customFields = store.getters['settings/deal'].customFields

  try {
    await $firebase.db.doc(`organizations/${orgId}/settings/deal`).update({
      customFields: customFields.map(cf => (cf.id === data.id ? data : cf))
    })
  } catch (error) {
    handleError(error)
  }
}

export const updateProjectSection = context => async data => {
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']
  const sections = store.getters['settings/project'].sections

  try {
    await $firebase.db.doc(`organizations/${orgId}/settings/project`).update({
      sections: sections.map(section =>
        section.id === data.id
          ? {
            ...section,
            ...data
          }
          : section
      )
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

export const updateProjectCustomField = context => async data => {
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']
  const customFields = store.getters['settings/project'].customFields

  try {
    await $firebase.db.doc(`organizations/${orgId}/settings/project`).update({
      customFields: customFields.map(cf => (cf.id === data.id ? data : cf))
    })
  } catch (error) {
    handleError(error)
  }
}

export const updateTag = context => async data => {
  const { containerType, id: tagId, name, color } = data
  const { store, Vue } = context
  const { $firebase } = Vue.prototype
  const { orgId } = store.getters['auth/user']
  const { tags } = store.getters[`settings/${containerType}`]

  try {
    await $firebase.db
      .doc(`organizations/${orgId}/settings/${containerType}`)
      .update({
        tags: tags.map(tag =>
          tag.id === tagId
            ? {
              ...tag,
              name,
              color
            }
            : tag
        )
      })
  } catch (error) {
    handleError(error)
  }
}
