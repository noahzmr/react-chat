const express = require("express");
const router = express.Router();
const dbCon = require("../config/mariadbConnection");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
require("dotenv").config();
const SESSIONS = require("../config/session");
const sessionId = crypto.randomUUID();
const csrfToken = crypto.randomUUID();
const socketToken = crypto.randomUUID();
const Sentry = require("@sentry/node");
const sendEmail = require("../config/mail");

const reasonCreate = (reason) => {
  return new Promise((resolve, reject) => {
    if (reason === "tested enough") {
      console.log("tested enough");
      resolve(", since you are done with testing");
    } else if (reason === "I do not like") {
      console.log("I do not like");
      resolve(", because do not like the chat app.");
    } else if (reason === "better alternative found") {
      console.log("better alternative found");
      resolve(", since you have found a better alternative");
    } else {
      console.log("No reason selected");
      resolve("");
    }
  });
};
const hasAccess = (result, checkCredentials, user, session) => {
  return new Promise((resolve, reject) => {
    // Check if result is truthy
    if (result) {
      // Create an object containing user information
      const val = {
        name: checkCredentials.name,
        id: checkCredentials.id,
        email: user,
      };
      // Check if this is the user's first login
      if (checkCredentials.first_logon === 1) {
        console.log("[AUTH](Login) First Login", {
          csrfToken,
          message: `firstLogin`,
          otp: checkCredentials.user_otp,
        });
        resolve({
          csrfToken,
          message: `firstLogin`,
          otp: checkCredentials.user_otp,
        });
      } else {
        // Check if OTP is required
        console.log(
          `[AUTH](Login) OTP wanted ${
            checkCredentials.otpWanted === 1 ? "true" : "false"
          }`,
          checkCredentials
        );
        if (checkCredentials.otpWanted === 0) {
          // Check if user has an active session
          if (SESSIONS.has(session)) {
            console.log("Show User Session", SESSIONS.get(session));
            console.log("User already singin! Send the values");
            resolve({
              csrfToken,
              socketToken,
              user,
              val,
              message: `Already Sign In ${user}`,
            });
          } else {
            // Add user session to the SESSIONS object
            SESSIONS.set(sessionId, {
              user,
              socketToken,
              csrfToken,
            });
            console.log("[AUTH](Login) OTP not wanted", {
              csrfToken,
              val,
              socketToken,
              message: `Authend as ${user}`,
            });
            resolve({
              csrfToken,
              val,
              socketToken,
              message: `Authend as ${user}`,
            });
          }
        } else {
          // OTP is required
          console.log("[AUTH](Login) OTP wanted", {
            csrfToken,
            message: `otpCheck`,
          });
          resolve({
            csrfToken,
            message: `otpCheck`,
          });
        }
      }
    } else {
      // Result is falsy, access denied
      console.log("Access Denied!");
      reject("Access Denied!");
    }
  });
};

const checkCredentialsSQL = (user, password) => {
  return new Promise((resolve, reject) => {
    dbCon.query(
      "SELECT name, id, (SELECT first_logon FROM user_credentials WHERE user_id = users.id) AS first_logon, (SELECT wanted FROM user_otp WHERE user_id = users.id) AS otpWanted,(SELECT qrCode FROM user_otp WHERE user_id = users.id) AS user_otp, (SELECT password FROM user_credentials WHERE user_id = users.id) AS password FROM users WHERE email = ?;",
      user,
      (err, resu) => {
        if (err) {
          Sentry.captureException(err);
          console.log({ error: err.message });
          reject("SQL Error");
          return;
        }
        console.log("[AUTH](Login) Check Credentials Result:", resu[0]);
        const hash = resu[0].password.toString("utf-8");
        // compare hash and password
        bcrypt.compare(password, hash, (err, result) => {
          if (err) {
            Sentry.captureException(err);
            console.log({ error: err.message });
            reject({ message: "Unauthorized" });
            return;
          }
          resolve({ password: result, values: resu[0] });
        });
      }
    );
  });
};

// Route for user Registration
router.post("/signup", (req, res) => {
  // Destructure the request body to get the username, password and email
  const { userNameCo: username, password, email } = req.body;
  const uuid = crypto.randomUUID();
  // SQL queries
  const userOtp =
    "INSERT INTO user_otp (user_id, secret, qrCode, ascii) VALUES ((SELECT id FROM users WHERE email = ?), ?, ?, ?);";
  const createUser = "INSERT INTO users (name, email, verify) VALUES (?,?,?);";
  const defaultRoom =
    'INSERT INTO room_members (room_id, user_id) VALUES("5", ?),("1",?)';
  const credentials =
    "INSERT INTO user_credentials (user_id, password) VALUES (?,?);";

  // Create user and insert credentials into the database
  dbCon.query(createUser, [username, email, uuid], (err, result) => {
    if (err) return console.log({ error: err.message });
    dbCon.query(
      defaultRoom,
      [result.insertId, result.insertId],
      (err, result) => {
        if (err) {
          Sentry.captureException(err);
          if (err.message.includes("Duplicate entry")) {
            console.log("USER ALLREADY EXIST");
          }
          return console.log({ error: err.message });
        }
        console.log("[System](Chat)", result.insertId.toString());
      }
    );

    const userId = result.insertId;
    const saltRounds = 10;

    // Hash the password and insert into the database
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) {
        Sentry.captureException(err);
        return console.log({ error: err.message });
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          Sentry.captureException(err);
          return console.log({ error: err.message });
        }
        console.log(hash);
        dbCon.query(credentials, [userId, hash], (err, result) => {
          if (err) {
            Sentry.captureException(err);
            return console.log({ error: err.message });
          }

          // Generate and store OTP for the user
          const secret = speakeasy.generateSecret({
            issuer: "Noerkel IT",
            name: `${email}`,
          });
          console.log("secret", secret.otpauth_url);
          QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
            if (err) {
              Sentry.captureException(err);
              return console.log({ error: err.message });
            }
            console.log("Create OTP");
            dbCon.query(
              userOtp,
              [email, secret, dataUrl, secret.ascii],
              (err, result) => {
                if (err) {
                  Sentry.captureException(err);
                  return console.log({ error: err.message });
                }

                const mailData = {
                  username: username,
                  link: `https://demo.noerkelit.online:3001/login/${uuid}`,
                };
                sendEmail("welcome", email, mailData);
                console.log(result);
              }
            );
          });
        });
      });
    });
  });
});
router.get("/verify/:uuid", (req, res) => {
  const updateVerifySql = "UPDATE users SET verify = 1 WHERE verify = ?";
  const uuid = req.params.uuid;
  dbCon.query(updateVerifySql, [uuid], (err, resu) => {
    if (err) {
      Sentry.captureException(err);
      console.log({ error: err.message });
      reject("SQL Error");
      return;
    }
    console.log(resu, uuid);
    res.send("https://demo.noerkelit.online:3001/");
  });
});
router.post("/login", (req, res) => {
  const password = req.body.psw;
  const user = req.body.user;
  const session = req.cookies.sessionId;
  const verifiySql = "SELECT verify FROM users WHERE email = ?";

  if (user.length > 0 && password.length > 0) {
    if (user === null || user === undefined) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    } else {
      dbCon.query(verifiySql, [user], (err, result) => {
        if (err) {
          Sentry.captureException(err);
          console.log({ error: err.message });
          res.json({ message: err.message });
          return;
        }
        if (result[0].verify === "1") {
          console.log("New logon");
          checkCredentialsSQL(user, password)
            .then((valu) => {
              hasAccess(valu.password, valu.values, user, session)
                .then((value) => {
                  res
                    .cookie("sessionId", sessionId, {
                      secure: true,
                      httpOnly: true,
                      sameSite: true,
                    })
                    .json(value);
                })
                .catch((reason) => {
                  console.log("[AUTH](Login) Error", reason);
                  Sentry.captureException(err);
                  res.json(reason);
                });
            })
            .catch((reason) => {
              console.log("[AUTH](Login) Error", reason);
              Sentry.captureException(err);
              res.json({ message: reason });
            });
        } else {
          console.log("verify:", result[0]);
          res.json({ message: "verify" });
        }
      });
    }
  } else {
    console.log("Please enter user and passwort!");
  }
});

router.post("/token", (req, res) => {
  const username = req.body.username;
  const wanted = req.body.wanted;
  const token = req.body.token;
  const password = req.body.password;
  const session = req.cookies.sessionId;
  const updateSql0 =
    "UPDATE users INNER JOIN user_credentials ON user_credentials.user_id = users.id INNER JOIN user_otp ON user_otp.user_id = users.id SET user_otp.wanted = 0, user_otp.secret = (NULL), user_otp.qrCode = (NULL), user_otp.ascii = (NULL), user_credentials.first_logon = 0 WHERE  users.email =  ?;";

  const updateSql1 =
    "UPDATE users INNER JOIN user_credentials ON user_credentials.user_id = users.id INNER JOIN user_otp ON user_otp.user_id = users.id SET user_otp.wanted = 1, user_otp.secret = (NULL), user_otp.qrCode = (NULL), user_credentials.first_logon = 0 WHERE users.email =  ?;";

  const tokenValidaterSql =
    "SELECT id,name, (SELECT ascii FROM user_otp WHERE user_id = users.id) AS ascii, (SELECT first_logon FROM user_credentials WHERE user_id = users.id) AS first_logon FROM users WHERE email = ?;";

  if (wanted === "0") {
    dbCon.query(updateSql0, [username], (err, result) => {
      if (err) {
        Sentry.captureException(err);
        console.log({ error: err.message });
        return;
      }
      checkCredentialsSQL(username, password)
        .then((valu) => {
          hasAccess(valu.password, valu.values, username, session)
            .then((value) => {
              console.log("OPT CHECK VALUES IF NOT WANTED:", value);
              res
                .cookie("sessionId", sessionId, {
                  secure: true,
                  httpOnly: true,
                  sameSite: true,
                })
                .json({
                  csrfToken: value.csrfToken,
                  socketToken: value.socketToken,
                  username,
                  name: value.val.name,
                  id: value.val.id,
                  message: `Authend as ${username}`,
                });
            })
            .catch((reason) => {
              Sentry.captureException(err);
              res.json(reason);
            });
        })
        .catch((reason) => {
          Sentry.captureException(err);
          res.json({ message: reason });
        });
    });
  } else {
    dbCon.query(tokenValidaterSql, [username], (err, result) => {
      if (err) {
        Sentry.captureException(err);
        console.log("[AUTH](OTP) Get Token Error");
      }

      const tokenValidates = speakeasy.totp.verify({
        secret: result[0].ascii,
        encoding: "base32",
        token,
      });

      // If the user-provided token is valid, grant access
      if (tokenValidates === true) {
        if (result[0].first_logon) {
          dbCon.query(updateSql1, [username], (err, resu) => {
            if (err) {
              Sentry.captureException(err);
              console.log(err);
            }
          });
        }
        SESSIONS.set(sessionId, {
          username,
          socketToken,
          csrfToken,
        });
        const newVal = SESSIONS.get(sessionId);
        console.log(
          "[AUTH](OTP) Validate token",
          result[0],
          result[0].ascii,
          tokenValidates,
          token,
          newVal
        );
        res
          .cookie("sessionId", sessionId, {
            secure: true,
            httpOnly: true,
            sameSite: true,
          })
          .json({
            csrfToken,
            socketToken,
            username,
            name: result[0].name,
            id: result[0].id,
            message: `Authend as ${username}`,
          });
      } else {
        // If the user-provided token is invalid, deny access
        console.log("Access Denied!");
        res.send(false);
      }
    });
  }
});

router.post("/keycloak", (req, res) => {
  const email = req.body.email;
  const sigIn = "SELECT id, verify, keycloak FROM users WHERE email = ?";
  dbCon.query(sigIn, [email], (err, result) => {
    if (err) {
      Sentry.captureException(err);
      console.log({ error: err.message });
      return;
    }

    console.log(result);
    if (result.length === 0) {
      res.send({ msg: "signup" });
    } else {
      if (result[0].verify === "1") {
        if (result[0].id && result[0].keycloak === 0) {
          console.log("[Keycloak] user already exist!", result[0].id);
          res.send({ msg: "update" });
        }
        if (result[0].id && result[0].keycloak === 1) {
          SESSIONS.set(sessionId, {
            email,
            socketToken,
            csrfToken,
          });
          res.send({ msg: "login", id: result[0].id, socketToken, csrfToken });
          console.log("result", result[0]);
        }
      } else {
        res.send({ msg: "verify" });
        console.log("result", result[0]);
      }
    }
  });
});

router.put("/keycloak/:email", (req, res) => {
  const email = req.params.email;
  const name = req.body.name;

  dbCon.query(
    "UPDATE users set name = ?, keycloak = 1 WHERE email = ?",
    [name, email],
    (err, result) => {
      if (err) {
        Sentry.captureException(err);
        console.log({ error: err.message });
        return;
      }
      dbCon.query(
        "DELETE FROM user_credentials WHERE user_id = (SELECT id FROM users WHERE email = ?);",
        [email],
        (err, result) => {
          if (err) {
            Sentry.captureException(err);
            console.log({ error: err.message });
            return;
          }
          dbCon.query(
            "DELETE FROM user_otp WHERE user_id = (SELECT id FROM users WHERE email = ?)",
            [email],
            (err, result) => {
              if (err) {
                Sentry.captureException(err);
                console.log({ error: err.message });
                return;
              }
              dbCon.query(
                "SELECT id, name FROM users WHERE email = ?",
                [email],
                (err, result) => {
                  if (err) {
                    Sentry.captureException(err);
                    console.log({ error: err.message });
                    return;
                  }

                  SESSIONS.set(sessionId, {
                    result,
                    socketToken,
                    csrfToken,
                  });
                  res.send({
                    msg: "succses",
                    id: result[0].id,
                    name: result[0].name,
                    socketToken,
                    csrfToken,
                  });
                  console.log(result);
                }
              );
            }
          );
        }
      );
    }
  );
});
router.post("/keycloak/signup", (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const uuid = crypto.randomUUID();
  const defaultRoom =
    'INSERT INTO room_members (room_id, user_id) VALUES ("5",?)';
  const sql =
    "INSERT INTO users (name, email, verify, keycloak) VALUES (?,?,?,1);";
  dbCon.query(sql, [name, email, uuid], (err, result) => {
    if (err) {
      Sentry.captureException(err);
      if (err.message.includes("Duplicate entry")) {
        console.log("USER ALLREADY EXIST");
      }
      console.log({ error: err.message, parameter1: name, parameter2: email });
      return;
    }
    const mailData = {
      username: name,
      link: `https://demo.noerkelit.online:3001/login/${uuid}`,
    };
    sendEmail("welcome", email, mailData);

    SESSIONS.set(sessionId, {
      email,
      socketToken,
      csrfToken,
    });
    console.log(result.insertId);
    res.send({ id: parseInt(result.insertId), csrfToken, socketToken });
    dbCon.query(defaultRoom, [parseInt(result.insertId)], (err, result) => {
      if (err) {
        Sentry.captureException(err);
        console.log({
          error: err.message,
        });
        return;
      }
      console.log("Joinded default room");
    });
  });
});

router.post("/delete", (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const name = req.body.name;
  const reason = req.body.reason;
  const uuid = crypto.randomUUID();
  const url = `https://demo.noerkelit.online:3000/auth/delete/${uuid}`;
  const deleteSQL =
    "INSERT INTO delete_user (user_id, url, uuid) VALUES (?,?,?)";
  const updateSQL = "UPDATE delete_user SET url=?, uuid = ? WHERE user_id = ?";
  reasonCreate(reason)
    .then((value) => {
      dbCon.query(deleteSQL, [id, url, uuid], (err, result) => {
        const mailData = {
          username: name,
          reason: value,
          link: url,
        };
        if (err) {
          Sentry.captureException(err);
          console.log({ error: err.message });
          if (err.message.includes("Duplicate entry"))
            res.send("already was tryng");
          dbCon.query(updateSQL, [url, uuid, id], (err, result) => {
            if (err) {
              Sentry.captureException(err);
              console.log({ error: err.message });
              res.send("error");
              return;
            }
            console.log(result);
            sendEmail("deletAccount", email, mailData);
          });
          return;
        }
        console.log("[DELETE} (EMAIL)", result);
        res.send("delete User");
        sendEmail("deletAccount", email, mailData);
      });
    })
    .catch((reason) => {
      console.log(reason);
    });
});
router.get("/delete/:uuid/:condition", (req, res) => {
  const deleteStatment =
    "DELETE FROM users WHERE id = (SELECT user_id FROM delete_user WHERE uuid = ?)";
  const cancleStatment = "DELETE FROM delete_user WHERE uuid = ?";
  const user = req.params.uuid;
  const condition = req.params.condition;
  console.log("[DELTE STATMENT]", req.params, user, condition);
  if (condition === "true") {
    dbCon.query(deleteStatment, [user], (err, result) => {
      if (err) {
        Sentry.captureException(err);
        console.log({ error: err.message });
        res.send("500");
        return;
      } else {
        console.log("[DELETE USER]", result);
        res.send("[DELETE USER] 200");
      }
    });
  } else {
    dbCon.query(cancleStatment, [user], (err, result) => {
      if (err) {
        Sentry.captureException(err);
        console.log({ error: err.message });
        res.send("500");
        return;
      } else {
        console.log("[DELETE USER] NOT", result);
        res.send("Cancle Delete 200");
      }
    });
  }
});
module.exports = router;
