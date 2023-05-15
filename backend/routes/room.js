const express = require("express");
const router = express.Router();
const USERS = require("../config/users");
const PEERS = require("../config/peers");

router.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

router.get("/user", async (req, res) => {
  const users = [];
  console.log("users: ", USERS);
  await USERS.forEach((item) => {
    users.push(item);
    console.log(users);
  });
  res.json(users);
});

router.get("/peerId/:userId", (req, res) => {
  const user = req.params.user;
  PEERS.has(user);
  console.log(user, " have a peer connection? ", PEERS.has(user));
  if (PEERS.has(user)) {
    console.log();
  } else {
    console.log("Cannot found Peer connection");
    res.json({ msg: "Cannot found Peer connection" });
  }
});

module.exports = router;
