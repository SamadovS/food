const assert = require("assert");
const Member = require("../models/Member");
// controller butun proccessni boshqarib, tegishli madellarga vazifa yuklaydi.
let memberController = module.exports; //memberControllerga turli xil metodlarni yuklash mumkin
const jwt = require("jsonwebtoken");
const Definer = require("../lib/mistake");
const cookieParser = require("cookie-parser");

memberController.signup = async (req, res) => {
  try {
    console.log("POST: cont/signup");
    const data = req.body,
      member = new Member(),
      new_member = await member.signupData(data);

    //   console.log("result:::", new_member);
    const token = memberController.createToken(new_member);
    //   console.log("token:::", token);

    res.cookie("access_token", token, {
      maxAge: 6 * 3600 * 1000,
      httpOnly: true,
    });

    res.json({ state: "succeed", data: new_member });
  } catch (err) {
    res.json({ state: "fail", message: err.message });
    console.log(`ERROR, cont/signup, ${err.message} `);
  }
};

memberController.login = async (req, res) => {
  try {
    console.log("POST: cont/login");
    const data = req.body,
      member = new Member(),
      result = await member.loginData(data);

    // console.log("result:::", result);
    const token = memberController.createToken(result);
    // console.log("token:::", token);

    res.cookie("access_token", token, {
      maxAge: 6 * 3600 * 1000,
      httpOnly: true,
    });

    res.json({ state: "succeed", data: result });
  } catch (err) {
    res.json({ state: "fail", message: err.message });
    console.log(`ERROR, cont/login, ${err.message} `);
  }
};

memberController.logout = (req, res) => {
  console.log("GET cont.logout");
  res.send("we are in logout page");
};

memberController.createToken = (result) => {
  try {
    const upload_data = {
      _id: result._id,
      mb_nick: result.mb_nick,
      mb_type: result.mb_type,
    };
    const token = jwt.sign(upload_data, process.env.SECRET_TOKEN, {
      expiresIn: "6h",
    });

    assert.ok(token, Definer.auth_err2);
    return token;
  } catch (err) {
    throw err;
  }
};
