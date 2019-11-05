const getSharedDrives = fresh => async () => {
  await fresh()
  return window.gapi.client.drive.drives.list({})
}

const getFile = fresh => async fileId => {
  await fresh()
  const response = await window.gapi.client.drive.files.get({
    fileId,
    supportsAllDrives: true,
    supportsTeamDrives: true,
    fields: 'id,name,webViewLink'
  })

  return response.result
}

export default ({
  Vue,
  fresh
}) => {
  Vue.prototype.$gDrive = {
    getSharedDrives: getSharedDrives(fresh),
    getFile: getFile(fresh)
  }
}
