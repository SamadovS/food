console.log("Starting Web Server");
const express = require("express");
const app = express();
const router = require("./router");

// 1: Entry codes
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2: Session codes

// 3: Views codes
app.set("views", "views");
app.set("view engine", "ejs");

// 4: Routing codes
// app.use("/resto", router_bssr);  // for admin and restaurant users
app.use("/", router); // for clients

module.exports = app;
