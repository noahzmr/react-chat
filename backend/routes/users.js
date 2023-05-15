const express = require("express");
const router = express.Router();
const dbCon = require("../config/mariadbConnection");
const minioClient = require("../config/minio");
const Buffer = require("buffer").Buffer;
const Sentry = require("@sentry/node");

router.get("/", (req, res, next) => {
  const sql = "SELECT * FROM users";
  dbCon.query(sql, (err, json) => {
    if (err) {
      res.status(500).json({ error: err.message });
      console.log(err);
      return;
    }
    res.json(json);
  });
});
router.get("/name/:userID", (req, res, next) => {
  const sql = "SELECT name FROM users WHERE id =?";
  dbCon.query(sql, [req.params.userID], (err, json) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(json[0]);
  });
});
router.get("/data/:userID", (req, res, next) => {
  const sql = "SELECT * FROM users WHERE id = ?";

  dbCon.query(sql, [req.params.userID], (err, json) => {
    if (err) {
      res.status(500).json({ error: err.message });
      console.log(err);
      return;
    }
    res.json(json[0]);
  });
});
router.get("/picture/:userID", (req, res, next) => {
  const sql =
    "SELECT * FROM users_pictures WHERE id = (SELECT picture FROM users WHERE id = ?)";

  dbCon.query(sql, [req.params.userID], (err, json) => {
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
          dbCon.query(sql, [req.params.userID], (err, result) => {
            if (err) {
    Sentry.captureException(err);          res.status(500).json({ error: err.message });
              console.log(err);
              return;
            }

            console.log(
              `[System](User) Get User Profile from the id ${req.params.userID}: `
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
/* eslint-enable new-cap */

router.put("/username", (req, res, next) => {
  const sql = "UPDATE users SET name = ? WHERE id=?;";
  dbCon.query(sql, [req.body.newName, req.body.user], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      console.log(err);
      return;
    }
    console.log(
      `[System](User) Update the Username where id ${req.params.id}: `,
      result.insertId
    );
    res.send(result.insertId.toString());
  });
});
router.put("/gender", (req, res, next) => {
  const sql = "UPDATE users SET gender = ? WHERE id=?;";
  dbCon.query(sql, [req.body.gender, req.body.user], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      console.log(err);
      return;
    }
    const removeFromOtherGender =
      "DELETE FROM room_members WHERE room_id = ? AND user_id = ?;";
    const addToGender =
      "INSERT INTO room_members (room_id, user_id) VALUES (?,?);";
    if (req.body.gender === "male") {
      dbCon.query(removeFromOtherGender, [2, req.body.user], (err, result) => {
        if (err) {
          console.log(err);
          return;
        }
        dbCon.query(addToGender, [1, req.body.user], (err, result) => {
          if (err) {
            console.log(err);
          }
        });
      });
    }
    if (req.body.gender === "female") {
      dbCon.query(removeFromOtherGender, [1, req.body.user], (err, result) => {
        if (err) {
          console.log(err);
          return;
        }
        dbCon.query(addToGender, [2, req.body.user], (err, result) => {
          if (err) {
            console.log(err);
          }
        });
      });
    }
    console.log(
      `[System](User) Update the Gender where id ${req.params.user}: `,
      result.insertId
    );
    res.send(result.insertId.toString());
  });
});
router.put("/status", (req, res, next) => {
  const sql = "UPDATE users SET status = ? WHERE id=?;";
  dbCon.query(sql, [req.body.status, req.body.user], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      console.log(err);
      return;
    }
    console.log(
      `[System](User) Update the Status where id ${req.params.user}: `,
      result.insertId
    );
    res.send(result.insertId.toString());
  });
});
router.put("/info", (req, res, next) => {
  const sql = "UPDATE users SET about_information = ? WHERE id=?;";
  dbCon.query(sql, [req.body.info, req.body.user], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      console.log(err);
      return;
    }
    console.log(
      `[System](User) Update the Status where id ${req.params.user}: `,
      result.insertId
    );
    res.send(result.insertId.toString());
  });
});
router.post("/:userID/picture", (req, res, next) => {
  console.log({ files: req.files.file, params: req.params });
  if (req.files === null) {
    return res.status(400).json({ msg: "No file uploaded!" });
  }
  const file = req.files.file;
  const sql = "UPDATE users SET picture = ? WHERE id=?;";
  const sqlPicture =
    "INSERT INTO users_pictures (filename,content_type,user_id) VALUES (?,?,?);";
  const sqlCheck =
    "SELECT COUNT(id) AS counter FROM users_pictures WHERE user_id = ?;";
  const sqlUpdate =
    "UPDATE users_pictures SET content_type = ? WHERE user_id = ?; ";

  console.log(file.mimetype.split("/")[1]);

  minioClient.putObject(
    "chat",
    `user_${req.params.userID}_picture.${file.mimetype.split("/")[1]}`,
    file.data,
    (error, etag) => {
      if (error) {
        console.log(error);
        return Sentry.captureException(err);
      }
      console.log(etag);
      dbCon.query(sqlCheck, [req.params.userID], (err, result) => {
        if (err) {
Sentry.captureException(err);          res.status(500).json({ error: err.message });
          console.log(err);
          return;
        }
        console.log(result[0].counter);
        if (result[0].counter === 1n) {
          console.log("Update User Picture...");
          dbCon.query(
            sqlUpdate,
            [file.mimetype, req.params.user],
            (err, result) => {
              if (err) {
      Sentry.captureException(err);          res.status(500).json({ error: err.message });
                console.log(err);
                return;
              }
              res.send(result.insertId.toString());
            }
          );
        }
        if (result[0].counter === 0n) {
          console.log("Set first User Picture...");
          dbCon.query(
            sqlPicture,
            [
              `user_${req.params.userID}_picture.${
                file.mimetype.split("/")[1]
              }`,
              file.mimetype,
              req.params.userID,
            ],
            (err, result) => {
              if (err) {
      Sentry.captureException(err);          res.status(500).json({ error: err.message });
                console.log(err);
                return;
              }
              dbCon.query(
                sql,
                [result.insertId.toString(), req.params.userID],
                (err, result) => {
                  if (err) {
          Sentry.captureException(err);          res.status(500).json({ error: err.message });
                    console.log(err);
                    return;
                  }
                  res.send(result.insertId.toString());
                }
              );
              console.log(
                `[System](User) Update the Picture where id ${req.params.userID}: `,
                result.insertId
              );
            }
          );
        }
      });
    }
  );
});

router.get("/:userID/values", (req, res) => {
  const sql =
    "SELECT id, name, email, gender, (SELECT statu.name FROM statu WHERE id = (SELECT STATUS FROM users WHERE id = ?)) AS statusName, (SELECT statu.color FROM statu WHERE id = (SELECT STATUS FROM users WHERE id = ?)) AS statusColor, about_information, picture, phone_number, website, socket_id, peer_id, (SELECT location_id FROM user_location WHERE user_id = ?) AS location_id,(SELECT country FROM user_location WHERE user_id = ?) AS country,(SELECT city FROM user_location WHERE user_id = ?) AS city,(SELECT zip FROM user_location WHERE user_id = ?) AS zip,(SELECT street FROM user_location WHERE user_id = ?) AS street,(SELECT street_nr FROM user_location WHERE user_id = ?) AS street_nr,(SELECT state FROM user_location WHERE user_id = ?) AS state FROM users WHERE id = ?";
  console.log(
    `[USERS] (INFORMATION VALUES QUERY) SELECT * FROM users LEFT JOIN user_location ON users.id = user_location.user_id WHERE users.id = ${req.params.userID}`
  );
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
      req.params.userID,
      req.params.userID,
      req.params.userID,
    ],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
        return;
      }
      console.log("[USERS] (INFORMATION VALUES)", result);
      res.send(result[0]);
    }
  );
});
router.put("/:userID/values", (req, res) => {
  const userId = req.params.userID;
  const userName = req.body.userName;
  const email = req.body.email;
  const phoneNumber = req.body.phoneNumber;
  const website = req.body.website;
  const street = req.body.street;
  const streetNr = req.body.streetNr;
  const city = req.body.city;
  const country = req.body.country;
  const state = req.body.state;
  const zip = req.body.zip;
  const status = req.body.status;
  const about = req.body.about;
  const gender = req.body.gender;
  const updateUser =
    "UPDATE users SET name = ?, email = ?, gender = ?, status = ?, about_information = ?, phone_number = ?,  website = ? WHERE id = ?";
  const checkLocation =
    "SELECT COUNT(location_id) AS count FROM user_location WHERE user_id = ?;";
  const updateLocation =
    "UPDATE user_location SET country = ?, city = ?, zip = ?, street = ?, street_nr = ?, state = ? WHERE user_id = ?";
  const insertLocation =
    "INSERT INTO  user_location (country, city,zip,street,street_nr,state,user_id) VALUES (?,?,?,?,?,?,?)";

  dbCon.query(
    updateUser,
    [userName, email, gender, status, about, phoneNumber, website, userId],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
        return;
      }
      console.log("[USERS] (INFORMATION VALUES)", result);
      dbCon.query(checkLocation, [userId], (err, result) => {
        if (err) {
Sentry.captureException(err);          res.status(500).json({ error: err.message });
          console.log(err);
          return;
        }
        console.log("[USERS] (INFORMATION VALUES)", result[0].count);
        if (result[0].count === 0n) {
          dbCon.query(
            insertLocation,
            [country, city, zip, street, streetNr, state, userId],
            (err, result) => {
              if (err) {
      Sentry.captureException(err);          res.status(500).json({ error: err.message });
                console.log(err);
                return;
              }
              console.log("[USERS] (INFORMATION VALUES)", result);
              res.send("UPDATED!");
            }
          );
        } else {
          dbCon.query(
            updateLocation,
            [country, city, zip, street, streetNr, state, userId],
            (err, result) => {
              if (err) {
      Sentry.captureException(err);          res.status(500).json({ error: err.message });
                console.log(err);
                return;
              }
              console.log("[USERS] (INFORMATION VALUES)", result);
              res.send("UPDATED!");
            }
          );
        }
      });
    }
  );
});
router.put("/socket", (req, res, next) => {
  const sql = "UPDATE users SET socket_id = ? WHERE id = ?;";
  dbCon.query(sql, [req.body.socket, req.body.user], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      console.log(err);
      return;
    }
    console.log(
      `[System](User) Update the socket where id ${req.params.user}: `,
      result.insertId
    );
    res.send(result.insertId.toString());
  });
});
router.put("/peer", (req, res, next) => {
  const sql = "UPDATE users SET peer_id = ? WHERE id = ?;";
  dbCon.query(sql, [req.body.peer, req.body.user], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      console.log(err);
      return;
    }
    console.log(
      "[System](PEER) UPDATED PEER ID",
      req.body.peer,
      req.body.user,
      req.body.room
    );
    const sql =
      "SELECT id, peer_id AS peer_id FROM users WHERE id IN (SELECT user_id FROM room_members WHERE room_id = ?) AND NOT id = ?";
    dbCon.query(sql, [req.body.room, req.body.user], (err, resu) => {
      if (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
        return;
      }
      console.log(
        `[System](PEER) get peers from the room ${req.body.room}: `,
        resu
      );
      res.send(resu);
    });
  });
});
router.get("/status", (req, res) => {
  const sql = "SELECT * FROM statu";
  dbCon.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      console.log(err);
      return;
    }
    console.log("[USERS] (INFORMATION VALUES)", result);
    res.send(result);
  });
});
module.exports = router;
