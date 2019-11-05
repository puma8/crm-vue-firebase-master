export const sanitizeJson = json => {
  Object.keys(json).forEach(key => json[key] === undefined && delete json[key])
  return json
}
