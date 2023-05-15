const express = require("express");
const router = express.Router();
const dbCon = require("../config/mariadbConnection");
const minioClient = require("../config/minio");
const Buffer = require("buffer").Buffer;
const Sentry = require("@sentry/node");

// Load all Group Chat Rooms
router.get("/:userID", (req, res, next) => {
  const sql =
    "SELECT id FROM rooms WHERE is_group = 1 AND id IN (SELECT room_id FROM room_members WHERE user_id = ?)";
  const chatName =
    "SELECT id, is_group, name, (SELECT COUNT(*) FROM message_status WHERE message_id IN (SELECT id FROM room_messages WHERE room_id = ?) AND was_read = 0 AND user_id = ?) AS unreadMSG FROM rooms WHERE id= ? AND is_group = 1";
  dbCon.query(sql, [req.params.userID], (err, json) => {
    if (err) {
      Sentry.captureException(err);
      res.status(500).json({ error: err.message });
      return;
    }
    const groupRooms = [];
    if (json.length !== 0) {
      console.log(
        `[CHAT ROOMS] Group Rooms from ${req.params.userID} are: `,
        json
      );
      const itemLength = json.length;
      json.forEach((item) => {
        console.log(
          `[CHAT ROOMS] Get Name for the Chat: ${item.id}, Values: ${item}`
        );
        dbCon.query(
          chatName,
          [item.id, req.params.userID, item.id],
          (err, json) => {
            if (err) {
              Sentry.captureException(err);
              res.status(500).json({ error: err.message });
              return;
            }
            groupRooms.push({
              id: json[0].id,
              is_group: json[0].is_group,
              name: json[0].name,
              unreadMSG: json[0].unreadMSG.toString(),
            });
            if (groupRooms.length === itemLength) {
              console.log("[CHAT ROOMS] Send Group Rooms", groupRooms);
              res.send(groupRooms);
            } else {
              console.log(
                `[CHAT ROOMS] Group Rooms length: ${groupRooms.length}  itemLength:${itemLength}`
              );
              console.log(groupRooms);
            }
          }
        );
      });
    } else {
      console.log(`[CHAT ROOMS] ${req.params.userID} is in no Private Chat: `);
      res.json(json);
    }
  });
});
router.get("/:userID/createDm", (req, res, next) => {
  const sql =
    "SELECT * FROM users WHERE NOT id = ? AND NOT id IN (SELECT user_id FROM room_members WHERE room_id IN (SELECT id FROM rooms WHERE is_group = 0));";
  dbCon.query(sql, [req.params.userID], (err, json) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    console.log("[MESSAGES] result.data from groupChat", json);
    res.json(json);
  });
});
router.get("/:userID/createGroup/:groupId", (req, res, next) => {
  const sql =
    "SELECT * FROM users WHERE NOT id = ? AND NOT id IN (SELECT user_id FROM room_members WHERE room_id = ?);";
  dbCon.query(sql, [req.params.userID, req.params.groupId], (err, json) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    console.log("[MESSAGES] result.data from groupChat", json);
    res.json(json);
  });
});
// Load all Private Chat Rooms
router.get("/private/:userID", (req, res, next) => {
  const sql =
    "SELECT id FROM rooms WHERE is_group = 0 AND id IN (SELECT room_id FROM room_members WHERE user_id = ?)";
  const chatName = ```SELECT id, is_group,
    (SELECT name FROM statu WHERE id = (SELECT status FROM users WHERE id = (SELECT user_id FROM room_members WHERE room_id = rooms.id AND NOT user_id = ?))) AS statu, 
    (SELECT name FROM users WHERE id IN (SELECT user_id FROM room_members WHERE room_id = rooms.id) AND NOT id = ?)AS NAME, 
    (SELECT email FROM users WHERE id IN (SELECT user_id FROM room_members WHERE room_id = rooms.id) AND NOT id = ?)AS NAME,
    (SELECT COUNT(*) FROM message_status WHERE message_id IN (SELECT id FROM room_messages WHERE room_id = rooms.id) AND was_read = 0 AND user_id = ?) AS unreadMSG 
    FROM rooms WHERE id= ? AND is_group = 0;```;
  dbCon.query(sql, [req.params.userID], (err, json) => {
    const privateRooms = [];
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (json.length !== 0) {
      console.log(
        `[CHAT ROOMS] Private Rooms from ${req.params.userID} are: `,
        json
      );
      const itemLength = json.length;
      json.forEach((item) => {
        console.log(`[CHAT ROOMS] Get Name for the Chat: ${item.id}`);
        dbCon.query(
          chatName,
          [
            req.params.userID,
            req.params.userID,
            req.params.userID,
            req.params.userID,
            item.id,
          ],
          (err, json) => {
            if (err) {
              Sentry.captureException(err);
              res.status(500).json({ error: err.message });
              return;
            }
            console.log(`[CHAT ROOMS] Name for ${item.id}: ${json[0].name}`);
            privateRooms.push({
              id: json[0].id,
              is_group: json[0].is_group,
              name: json[0].NAME,
              unreadMSG: json[0].unreadMSG.toString(),
              status: json[0].status,
            });
            if (privateRooms.length === itemLength) {
              console.log("[CHAT ROOMS] Send Private Rooms", privateRooms);
              res.send(privateRooms);
            } else {
              console.log(
                `[CHAT ROOMS] privateRooms.length: ${privateRooms.length}  itemLength:${itemLength}`
              );
              console.log(privateRooms);
            }
          }
        );
      });
    } else {
      console.log(`[CHAT ROOMS] ${req.params.userID} is in no Private Chat: `);
      res.json(json);
    }
  });
});

router.get("/chats/:userID/:sort", (req, res, next) => {
  console.log("SORT", req.params.sort);

  if (req.params.sort === "byName") {
    const sql =
      "SELECT id, name, is_group, picture, (SELECT CONVERT(COUNT(was_read) USING utf8) FROM message_status WHERE was_read = 0 AND message_id IN (SELECT id FROM room_messages WHERE room_id = rooms.id) AND NOT user_id = ?) AS wasRead, (SELECT MAX(send_at) FROM room_messages WHERE room_id = rooms.id) AS LastMsgTime, (SELECT chat_message FROM room_messages WHERE send_at = LastMsgTime) AS LastMsg, (SELECT user_id FROM room_messages WHERE send_at = LastMsgTime) AS LastMsgUser, (SELECT email FROM users WHERE id = LastMsgUser) AS LastMsgUserEmail, (SELECT name FROM users WHERE id = LastMsgUser) AS LastMsgUserName, (SELECT name FROM statu WHERE id = (SELECT STATUS FROM users WHERE id = (SELECT user_id FROM room_members WHERE NOT user_id=? AND room_id = rooms.id)) AND is_group = 0) AS statusName, (SELECT color FROM statu WHERE id = (SELECT STATUS FROM users WHERE id = (SELECT user_id FROM room_members WHERE NOT user_id=? AND room_id = rooms.id)) AND is_group = 0) AS statusColor, (SELECT name FROM users WHERE id = (SELECT user_id FROM room_members WHERE NOT user_id=? AND room_id = rooms.id) AND is_group = 0) AS namePrivat, (SELECT email FROM users WHERE id = (SELECT user_id FROM room_members WHERE NOT user_id=? AND room_id = rooms.id) AND is_group = 0) AS email, (SELECT id FROM users WHERE id = (SELECT user_id FROM room_members WHERE NOT user_id=? AND room_id = rooms.id) AND is_group = 0) AS idPrivat FROM rooms WHERE id IN (SELECT room_id FROM room_members WHERE user_id = ?) ORDER BY namePrivat, name ASC;";
    dbCon.query(
      sql,
      [
        req.params.userID,
        req.params.userID,
        req.params.userID,
        req.params.userID,
        req.params.userID,
        req.params.userID,
        req.params.userID,
      ],
      (err, result) => {
        if (err) {
          res.status(500).send({ error: err.message });
          return;
        } else {
          console.log(
            `[CHAT ROOMS] ${req.params.userID} is in no Private Chat: `,
            result
          );
          res.send(result);
        }
      }
    );
  } else if (req.params.sort === "byTime") {
    const sql =
      "SELECT id, name, is_group, picture, (SELECT CONVERT(COUNT(was_read) USING utf8) FROM message_status WHERE was_read = 0 AND message_id IN (SELECT id FROM room_messages WHERE room_id = rooms.id) AND NOT user_id = ?) AS wasRead, (SELECT MAX(send_at) FROM room_messages WHERE room_id = rooms.id) AS LastMsgTime, (SELECT chat_message FROM room_messages WHERE send_at = LastMsgTime) AS LastMsg, (SELECT user_id FROM room_messages WHERE send_at = LastMsgTime) AS LastMsgUser, (SELECT name FROM users WHERE id = LastMsgUser) AS LastMsgUserName, (SELECT email FROM users WHERE id = LastMsgUser) AS LastMsgUserEmail, (SELECT name FROM statu WHERE id = (SELECT STATUS FROM users WHERE id = (SELECT user_id FROM room_members WHERE NOT user_id=? AND room_id = rooms.id)) AND is_group = 0) AS statusName, (SELECT color FROM statu WHERE id = (SELECT STATUS FROM users WHERE id = (SELECT user_id FROM room_members WHERE NOT user_id=? AND room_id = rooms.id)) AND is_group = 0) AS statusColor, (SELECT email FROM users WHERE id = (SELECT user_id FROM room_members WHERE NOT user_id=? AND room_id = rooms.id) AND is_group = 0) AS email, (SELECT name FROM users WHERE id = (SELECT user_id FROM room_members WHERE NOT user_id=? AND room_id = rooms.id) AND is_group = 0) AS namePrivat, (SELECT id FROM users WHERE id = (SELECT user_id FROM room_members WHERE NOT user_id=? AND room_id = rooms.id) AND is_group = 0) AS idPrivat FROM rooms WHERE id IN (SELECT room_id FROM room_members WHERE user_id = ?) ORDER BY LastMsgTime DESC;";
    dbCon.query(
      sql,
      [
        req.params.userID,
        req.params.userID,
        req.params.userID,
        req.params.userID,
        req.params.userID,
        req.params.userID,
        req.params.userID,
      ],
      (err, result) => {
        if (err) {
          res.status(500).send({ error: err.message });
          return;
        } else {
          console.log(
            `[CHAT ROOMS] ${req.params.userID} is in no Private Chat: `,
            result
          );
          res.send(result);
        }
      }
    );
  } else if (req.params.sort === "byRead") {
    const sql =
      "SELECT id, name, is_group, picture, (SELECT CONVERT(COUNT(was_read) USING utf8) FROM message_status WHERE was_read = 0 AND message_id IN (SELECT id FROM room_messages WHERE room_id = rooms.id) AND NOT user_id = ?) AS wasRead, (SELECT MAX(send_at) FROM room_messages WHERE room_id = rooms.id) AS LastMsgTime, (SELECT chat_message FROM room_messages WHERE send_at = LastMsgTime) AS LastMsg, (SELECT user_id FROM room_messages WHERE send_at = LastMsgTime) AS LastMsgUser, (SELECT name FROM users WHERE id = LastMsgUser) AS LastMsgUserName, (SELECT email FROM users WHERE id = LastMsgUser) AS LastMsgUserEmail, (SELECT name FROM statu WHERE id = (SELECT STATUS FROM users WHERE id = (SELECT user_id FROM room_members WHERE NOT user_id=? AND room_id = rooms.id)) AND is_group = 0) AS statusName, (SELECT color FROM statu WHERE id = (SELECT STATUS FROM users WHERE id = (SELECT user_id FROM room_members WHERE NOT user_id=? AND room_id = rooms.id)) AND is_group = 0) AS statusColor, (SELECT name FROM users WHERE id = (SELECT user_id FROM room_members WHERE NOT user_id=? AND room_id = rooms.id) AND is_group = 0) AS namePrivat, (SELECT email FROM users WHERE id = (SELECT user_id FROM room_members WHERE NOT user_id=? AND room_id = rooms.id) AND is_group = 0) AS email, (SELECT id FROM users WHERE id = (SELECT user_id FROM room_members WHERE NOT user_id=? AND room_id = rooms.id) AND is_group = 0) AS idPrivat FROM rooms WHERE id IN (SELECT room_id FROM room_members WHERE user_id = ?) ORDER BY wasRead,LastMsgTime DESC;";

    dbCon.query(
      sql,
      [
        req.params.userID,
        req.params.userID,
        req.params.userID,
        req.params.userID,
        req.params.userID,
        req.params.userID,
        req.params.userID,
      ],
      (err, result) => {
        if (err) {
          res.status(500).send({ error: err.message });
          return;
        } else {
          console.log(
            `[CHAT ROOMS] ${req.params.userID} is in no Private Chat: `,
            result
          );
          res.send(result);
        }
      }
    );
  } else {
    dbCon.query(
      sql,
      [
        req.params.userID,
        req.params.userID,
        req.params.userID,
        req.params.userID,
        req.params.userID,
        req.params.userID,
      ],
      (err, result) => {
        if (err) {
          res.status(500).send({ error: err.message });
          return;
        } else {
          console.log(
            `[CHAT ROOMS] ${req.params.userID} is in no Private Chat: `,
            result
          );
          res.send(result);
        }
      }
    );
  }
});
router.get("/members/:chatId", (req, res, next) => {
  dbCon.query(
    "SELECT * FROM users WHERE id IN (SELECT user_id FROM room_members WHERE room_id = ?)",
    [req.params.chatId],
    (err, json) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(
        `[CHAT ROOMS] Members of the Room ${req.params.chatId}: ${json}`
      );
      res.json(json);
    }
  );
});
router.get("/notMembers/:chatId", (req, res, next) => {
  dbCon.query(
    "SELECT id, name FROM users WHERE id NOT IN (SELECT user_id FROM room_members WHERE room_id = ?)",
    [req.params.chatId],
    (err, json) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(
        `[CHAT ROOMS] Members of the Room ${req.params.chatId}: ${json}`
      );
      res.json(json);
    }
  );
});
router.get("/messages/:chatId", (req, res, next) => {
  dbCon.query(
    "SELECT id, user_id, room_id, send_at, chat_message, file, (SELECT name FROM users WHERE id = user_id) AS name FROM room_messages WHERE room_id = ?",
    [req.params.chatId],
    (err, json) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(
        `[MESSAGES] Message of the Room ${req.params.chatId}: ${json}`
      );
      res.json(json);
    }
  );
});
router.get("/groupChat/:chatId", (req, res, next) => {
  dbCon.query(
    "SELECT is_group FROM rooms WHERE id = ?",
    [req.params.chatId],
    (err, json) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(
        "[MESSAGES] result.data from groupChat",
        json[0],
        req.params.chatId
      );
      if (json[0] === undefined) {
        res.send("No chat founded!");
      } else {
        res.json(json[0].is_group);
      }
    }
  );
});
router.get("/openMessages/:userId", (req, res, next) => {
  dbCon.query(
    "SELECT * FROM message_status WHERE user_id = ?",
    [req.params.userId],
    (err, json) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(
        `[MESSAGES] The user ${req.params.userId} have ${json.length} open messages`
      );
      res.json(json);
    }
  );
});
router.get("/readed/:messageId", (req, res, next) => {
  dbCon.query(
    "SELECT users.id, users.name, message_status.was_read, message_status.id AS msgId FROM users RIGHT JOIN message_status ON users.id = message_status.user_id WHERE users.id IN (SELECT user_id FROM message_status WHERE message_id = ?) AND message_status.message_id = ?;",
    [req.params.messageId, req.params.messageId],
    (err, json) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(
        `[MESSAGES] The message ${req.params.userId} was readed by ${json}`
      );
      res.json(json);
    }
  );
});
router.get("/downloadFile/:id", (req, res, next) => {
  dbCon.query(
    "SELECT real_name,display_name FROM room_messages_files WHERE id = (SELECT file FROM room_messages WHERE id = ?);",
    [req.params.id],
    (err, json) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(
        `[MESSAGES] The file form message ${req.params.id} have following attributes: ${json[0].real_name}`
      );

      async function call() {
        const promise = new Promise((resolve, reject) => {
          const buff = [];
          let size = 0;
          minioClient
            .getObject("chat", json[0].real_name)
            .then((dataStream) => {
              dataStream.on("data", (chunk) => {
                buff.push(chunk);
                size += chunk.length;
              });
              dataStream.on("end", () => {
                console.log("[System](MinIO) End. Total size = " + size);
                // console.log("[System](MinIO) End Buffer : " + buff)
                const newBuffer = Buffer.concat(buff);
                resolve(newBuffer);
              });
              dataStream.on("error", (err) => {
                console.log("[System](MinIO) error: ", err);
                reject(err);
              });
            })
            .catch(reject);
        });
        return promise;
      }

      async function getData() {
        const data = await call()
          .then((data) => {
            console.log("[MinIO]", {
              file: data,
              name: json[0].display_name,
            });
            res.send({
              file: data,
              real_name: json[0].real_name,
              name: json[0].display_name,
            });
          })
          .catch((err) => {
            if (err) {
              console.log(err.message);
            }
          });
        data();
      }
      getData();
    }
  );
});
router.get("/downloadFileData/:id", (req, res, next) => {
  dbCon.query(
    "SELECT display_name FROM room_messages_files WHERE id = (SELECT file FROM room_messages WHERE id = ?);",
    [req.params.id],
    (err, json) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(
        `[MESSAGES] The file form message ${req.params.id} have following Name: ${json[0]}`
      );
      res.send(json[0].display_name);
    }
  );
});
router.get("/message/:id/image", (req, res, next) => {
  const sql = "SELECT * FROM room_messages_files WHERE msg_id = ?";

  console.log(`get file values from ${req.params.id}...`);
  dbCon.query(sql, [req.params.id], (err, json) => {
    if (err) {
      res.status(500).json({ error: err.message });
      console.log(err);
      return;
    }
    console.log("get file", json);

    console.log("PICTURE", json[0].real_name);
    async function call() {
      const promise = new Promise((resolve, reject) => {
        const buff = [];
        let size = 0;
        minioClient
          .getObject("chat", json[0].real_name)
          .then((dataStream) => {
            dataStream.on("data", (chunk) => {
              buff.push(chunk);
              size += chunk.length;
            });
            dataStream.on("end", () => {
              console.log("[System](MinIO) End. Total size = " + size);
              // console.log("[System](MinIO) End Buffer : " + buff)
              const newBuffer = Buffer.concat(buff);
              resolve(newBuffer);
            });
            dataStream.on("error", (err) => {
              console.log("[System](MinIO) error: ", err);
              reject(err);
            });
          })
          .catch((reject) => {
            return reject;
          });
      });

      return promise;
    }
    /* eslint-disable new-cap */

    async function getData() {
      const data = await call().then((data) => {
        console.log(
          `[System](Message) Get File from Message: ${req.params.id}: `
        );
        res.setHeader("Content-Type", json[0].content_type);
        res.send(new Buffer.from(data));
      });
      data();
    }
    getData();
  });
});
router.get("/name/:id/:userID", (req, res, next) => {
  const sql = "SELECT name FROM rooms WHERE id = ? AND is_group = 1";

  console.log(
    `[ROOM](CHAT NAME) get chat Name values from ${req.params.id}...`
  );
  dbCon.query(sql, [req.params.id], (err, json) => {
    if (err) {
      res.status(500).json({ error: err.message });
      console.log(err);
      return;
    }
    if (json[0]) {
      console.log(json[0].name);
      res.send(json[0].name);
    } else {
      const sql =
        "SELECT name FROM users WHERE id = (SELECT user_id FROM room_members WHERE room_id = ? AND NOT user_id = ?)";
      dbCon.query(sql, [req.params.id, req.params.userID], (err, json) => {
        if (err) {
          Sentry.captureException(err);
          res.status(500).json({ error: err.message });
          console.log(err);
          return;
        }
        if (json[0]) {
          console.log(json[0].name);
          res.send(json[0].name);
        } else {
          const sql = "SELECT name FROM rooms WHERE id = ? AND is_group = 1";
          console.log("No chat selected!");
          res.send("No chat selected!");
        }
      });
    }
  });
});
/* eslint-enable new-cap */

// Create new Chat
router.post("/", (req, res) => {
  // Value to be inserted
  const user = req.body.user;
  const creater = req.body.creater;
  const group = req.body.group;

  dbCon.query(
    "INSERT INTO rooms (is_group) VALUES (?);",
    [group],
    (err, result) => {
      if (err) {
        console.log({ error: err.message });
        return;
      }
      res.send(result.insertId.toString());
      dbCon.query(
        "INSERT INTO room_members (room_id, user_id) VALUES (?,?);",
        [result.insertId, user],
        (err, result) => {
          if (err) {
            console.log({ error: err.message });
          }
        }
      );
      dbCon.query(
        "INSERT INTO room_members (room_id, user_id) VALUES (?,?);",
        [result.insertId, creater],
        (err, result) => {
          if (err) {
            console.log({ error: err.message });
            return;
          }
          console.log("[MESSAGES]", result);
        }
      );
    }
  );
});
router.post("/message", (req, res) => {
  // Value to be inserted
  const message = req.body.message;
  const user = req.body.user;
  const room = req.body.room;
  const sentAt = req.body.sentAt;

  dbCon.query(
    "INSERT INTO room_messages (user_id, room_id, send_at, chat_message) VALUES (?,?,?,?);",
    [user, room, sentAt, message],
    (err, result) => {
      if (err) {
        console.log({ error: err.message });
        return;
      }
      console.log(
        `[MESSAGES] Created new Message with the id: ${result.insertId.toString()}`
      );
      const messageId = result.insertId.toString();
      dbCon.query(
        "SELECT user_id FROM room_members WHERE room_id = ? AND NOT user_id = ?",
        [room, user],
        (err, result) => {
          if (err) {
            console.log({ error: err.message });
            return;
          }
          console.log(
            `[MESSGAES] ${result.length} users were found who received the message`
          );
          result.forEach((item) => {
            dbCon.query(
              "INSERT INTO message_status (message_id, user_id, was_read) VALUES (?,?,?);",
              [messageId, item.user_id, 0],
              (err, result) => {
                if (err) {
                  console.log({ error: err.message });
                  return;
                }
                console.log(
                  `[MESSAGES] status was set for the user ${item.user_id} in the for the message ${messageId}`,
                  result
                );
              }
            );
          });
        }
      );
      res.send(result.insertId.toString());
    }
  );
});
router.post("/image/:msgId/:userID", (req, res, next) => {
  console.log({ files: req.files.file, params: req.params });
  if (req.files === null) {
    return res.status(400).json({ msg: "No file uploaded!" });
  }
  const file = req.files.file;
  const sql =
    "INSERT INTO room_messages_files (display_name,real_name, user_id, content_type, msg_id) VALUES(?, ?, ?, ?, ?);";

  console.log(file.mimetype.split("/")[1]);

  minioClient.putObject(
    "chat",
    `${req.params.msgId}_picture_${req.params.userID}.${
      file.mimetype.split("/")[1]
    }`,
    file.data,
    (error, etag) => {
      if (error) {
        Sentry.captureException(err);
        return console.log(error);
      }
      console.log(etag);
      dbCon.query(
        sql,
        [
          file.name,
          `${req.params.msgId}_picture_${req.params.userID}.${
            file.mimetype.split("/")[1]
          }`,
          req.params.userID,
          file.mimetype,
          req.params.msgId,
        ],
        (err, result) => {
          if (err) {
            Sentry.captureException(err);
            res.status(500).json({ error: err.message });
            console.log(err);
            return;
          }
          console.log(result);
          dbCon.query(
            "UPDATE room_messages SET file =? WHERE id = ?",
            [result.insertId.toString(), req.params.msgId],
            (err, result) => {
              if (err) {
                Sentry.captureException(err);
                res.status(500).json({ error: err.message });
                console.log(err);
                return;
              }
              console.log("Finish send Picture");
            }
          );
          res.send(result.insertId.toString());
        }
      );
    }
  );
});
router.post("/createGroup", (req, res) => {
  // Value to be inserted
  const name = req.body.name;
  const isGroup = req.body.isGroup;

  dbCon.query(
    "INSERT INTO rooms (name, is_group) VALUES (?,?);",
    [name, isGroup],
    (err, result) => {
      if (err) {
        console.log({ error: err.message });
        return;
      }
      dbCon.query(
        "INSERT INTO room_members (room_id, user_id) VALUES (?,?)",
        [result.insertId, req.body.creator],
        (err, result) => {
          if (err) {
            console.log({ error: err.message });
            return;
          }
          console.log("[Chatroom]", result);
        }
      );
      console.log("[USERS] ", result);
      res.send(result.insertId.toString());
    }
  );
});
router.post("/addMember", (req, res) => {
  // Value to be inserted
  const groupId = req.body.groupId;
  const userId = req.body.userId;

  dbCon.query(
    "INSERT INTO room_members (room_id, user_id) VALUES (?,?);",
    [groupId, userId],
    (err, result) => {
      if (err) {
        console.log({ error: err.message });
        return;
      }
      console.log("[USERS] ", result);
      res.send(result.insertId.toString());
    }
  );
});

// Remove Members
router.post("/removeMember", (req, res, next) => {
  const chat = req.body.chat;
  const member = req.body.member;

  dbCon.query(
    "DELETE FROM room_members WHERE room_id = ? AND user_id = ?",
    [chat, member],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.send(result.insertId.toString());
    }
  );
});

// Update
router.post("/updateReadMsg", (req, res) => {
  // Value to be inserted
  const chatId = req.body.chatId;
  const userId = req.body.userId;
  dbCon.query(
    "UPDATE message_status SET was_read = 1 WHERE user_id = ? AND message_id IN (SELECT id FROM room_messages WHERE room_id=?);",
    [userId, chatId],
    (err, result) => {
      if (err) {
        console.log({ error: err.message });
        return;
      }
      console.log("[MESSAGE] Readed Message");
      res.send(result.insertId.toString());
    }
  );
});
router.get("/attributes/:chatId", (req, res) => {
  // Value to be inserted
  const chatId = req.params.chatId;
  dbCon.query("SELECT * FROM rooms WHERE id = ?;", [chatId], (err, result) => {
    if (err) {
      console.log({ error: err.message });
      return;
    }
    console.log("[MESSAGE] Get Room Attributes", result[0]);
    res.send(result[0]);
  });
});

router.post("/:chatId/picture", (req, res, next) => {
  console.log({ files: req.files.file, params: req.params });
  if (req.files === null) {
    return res.status(400).json({ msg: "No file uploaded!" });
  }
  const file = req.files.file;
  const sql = "UPDATE rooms SET picture = ? WHERE id = ?;";
  const sqlPicture =
    "INSERT INTO chat_pictures (filename,content_type,chat_id) VALUES (?,?,?);";
  const sqlCheck =
    "SELECT COUNT(id) AS counter FROM chat_pictures WHERE chat_id = ?;";
  const sqlUpdate =
    "UPDATE chat_pictures SET content_type = ? WHERE chat_id = ?; ";

  console.log(file.mimetype.split("/")[1]);

  minioClient.putObject(
    "chat",
    `chat_${req.params.chatId}_picture.${file.mimetype.split("/")[1]}`,
    file.data,
    (error, etag) => {
      if (error) {
        Sentry.captureException(err);
        return console.log(error);
      }
      console.log(etag);
      dbCon.query(sqlCheck, [req.params.chatId], (err, result) => {
        if (err) {
          Sentry.captureException(err);
          res.status(500).json({ error: err.message });
          console.log(err);
          return;
        }
        console.log(result[0].counter);
        if (result[0].counter === 1n) {
          console.log("System](CHAT) Update Room Picture...");
          dbCon.query(
            sqlUpdate,
            [file.mimetype, req.params.chatId],
            (err, result) => {
              if (err) {
                Sentry.captureException(err);
                res.status(500).json({ error: err.message });
                console.log(err);
                return;
              }
              res.send(result.insertId.toString());
            }
          );
        }
        if (result[0].counter === 0n) {
          console.log("System](CHAT) Set first Room Picture...");
          dbCon.query(
            sqlPicture,
            [
              `chat_${req.params.chatId}_picture.${
                file.mimetype.split("/")[1]
              }`,
              file.mimetype,
              req.params.chatId,
            ],
            (err, result) => {
              if (err) {
                Sentry.captureException(err);
                res.status(500).json({ error: err.message });
                console.log(err);
                return;
              }
              dbCon.query(
                sql,
                [result.insertId.toString(), req.params.chatId],
                (err, result) => {
                  if (err) {
                    Sentry.captureException(err);
                    res.status(500).json({ error: err.message });
                    console.log(err);
                    return;
                  }
                  res.send(result.insertId.toString());
                }
              );
              console.log(
                `[System](CHAT) Update the Picture where id ${req.params.chatId}: `,
                result.insertId
              );
            }
          );
        }
      });
    }
  );
});

router.get("/picture/:chatId", (req, res, next) => {
  const sql =
    "SELECT * FROM chat_pictures WHERE id = (SELECT picture FROM rooms WHERE id = ?)";

  dbCon.query(sql, [req.params.chatId], (err, json) => {
    if (err) {
      res.status(500).json({ error: err.message });
      console.log(err);
      return;
    }
    console.log("PICTURE", json);
    if (json.length === 0) {
      console.log("User have no Profilepicture!");
      res.send("User have no Profilepicture!");
      return;
    }
    async function call() {
      const promise = new Promise((resolve, reject) => {
        const buff = [];
        let size = 0;
        minioClient
          .getObject("chat", json[0].filename)
          .then((dataStream) => {
            dataStream.on("data", (chunk) => {
              buff.push(chunk);
              size += chunk.length;
            });
            dataStream.on("end", () => {
              console.log("[System](MinIO) End. Total size = " + size);
              //     console.log("[System](MinIO) End Buffer : " + buff)
              const newBuffer = Buffer.concat(buff);
              resolve(newBuffer);
            });
            dataStream.on("error", (err) => {
              console.log("[System](MinIO) error: ", err);
              reject(err);
            });
          })
          .catch((reject) => {
            return reject;
          });
      });

      return promise;
    }
    async function getData() {
      /* eslint-disable new-cap */
      const data = async () =>
        await call().then((data) => {
          dbCon.query(sql, [req.params.chatId], (err, result) => {
            if (err) {
              Sentry.captureException(err);
              res.status(500).json({ error: err.message });
              console.log(err);
              return;
            }

            console.log(
              `[System](User) Get User Profile from the id ${req.params.chatId}: `
            );
            res.setHeader("Content-Type", json[0].content_type);
            res.send(new Buffer.from(data));
          });
        });
      data();
    }

    getData();
  });
});

router.put("/setCall", (req, res, next) => {
  console.log("IS USER IN A CALL?", req.body.call);
  const sql =
    "UPDATE room_members SET in_call = 1 WHERE user_id = ? AND room_id = ?;";
  const sql2 = "UPDATE room_members SET in_call = 0 WHERE user_id = ?;";
  if (req.body.call === 1) {
    dbCon.query(sql, [req.body.user, req.body.room], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
        return;
      }
      console.log(
        `[System](User) Update the Status where id ${req.body.user}: `,
        result.insertId
      );
      res.send(result.insertId.toString());
    });
  } else {
    dbCon.query(sql2, [req.body.user], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
        return;
      }
      console.log(
        `[System](User) Update the Status where id ${req.body.user}: `,
        result.insertId
      );
      res.send(result.insertId.toString());
    });
  }
});

router.get("/call/:roomId/:userID", (req, res, next) => {
  let room = req.params.roomId;
  let user = req.params.userID;
  const sql =
    "SELECT peer_id AS peer_id FROM users WHERE id IN (SELECT user_id FROM room_members WHERE room_id = ?) AND NOT id = ?";
  dbCon.query(sql, [room, user], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      console.log(err);
      return;
    }
    console.log(
      `[System](Call) get peers from the room ${room}: `,
      result.insertId
    );
    res.send(result.insertId.toString());
  });
});

router.put("/:chatId/messange/:userID", (req, res) => {
  const sql =
    "UPDATE message_status SET was_read = 1 WHERE user_id = ? AND message_id IN (SELECT id FROM room_messages WHERE room_id = ?)";
  dbCon.query(sql, [req.params.userID, req.params.chatId], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      console.log(err);
      return;
    }
    console.log(`[System](Chat) Update room Messanges`, result.insertId);
    res.send(result.insertId.toString());
  });
});
module.exports = router;
