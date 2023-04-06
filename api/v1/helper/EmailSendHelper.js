const nodemailer = require('nodemailer')
const config = require('../../../config/config')

exports.sendEmailFunction = async (transporter, mailOptions) => {
  var dataToSend = {
    sendStatus: false,
    response: {},
    error: false
  }

  var result = await new Promise(async (resolve, reject) => {
    var data = await transporter.sendMail(mailOptions, (error, info) => {
      if (!error && info.response.includes('250 Ok')) {
        dataToSend = {
          sendStatus: true,
          response: info,
          error: false
        }
      } else if (error) {
        dataToSend = {
          sendStatus: false,
          response: {},
          error: true
        }
      }

      resolve(dataToSend)
    })
  })
  return result
}

exports.sendEmail = async (emailData, type) => {
  let from = config.SMTP_EMAIL_ID
  let body_data = ''
  let subject = ''
  let to = emailData.to
  let resData = {}
  let attachmentTrue = false
  if (emailData.attachments !== undefined && emailData.attachments !== []) {
    attachmentTrue = true
  }

  //
  switch (type) {
    case 'ACCOUNT_ACTIVATION':
      body_data = `<b>Greetings ${emailData.fullName}!</b>
            <br></br>
            <br> This is to inform you that your Olympus account has been activated successfully.<br />
            <br></br>
            <br></br><br>We thank you for being a member of Olympus.</br>
            <br></br><br></br>
            <br><b>Best Regards</b><br><b>Olympus, Inc</b><br>
            <br></br><br></br>`
      subject = `Olympus: Account activation successfull.`
      break

    case 'FORGOT_PASSWORD':
      body_data = `<b>Dear ${emailData.fullName}, </b>
            <br></br>
            <br>Seems like you forgot password of your Olympus trading's account.</br>
            <br></br>
            <br>Click on the below to reset your password.<br />
            <br><b>To reset password <a href= '${emailData.resetPasswordLink}'>Click here:</a> </b></br><br></br>
            <br>After successfull reset password, please login with the new password.</br>
            <br></br>
            <br>If it wasn't you, please ignore this email.</br>
            <br></br><br></br>
            <br><b>Best Regards</b><br><b>Olympus, Inc</b><br>
            <br></br><br></br>`
      subject = `Olympus: Forgot your password?`
      break

    case 'REGISTRATION':
      body_data = `<b>Dear ${emailData.fullName}, </b>
            <br></br>
            <br>You have successfully created account with us.</br>
            <br></br>
            <br>Please click <a href= "${config.Olympus_LIVE_LINK}"> olympusfit.com </a> and access our website using your id and password.</br>
            <br></br>
            <br>Your login id is: ${emailData.email}</br>
            <br></br>
            <br>Your login password is: ${emailData.password}</br>
            <br></br><br></br>
            <br><b>Welcome to our family.</b><br><b>Olympus FIT</b><br>
            <br></br><br></br>`
      subject = `Olympus: REGISTERED SUCCESSFULLY`
      break

    case 'BOOKING_PLACED':
      body_data = `<b>Dear ${emailData.fullName}, </b>
            <br></br>
            <br>We're happy to let you know that your slot for ${emailData.trekTitle} trek is successfully booked which will be starting on ${emailData.slot_startDate}</br>
            <br></br>
            <br>Your booking id is <b>${emailData.booking_id}. </b></br>
            <br></br>
            <br>You can login to our website to get more information. </br>
            <br></br>
            <br>You will receive an email from our side for more details or you can also contact us for any further queries.<br />
            <br></br>
            <br><b> Best Regards</b><br>
            <br><b> Olympus FIT</b><br>
            <br></br><br></br>`
      subject = `Olympus: BOOKING DONE.`
      break

    case 'BOOKING_FAILED':
      body_data = `<b>Dear ${emailData.fullName}, </b>
            <br></br>
            <br>Your ppayment failed for booking ${emailData.booking_id} of ${emailData.trekTitle} trek which will be starting on ${emailData.slot_startDate}. </br>
            <br></br>
            <br>If you are facing any issues or have any queries, please feel free to contact us. We will try our best to help you out</br>
            <br></br><br></br>
            <br><b> Best Regards</b><br>
            <br><b> Olympus FIT</b><br>
            <br></br><br></br>`
      subject = `Olympus: BOOKING DONE.`
      break

    case 'OTHER':
      body_data = emailData.html
      subject = emailData.subject
      break

    default:
      body_data = emailData.html
      subject = emailData.subject
      break
  }

  let transporter = await nodemailer.createTransport({
    host: config.SMTP_MAIL_HOST,
    port: 25,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.SMTP_MAIL_USER, // generated ethereal user
      pass: config.SMTP_MAIL_PASSWORD // generated ethereal password
    },
    debug: true // show debug output
    ////logger: true, // log information in ////
  })

  // send mail with defined transport object

  var mailOptions = {
    from: from,
    to: to,
    subject: subject,
    html: body_data,
    attachments: attachmentTrue === true ? emailData.attachments : []
  }

  resData = {
    transporter: transporter,
    mailOptions: mailOptions
  }

  return resData
}
