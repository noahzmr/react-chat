const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const debug = require("debug")("backend:server");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const port = normalizePort("3000");
const fileUpload = require("express-fileupload");
const ip = require("ip");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const chatRoomsRouter = require("./routes/chatrooms");
const auth = require("./routes/auth");
const ipAddress = ip.address();
const app = express();
const room = require("./routes/room");
let rooms = require("./config/rooms");
const dbCon = require("./config/mariadbConnection");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const sendEmail = require("./config/mail");

const origin = [
  "https://localhost:3001",
  `https://${ipAddress}:3001`,
  "https://demo.noerkelit.online:3001",
  "*",
  "https://chat.noerkelit.online",
  "https://keycloak.noerkelit.online",
];
// Init Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

// Peer Options
const optionsPeer = {
  debug: true,
};
const ExpressPeerServer = require("peer").ExpressPeerServer;

/*
Initilaz Node.js Server
*/
const server = https.createServer(
  {
    key: fs.readFileSync("cert/key.key"),
    cert: fs.readFileSync("cert/cert.cer"),
  },
  app
);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
  console.log(
    `You can visit the site under https://localhost:${port} od https://${ipAddress}:${port}`
  );
}

/*
Initilaz Socket IO Server
*/

const io = require("socket.io")(server, {
  cors: {
    origin: origin,
    credentials: true,
    allowedHeaders: ["sessionId"],
  },
});

io.on("connection", (socket) => {
  socket.onAny((event, ...args) => {
    console.log("EVENT GOT TRIGGER", event, args);
  });
  socket.prependAny((eventName, ...args) => {
    console.log("EMIT", eventName, args);
  });
  if (
    socket.handshake.query.userName === undefined ||
    socket.handshake.query.token === undefined ||
    socket.handshake.query.userName === "undefined" ||
    socket.handshake.query.token === "undefined" ||
    socket.handshake.query.id === "undefined" ||
    socket.handshake.query.id === undefined
  ) {
    console.log("[SOCKET] QUERY VALUES", socket.handshake.query);
    console.log("User is not auhorized!");
  } else {
    console.log("[SOCKET] QUERY VALUES", socket.handshake.query);
    // Writen Chat Functions

    // Return all Socket instances
    var clients = io.sockets;
    dbCon.query(
      "UPDATE users SET socket_id=? WHERE id = ?;",
      [socket.id, socket.handshake.query.id],
      (err, result) => {
        if (err) {
          Sentry.captureException(err);
          console.log({ error: err.message });
          return;
        }
        console.log(result);
        dbCon.query("SELECT socket_id FROM users", (err, result) => {
          let sockets = [];
          if (err) {
            Sentry.captureException(err);
            console.log({ error: err.message });
            return;
          }
          console.log(["ALL SOCKTES"], result);
          result.forEach((item) => {
            sockets.push(item.socket_id);
          });
          clients.sockets.forEach((data, counter) => {
            const socketid = data.id; // Log ids

            console.log(
              `[Socket](aktive) checking if ${socketid} is valid`,
              sockets.includes(socketid),
              sockets
            );
            if (sockets.includes(socketid)) {
              return;
            } else {
              io.in(socketid).disconnectSockets();
              console.log(io.in(socketid).disconnectSockets());
            }
          });
        });
      }
    );

    console.log(`[SOCKET] New User connect with ${socket.id}`);
    socket.on("chat message", (msg, userID, chatId, name, chatName) => {
      if (chatId === null) {
        console.log("[SOCKET] No Chat selected!", { chatId, userID, msg });
      } else {
        dbCon.query(
          "SELECT socket_id, email, name FROM users WHERE id IN (SELECT user_id FROM room_members WHERE room_id = ?) AND NOT id = ?;",
          [chatId, userID],
          (err, result) => {
            if (err) {
              Sentry.captureException(err);
              console.log({ error: err.message });
              return;
            }
            result.forEach((item) => {
              const mailData = {
                user: item.name,
                message: msg,
                chat: chatName,
                from: name,
                url: `https://demo.noerkelit.online:3001/chat/${chatId}`,
              };
              sendEmail("message", item.email, mailData);
              socket
                .to(item.socket_id)
                .emit("notification", msg, userID, chatId, name, chatName);
            });
          }
        );
        io.to(chatId).emit(
          "chat message",
          msg,
          userID,
          chatId,
          name,
          chatName,
          (err, response) => {
            if (err) {
              Sentry.captureException(err);
              console.log({ "[SOCKET](message) err": err.message });
            } else {
              console.log("[SOCKET] typing!", {
                chatId,
                name,
                response,
              });
            }
          }
        );
        console.log("[SOCKET] New msg!", { chatId, userID, msg });
      }
    });
    socket.on("typing", (name, chatId) => {
      console.log(socket.rooms);
      socket.to(chatId).emit("typing", name, chatId);
    });

    socket.on("join-chat", (user, chat) => {
      socket.join(chat);
      const sql = "SELECT name FROM rooms WHERE id = ?";
      dbCon.query(sql, [chat], (err, json) => {
        if (err) {
          Sentry.captureException(err);
          res.status(500).json({ error: err.message });
          console.log(err);
          return;
        }
        if (json[0]) {
          console.log(json[0].name);
          chatName = json[0].name;

          const sql = "SELECT name FROM users WHERE id =?";
          dbCon.query(sql, [user], (err, json) => {
            if (err) {
              Sentry.captureException(err);
              res.status(500).json({ error: err.message });
              return;
            }
            const values = {
              id: user,
              userName: json[0].name,
              msg: `${json[0].name} Joined the Chat ${chatName}`,
              chat: chat,
              chatName: chatName,
            };
            io.to(chat).emit("chat message", values, "system");
          });
        } else {
          console.log("No chat selected!");
          res.send("No chat selected!");
        }
      });
    });
    socket.on("leave-chat", (user, chat, cb) => {
      socket.leave(chat);
      console.log(`[SOCKET] User: ${user} Joined the Chat: ${chat}`);
      let chatName;
      const sql = "SELECT name FROM rooms WHERE id = ?";
      dbCon.query(sql, [chat], (err, json) => {
        if (err) {
          Sentry.captureException(err);
          res.status(500).json({ error: err.message });
          console.log(err);
          return;
        }
        if (json[0]) {
          console.log(json[0].name);
          chatName = json[0].name;

          const sql = "SELECT name FROM users WHERE id =?";
          dbCon.query(sql, [user], (err, json) => {
            if (err) {
              Sentry.captureException(err);
              res.status(500).json({ error: err.message });
              return;
            }
            const values = {
              id: user,
              userName: json[0].name,
              msg: `${json[0].name} Lefted the Chat ${chatName}`,
              chat: chat,
              chatName: chatName,
            };
            io.to(chat).emit("chat message", values, "system");
          });
        } else {
          console.log("No chat selected!");
          res.send("No chat selected!");
        }
      });
    });
    // Call Chats
    // Socket Join room function
    socket.on("join-room", (roomId, credentials, id, stream) => {
      console.log(
        `[SOCKET] ${credentials.user} (${id}) trying to Join the Room ${roomId} with the Stream: ${stream}`
      );

      /*
       Filter Functions
      */
      // All Members in a Room
      const roomValues = rooms.filter((item) => item.roomId === roomId);
      // Check if Member have a connecetion to the Room
      const userInRoom = rooms.filter((item) => {
        return (
          item.roomId === roomId && item.socketToken === credentials.socketToken
        );
      });

      /*
       Functions
      */
      // Join Room if user have no connection to the Room
      const join = async () => {
        console.log(
          `${credentials.user.username} (${credentials.user.id}) join the Room ${roomId} authorized by ${credentials.socketToken}`
        );
        rooms.push({
          roomId,
          socketToken: credentials.socketToken,
          socketId: socket.id,
          name: credentials.user,
          peer: id,
          stream,
          video: true,
          audio: true,
          screenShare: false,
        });
        await socket.join(roomId);
        await socket.to(roomId).emit("user-connected", roomValues);
      };

      // Update Peer id if user have a connection to the room
      const update = async () => {
        const updatedJson = [];
        const join = () =>
          new Promise((resolve, reject) => {
            resolve(
              rooms.forEach((item) => {
                console.log("old value: ", item, "New Value: ", {
                  ...item,
                  peer: id,
                  socketId: socket.id,
                });
                item.roomId === roomId &&
                item.socketToken === credentials.socketToken
                  ? updatedJson.push({
                      ...item,
                      peer: id,
                      socketId: socket.id,
                      stream,
                    })
                  : updatedJson.push({ ...item });
              })
            );
          });

        join()
          .then(async () => {
            rooms = updatedJson;
            console.log(
              "[SOCKET] Updated Values now join room and send values",
              userInRoom
            );
            await socket.join(roomId);
            await io.to(roomId).emit("update-room-attributes", roomValues);
          })
          .catch((err) => {
            Sentry.captureException(err);
            console.log("Error! ", err.message);
          });
      };

      console.log(
        `check if ${credentials.user.username} (${credentials.user.id}) have a connection to the room ${roomId}...`,
        userInRoom.length === 0
      );

      if (userInRoom.length === 0) {
        join();
      } else {
        update();
      }

      // Socket disconnect Funnction
      socket.on("disconnect", () => {
        console.log(socket.id, "Disconnect!");
        socket.leave(roomId);
        io.to(roomId).emit("user-disconnected", roomValues);
      });
    });
    // Check members function
    socket.on("update-room-attributes", (roomId) => {
      const roomValues = rooms.filter((item) => item.roomId === roomId);
      console.log("[SOCKET] Room Values: ", roomValues);
      io.to(roomId).emit("update-room-attributes", roomValues);
    });
    // Update Stream
    socket.on("update-stream", (values) => {
      const update = async () => {
        const updatedJson = [];
        const join = () =>
          new Promise((resolve, reject) => {
            resolve(
              rooms.forEach((item) => {
                console.log("old value: ", item, "New Value: ", {
                  ...item,
                  video: values.video,
                  audio: values.audio,
                });
                item.roomId === values.roomId && item.socketId === socket.id
                  ? updatedJson.push({
                      ...item,
                      video: values.video,
                      audio: values.audio,
                    })
                  : updatedJson.push({ ...item });
              })
            );
          });

        join()
          .then(async () => {
            rooms = updatedJson;
            const roomValues = rooms.filter(
              (item) => item.roomId === values.roomId
            );

            await io
              .to(values.roomId)
              .emit("update-room-attributes", roomValues);
          })
          .catch((err) => {
            Sentry.captureException(err);
            console.log("Error! ", err.message);
          });
      };
      update();
    });
    socket.on("update-screen-share", (values) => {
      const update = async () => {
        const updatedJson = [];
        const join = () =>
          new Promise((resolve, reject) => {
            resolve(
              rooms.forEach((item) => {
                console.log("old value: ", item, "New Value: ", {
                  ...item,
                  screenShare: values.screenShare,
                });
                item.roomId === values.roomId && item.socketId === socket.id
                  ? updatedJson.push({
                      ...item,
                      screenShare: values.screenShare,
                    })
                  : updatedJson.push({ ...item });
              })
            );
          });

        join()
          .then(async () => {
            rooms = updatedJson;
            const roomValues = rooms.filter(
              (item) => item.roomId === values.roomId
            );

            await io
              .to(values.roomId)
              .emit("update-room-attributes", roomValues);
          })
          .catch((err) => {
            Sentry.captureException(err);
            console.log("Error! ", err.message);
          });
      };
      update();
    });
  }
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/views")));
app.use(
  cors({
    origin: origin,
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  })
);
app.use(fileUpload());

app.use("/peerjs", ExpressPeerServer(server, optionsPeer));
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/chatRooms", chatRoomsRouter);
app.use("/auth", auth);
app.use("/room", room);
// Handles any requests that don't match the ones above
app.use("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "/views", "index.html"));
});

module.exports = app;
