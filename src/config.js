export default () => {
  const env = process.env.parsed || process.env

  const {
    ENV_MODE
  } = env

  let prefix = ''
  if (ENV_MODE !== 'PRODUCTION') {
    prefix = `${ENV_MODE}_`
  }

  const parsed = env
  const envVars = Object.keys(parsed)
    .filter(key => key.startsWith(prefix))
    .map(key => ({
      [key.substring(prefix.length)]: parsed[key]
    }))
    .reduce((result, e) => ({
      ...result,
      ...e
    }), {})

  return envVars
}
