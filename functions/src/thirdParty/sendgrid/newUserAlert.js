import mailer from './mailer'

export default (receiver, ownerName, orgName, password, link) => {
  mailer({
    from: 'admin@getmavrik.com',
    to: receiver,
    subject: `You're now a ${orgName} member`,
    html: `<p style="font-size: 30px;">${ownerName} added you to ${orgName}</p>
          <div style="padding-bottom: 16px;">Password: ${password}</div>
          <a
            href="${link}"
            target="_blank"
            style="vertical-align:top;font-size:14px;font-weight:500;color:#fff;text-decoration:none;height:36px;padding:9px 16px 11px;background:#ff5959;border-radius:24px">
            Sign In
          </a>
          <div style="padding-top: 16px;"> We're glad you're here </div>
        `
  })
}
