import mailer from './mailer'

export default (receiver, link) => {
  mailer({
    from: 'admin@getmavrik.com',
    to: receiver,
    subject: 'Confirm your email',
    html: `<p style="font-size: 30px;">You're on your way!</p>
          <p style="font-size: 30px;">Let's confirm your email address.</p>
          <div style="padding-bottom: 16px;">By clicking on the following link, you are confirming your email address</div>
          <a
            href="${link}"
            target="_blank"
            style="vertical-align:top;font-size:14px;font-weight:500;color:#fff;text-decoration:none;height:36px;padding:9px 16px 11px;background:#ff5959;border-radius:24px">
            Confirm Email Address
          </a>
          <div style="padding-top: 16px;"> We're glad you're here </div>
        `
  })
}
