console.log("Starting Web Server");

const http = require("http");
const express = require("express");
const app = express();
const router = require("./router");
const router_bssr = require("./router_bssr");
const cors = require("cors");
const path = require("path");

let session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: process.env.MONGO_URL,
  collection: "sessions",
});

// 1: Entry codes
app.use(express.static("public"));
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(cookieParser());

// 2: Session codes

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 30, // for 30 mins
    },
    store: store,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(function (req, res, next) {
  res.locals.member = req.session.member;
  next();
});

// 3: Views codes
// app.set("views", path.join(__dirname, "views"));
app.set("views", "views");
app.set("view engine", "ejs");

// 4: Routing codes
app.use("/resto", router_bssr); // for admin and restaurant users
app.use("/", router); // for clients

const server = http.createServer(app);

// start: SOCKET.IO BACKEND SERVER
const io = require("socket.io")(server, {
  serveClient: false,
  origins: "*:*",
  transport: ["websocket", "xhr-polling"],
});

let online_users = 0;
io.on("connection", function (socket) {
  online_users++;
  console.log(("new user, total:", online_users));

  socket.emit("greetMsg", { text: "welcome" });
  io.emit("infoMsg", { total: online_users });

  socket.on("disconnect", function () {
    online_users--;
    socket.broadcast.emit("infoMsg", { total: online_users });
    console.log(("client disconnected, total:", online_users));
  });

  socket.on("createMsg", function (data) {
    console.log(("data", data));
    io.emit("newMsg", data);
  });
});

// socket.emit(); => sending msg to connected one user
// socket.broadcast.emit(); => sending msg to other users, except that ONE USER
// io.emit(); => ending msg to all users

// finish: SOCKET.IO BACKEND SERVER

module.exports = server;
