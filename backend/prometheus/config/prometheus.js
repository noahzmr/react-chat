const client = require("prom-client");
const collectDefaultMetrics = client.collectDefaultMetrics;
const dbCon = require("../../config/mariadbConnection");

let users = {};
let status = {};
let sendMsg = {};
let recivedMsg = {};
let groups = {};
let groupsMsg = {};
let groupsMembers = {};

/*
 *#*#*#*#*#**#*#*#*#*#*#*#*
 *#*#*#*#*#*Users*#*#*#*#*#*
 *#*#*#*#*#**#*#*#*#*#*#*#*
 */

const getUsers = () => {
  users = {};
  return new Promise((resolve, reject) => {
    dbCon.query("SELECT * FROM users;", (err, result) => {
      if (err) {
        console.log({ error: err });
        reject(err);
        return;
      }
      console.log("[PROMETHEUS](USERS) Founded Users: ", result);
      result.forEach((item) => {
        users[item.id] = { item, label: `user_${item.id}` };
      });
      console.log("[PROMETHEUS](USERS) Cashed Users: ", users);
      resolve(users);
    });
  });
};

// Count of Status from Users
const getStatus = () => {
  const sqlStatus =
    "SELECT (SELECT COUNT(id) FROM users)AS Total, (SELECT COUNT(STATUS) FROM users WHERE STATUS = 1) AS Online, (SELECT COUNT(STATUS) FROM users WHERE STATUS = 2) AS Absent, (SELECT COUNT(STATUS) FROM users WHERE STATUS = 3) AS Employs, (SELECT COUNT(STATUS) FROM users WHERE STATUS = 4) AS Offline; ";
  status = {};
  return new Promise((resolve, reject) => {
    dbCon.query(sqlStatus, (err, result) => {
      if (err) {
        console.log({ error: err });
        reject(err);
        return;
      }
      console.log("[PROMETHEUS](STATUS) Status Stats Raw: ", result[0]);
      status = {
        absolute: {
          online: parseInt(result[0].Online),
          absent: parseInt(result[0].Absent),
          employs: parseInt(result[0].Employs),
          offline: parseInt(result[0].Offline),
          total: parseInt(result[0].Total),
        },
        relative: {
          online:
            (parseInt(result[0].Online) / parseInt(result[0].Total)) * 100,
          absent:
            (parseInt(result[0].Absent) / parseInt(result[0].Total)) * 100,
          employs:
            (parseInt(result[0].Employs) / parseInt(result[0].Total)) * 100,
          offline:
            (parseInt(result[0].Offline) / parseInt(result[0].Total)) * 100,
        },
      };
      console.log("[PROMETHEUS](STATUS) Cashed Status Stats: ", status);
      resolve(status);
    });
  });
};

// Count of recived Messages per User
const getMessangesUsersRecived = () => {
  const sqlMessangesRecived =
    "SELECT COUNT(id) AS msgRecived FROM room_messages WHERE room_id IN (SELECT room_id FROM room_members WHERE user_id = ?) AND NOT user_id = ?;";
  return new Promise((resolve, reject) => {
    getUsers().then((data) => {
      for (const id in data) {
        const item = data[id];
        dbCon.query(
          sqlMessangesRecived,
          [item.item.id, item.item.id],
          (err, result) => {
            if (err) {
              console.log({ error: err });
              reject(err);
              return;
            }
            result.forEach((resu) => {
              recivedMsg[item.item.id] = {
                count: parseInt(resu.msgRecived),
                label: `user_${item.item.id}`,
              };
            });
            console.log(
              `[PROMETHEUS](Messanges) Recived Messanges From User ${item.item.id}: `,
              recivedMsg
            );
            resolve(recivedMsg);
          }
        );
      }
    });
  });
};

// Count of sended Messanges
const getMessangesUsersSend = () => {
  const sqlMessangesSend =
    "SELECT COUNT(id) AS sendMsg FROM room_messages WHERE user_id = ?;";
  return new Promise((resolve, reject) => {
    getUsers().then((data) => {
      for (const id in data) {
        const item = data[id];
        dbCon.query(sqlMessangesSend, [item.item.id], (err, result) => {
          if (err) {
            console.log({ error: err });
            reject(err);
            return;
          }
          result.forEach((resu) => {
            sendMsg[item.id] = {
              count: parseInt(resu.sendMsg),
              label: `user_${item.item.id}`,
            };
          });
          console.log(
            `[PROMETHEUS](Messanges) Send Messanges From User ${item.item.id}: `,
            sendMsg
          );
          resolve(sendMsg);
        });
      }
    });
  });
};

/*
 *#*#*#*#*#**#*#*#*#*#*#*#*
 *#*#*#*#*#*Group*#*#*#*#*#*
 *#*#*#*#*#**#*#*#*#*#*#*#*
 */
const getGroups = () => {
  users = {};
  return new Promise((resolve, reject) => {
    dbCon.query("SELECT * FROM rooms WHERE is_group = 1;", (err, result) => {
      if (err) {
        console.log({ error: err });
        reject(err);
        return;
      }
      result.forEach((item) => {
        groups[item.id] = { item, label: `group_${item.id}` };
      });
      console.log("[PROMETHEUS](USERS) Cashed Users: ", groups);
      resolve(groups);
    });
  });
};

// Count of Messanges per Group
const getMessangesGroup = () => {
  const sqlMessangesGroup =
    "SELECT COUNT(id) AS msgGroups FROM room_messages WHERE room_id = ?;";
  return new Promise((resolve, reject) => {
    getGroups().then((data) => {
      for (const id in data) {
        const item = data[id];
        dbCon.query(sqlMessangesGroup, [item.item.id], (err, result) => {
          if (err) {
            console.log({ error: err });
            reject(err);
            return;
          }
          result.forEach((resu) => {
            groupsMsg[item.item.id] = {
              count: parseInt(resu.msgGroups),
              label: `group_${item.item.id}`,
            };
          });
          console.log(
            `[PROMETHEUS](Group) Send Messanges from the Group ${item.item.id}: `,
            groupsMsg
          );
          resolve(groupsMsg);
        });
      }
    });
  });
};

// Count of users per Group
const getUsersGroup = () => {
  const sqlMembersGroup =
    "SELECT COUNT(id) AS groupMembers FROM room_members WHERE room_id = ?;";
  return new Promise((resolve, reject) => {
    getGroups().then((data) => {
      for (const id in data) {
        const item = data[id];
        dbCon.query(sqlMembersGroup, [item.item.id], (err, result) => {
          if (err) {
            console.log({ error: err });
            reject(err);
            return;
          }
          result.forEach((resu) => {
            groupsMembers[item.item.id] = {
              count: parseInt(resu.groupMembers),
              label: `group_${item.item.id}`,
            };
          });
          console.log(
            `[PROMETHEUS](Group) Send Messanges from the Group ${item.item.id}: `,
            groupsMembers
          );
          resolve(groupsMembers);
        });
      }
    });
  });
};

// Create a Registry which registers the metrics
const register = new client.Registry();

// Enable the collection of default metrics
collectDefaultMetrics({
  register,
  labels: { NODE_APP_INSTANCE: "chat", CHAT: "", USER: "" },
});

// Create a histogram metric
const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in microseconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

// Create a gauge metric
const totalHttpRequestDuration = new client.Gauge({
  name: "http_total_duration",
  help: "the last duration or response time of last request",
  labelNames: ["method", "route", "code", "NODE_APP_INSTANCE"],
});

const usersStatusOnline = new client.Gauge({
  name: "chat_status_users_online",
  help: "Status Stats from all Users",
  labelNames: ["NODE_APP_INSTANCE"],
});

const usersStatusAbsent = new client.Gauge({
  name: "chat_status_users_absent",
  help: "Status Stats from all Users",
  labelNames: ["NODE_APP_INSTANCE"],
});

const usersStatusOccupied = new client.Gauge({
  name: "chat_status_users_occupied",
  help: "Status Stats from all Users",
  labelNames: ["NODE_APP_INSTANCE"],
});

const usersStatusOffline = new client.Gauge({
  name: "chat_status_users_offline",
  help: "Status Stats from all Users",
  labelNames: ["NODE_APP_INSTANCE"],
  async collect() {
    getStatus().then((value) => {
      console.log(value);
      usersStatusOnline.set(
        { NODE_APP_INSTANCE: `chat` },
        value.relative.online
      );
      usersStatusOffline.set(
        { NODE_APP_INSTANCE: `chat` },
        value.relative.offline
      );
      usersStatusAbsent.set(
        { NODE_APP_INSTANCE: `chat` },
        value.relative.absent
      );
      usersStatusOccupied.set(
        { NODE_APP_INSTANCE: `chat` },
        value.relative.employs
      );
    });
  },
});

const userSend = new client.Gauge({
  name: "chat_send_messanges_users",
  help: "Number of all send Messanges from a User",
  labelNames: ["NODE_APP_INSTANCE"],
  async collect() {
    const value = await getMessangesUsersSend();
    this.set({ NODE_APP_INSTANCE: `value` }, value);
  },
});

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(totalHttpRequestDuration);
register.registerMetric(usersStatusOnline);
register.registerMetric(usersStatusOffline);
register.registerMetric(usersStatusAbsent);
register.registerMetric(usersStatusOccupied);

module.exports = register;
