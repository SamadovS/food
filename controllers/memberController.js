let memberController = module.exports;

memberController.home = (req, res) => {
    console.log("GET cont.home");
    res.send("You are in Homepage");
};

memberController.signup = (req, res) => {
    console.log("POST cont.signup");
    res.send("You are in Signup Page");
};

memberController.login = (req, res) => {
    console.log("POST cont.login");
    res.send("You are in Login Page");
};

memberController.logout = (req, res) => {
    console.log("POST cont.logout");
    res.send("You are in Logout Page");
};
