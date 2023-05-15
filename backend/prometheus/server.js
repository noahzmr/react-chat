const express = require("express");
const app = express();
const port = 9100;
const prometheus = require("./prometheus.js");

app.use(express.json());

app.use("/", prometheus);

app.listen(port, () => {
  console.log(`Prometheus listening on port ${port}`);
});
app.on("error", onError);
app.on("listening", onListening);

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
