import config from '../../config'

export const PickerMode = {
  FILE: 'file',
  FOLDER: 'folder'
}

export default ({ Vue, store, fresh }) => {
  const { G_APP_ID } = config()

  const itemChosenInternalCallback_ = callback => data => {
    if (data.action === window.google.picker.Action.PICKED) {
      callback(data)
    }
  }

  const generatePickerBuilder_ = (view, callback) => {
    return (
      new window.google.picker.PickerBuilder()
        // .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
        // .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
        .setAppId(G_APP_ID)
        .setOAuthToken(store.getters['integration/gDrive'].accessToken)
        // .setDeveloperKey(G_API_KEY)
        // .setSelectableMimeTypes('application/vnd.google-apps.folder')
        .setCallback(callback)
        .addView(view)
    )
  }

  const showFilePicker_ = callback => {
    const view = new window.google.picker.DocsView(
      window.google.picker.ViewId.DOCS
    )
      .setSelectFolderEnabled(false)
      .setIncludeFolders(false)
      .setMode(window.google.picker.DocsViewMode.LIST)
      .setMimeTypes('application/zip')

    const pickerBuilder = generatePickerBuilder_(view, callback)
    pickerBuilder.setTitle('Select a file')
    const picker = pickerBuilder.build()
    picker.setVisible(true)
  }

  const showFolderPicker_ = callback => {
    // const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
    const view = new window.google.picker.DocsView(
      window.google.picker.ViewId.FOLDERS
    )
      .setMimeTypes('application/vnd.google-apps.folder')
      .setSelectFolderEnabled(true)
    // .setEnableTeamDrives(true)
    // .setIncludeFolders(true)
    // .setMode(window.google.picker.DocsViewMode.LIST)

    const pickerBuilder = generatePickerBuilder_(view, callback)
    pickerBuilder.setTitle('Select a team drive')
    const picker = pickerBuilder.build()
    picker.setVisible(true)
  }

  const showInternal_ = (pickerMode, callback) => {
    if (pickerMode === PickerMode.FILE) {
      showFilePicker_(itemChosenInternalCallback_(callback))
    } else if (pickerMode === PickerMode.FOLDER) {
      showFolderPicker_(itemChosenInternalCallback_(callback))
    } else {
      throw new Error('Unexpected Picker Mode: ' + pickerMode)
    }
  }

  const show = (pickerMode, callback) => {
    if (!window.gapi) {
      return
    }

    window.gapi.load('picker', async () => {
      await fresh()
      showInternal_(pickerMode, callback)
    })
  }

  Vue.prototype.$gPicker = {
    show
  }
}
