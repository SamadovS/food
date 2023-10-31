const Member = require("../models/Member");
// controller butun proccessni boshqarib, tegishli madellarga vazifa yuklaydi.
let memberController = module.exports; //memberControllerga turli xil metodlarni yuklash mumkin

memberController.signup = async (req, res) => {
    try {
        console.log("POST: cont/signup");
        const data = req.body,
            member = new Member(),
            new_member = await member.signupData(data);

        // TODO: AUTHENTICATE BASED ON JWT (json web token)

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
