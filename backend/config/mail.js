const Sentry = require("@sentry/node");
const nodemailer = require("nodemailer");
const path = require("path");
const relativePath = path.relative(process.cwd(), "public/images/favicon.ico");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    Sentry.captureException(err);
    console.log(error);
  } else {
    console.log("Server is ready to take our messages", success);
  }
});

const sendEmail = async (type, email, data) => {
  const welcome = {
    subject: "Welcome!",
    text: "Welcome to the Chat Messanger from Noerkel IT.",
    html: `<div style="margin:1em; padding:1em; text-align:left; color:#e3e6e9; background:#1f2329;border-radius: 2.5em">
        <p>Dear ${data.username},</p>
        <br />
        <p>Welcome to the Chat Messanger from Noerkel IT. Thank you for your interest in the product and for supporting me!</p>
        <br />
        <div
        style="width:100%;display:${
          data.link === null ? "none" : "flex"
        };flex-direction:row;justify-content:space-around;align-items:center">
          <button
         value="${
           data?.link
         }" id="chat-sing-up" style="color:#e3e6e9;width:25vw;padding:0.25em;border:none;border-radius:0.25em;background: rgb(0, 123, 255, 1)">
            <a href=${data?.link}>Join</a>
          </button>
          <br />
        </div>
        <p>kind of regrends</p>
        <p>your Noerkel IT Support Team</p>
        <div style="height: 150px; textAlign: center;" }}>
          <img src="cid:logo" style=" margin-top: 0%; width:150px;heigth:150px;"/>
        </div>
      </div>`,
  };

  const deletAccount = {
    subject: "Delete Your account!",
    text: "Delete Account by the Chat Messanger from Noerkel IT.",
    html: `<div style="margin:1em; padding:1em; text-align:left; color:#e3e6e9; background:#1f2329; border-radius: 2.5em">
      <p>Dear ${data.username},</p><br />
      <p>we are sorry that you want to leave us${data.reason}. You just need to click on the button on the end, to delete your account.
      Once this is done all your messages, chat rooms and profile will be removed, there is no way for you to restore the data.</p>
        <div
        style="width:100%;display:flex;flex-direction:row;justify-content:space-around;align-items:center">
        <button
          style="color:#e3e6e9;width:25vw;padding:0.25em;border:none;border-radius:0.25em;background:rgb(0, 123, 255, 1)">
          <a style="color:#e3e6e9;" href=${data.link}/false>Cancle</a>
        </button>
        <button
          style="color:#e3e6e9;width:25vw;padding:0.25em;border:none;border-radius:0.25em;background: rgb(178, 34, 34, 1)">
          <a style="color:#e3e6e9;" href=${data.link}/true>Delete</a>
        </button>
      </div>
      <br /><p>kind of regrends</p><p>your Noerkel IT Support Team</p>
      <div style="height: 150px; textAlign: center;" }}>
        <img src="cid:logo" style=" margin-top: 0%; width:150px;heigth:150px;"/>
      </div></div>`,
  };

  const message = {
    subject: `New message from ${data.from} in the chat ${data.chat}`,
    text: `New message from ${data.from} in the chat ${data.chat}`,
    html: `<div style="margin:1em; padding:1em; text-align:left; color:#e3e6e9; background:#1f2329; border-radius: 2.5em">
      <p>Dear ${data.user},</p><br />
      <p>You have the following message from ${data.from} in the chat ${data.chat}: </p>
      <div style="background:#2f343d"">
        ${data.message}
      </div>
        <div
        style="width:100%;display:flex;flex-direction:row;justify-content:space-around;align-items:center;border-radius: 2.5em">
        <button
          style="color:#e3e6e9;width:25vw;padding:0.25em;border:none;border-radius:0.25em;background: rgb(178, 34, 34, 1)">
          <a style="color:#e3e6e9;" href=${data.url}>Go to the Chat</a>
        </button>
      </div>
      <br /><p>kind of regrends</p><p>your Noerkel IT Support Team</p>
      <div style="height: 150px; textAlign: center;" }}>
        <img src="cid:logo" style=" margin-top: 0%; width:150px;heigth:150px;"/>
      </div></div>`,
  };

  const htmlType = () => {
    return new Promise((resolve, reject) => {
      if (type === "welcome") {
        resolve(welcome);
      } else if (type === "deletAccount") {
        resolve(deletAccount);
      } else if (type === "message") {
        resolve(message);
      }
    });
  };
  htmlType().then((value) => {
    console.log("[Email]Resolve", value);
    const mailOptions = {
      from: process.env.MAIL_NAME,
      to: email,
      subject: value.subject,
      text: value.text,
      html: value.html,
      attachments: [
        {
          filename: "logo.png",
          path: relativePath,
          cid: "logo",
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        Sentry.captureException(err);
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  });
};

module.exports = sendEmail;
