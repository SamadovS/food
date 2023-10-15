const Member = require("../models/Member");

let memberController = module.exports;

memberController.signup = async (req, res) => {
    try {
        console.log("POST: cont/signup");
        const data = req.body;
        console.log("body:", req.body);

        const member = new Member();
        const new_member = await member.signupData(data);

        res.send("done");
    } catch (err) {
        console.log(`ERROR: cont/signup, ${err.message}`);
        // res.status(500).send("Internal Server Error");
    }
};

memberController.login = (req, res) => {
    console.log("POST cont.login");
    res.send("You are in Login Page");
};

memberController.logout = (req, res) => {
    console.log("POST cont.logout");
    res.send("You are in Logout Page");
};
