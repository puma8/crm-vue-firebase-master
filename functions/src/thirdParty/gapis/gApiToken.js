import { GoogleToken } from 'gtoken'
// import config from '../utils/config';

const gtokens = {}

export default async scope => {
  if (gtokens[scope]) {
    const gtoken = gtokens[scope]
    const token = await gtoken.getToken()

    return token
  } else {
    // const { sa } = config
    const gtoken = new GoogleToken({
      email: 'mavrik-crm-gdrive@mavrik-crm-9c6b2.iam.gserviceaccount.com', // sa.email
      key: '', // sa.pkey
      scope
    })
    const token = await gtoken.getToken()

    gtokens[scope] = gtoken

    return token
  }
}
