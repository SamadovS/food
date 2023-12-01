const assert = require("assert");
const Member = require("../models/Member");
const Product = require("../models/Product");
const Definer = require("../lib/mistake");
const Restaurant = require("../models/Restaurant");
// controller butun proccessni boshqarib, tegishli madellarga vazifa yuklaydi.
let restaurantController = module.exports; //memberControllerga turli xil metodlarni yuklash mumkin

restaurantController.home = async (req, res) => {
  try {
    console.log("GET: cont/home");
    res.render("home-page");
  } catch (err) {
    console.log(`ERROR, cont/home, ${err.message} `);
    res.json({ state: "fail", message: err.message });
  }
};

restaurantController.getMyRestaurantProducts = async (req, res) => {
  try {
    console.log("GET: cont/getMyRestaurantProducts");
    const product = new Product();
    const data = await product.getAllProductsDataResto(req.member);
    res.render("restaurant-menu", { restaurant_data: data });
  } catch (err) {
    console.log(`ERROR, cont/getMyRestaurantProducts, ${err.message} `);
    // res.json({ state: "fail", message: err.message });
    res.redirect("/resto");
  }
};

restaurantController.getSignupMyRestaurant = async (req, res) => {
  try {
    console.log("GET: cont/getSignupMyRestaurant");
    res.render("signup");
  } catch (err) {
    console.log(`ERROR, cont/getSignupMyRestaurant, ${err.message} `);
    res.json({ state: "fail", message: err.message });
  }
};
restaurantController.signupProcess = async (req, res) => {
  try {
    console.log("POST: cont/signupProcess");
    assert(req.file, Definer.general_err3);
    let new_member = req.body;
    new_member.mb_type = "RESTAURANT";
    new_member.mb_image = req.file.path;
    const member = new Member(),
      result = await member.signupData(new_member);
    assert.ok(result, Definer.general_err1);

    req.session.member = result; //app js da yasalgan session = memberiga signup data= resultini save qilamiz.
    res.redirect("/resto/products/menu");
  } catch (err) {
    res.json({ state: "fail", message: err.message });
    console.log(`ERROR, cont/signup, ${err.message} `);
  }
};

restaurantController.getLoginMyRestaurant = async (req, res) => {
  try {
    console.log("GET: cont/getLoginMyRestaurant");
    res.render("login-page");
  } catch (err) {
    console.log(`ERROR, cont/getLoginMyRestaurant, ${err.message} `);
    res.json({ state: "fail", message: err.message });
    // res.redirect("/resto/login")
  }
};

restaurantController.loginProcess = async (req, res) => {
  try {
    console.log("POST: cont/loginProcess");
    const data = req.body,
      member = new Member(),
      result = await member.loginData(data);

    req.session.member = result; //session ichida member obj hosil qilib resultni yuklaymiz
    req.session.save(() => {
      result.mb_type === "ADMIN"
        ? res.redirect("/resto/all-restaurant")
        : res.redirect("/resto/products/menu");
    });
  } catch (err) {
    // res.json({ state: "fail", message: err.message });
    res.redirect("/resto/login");
    console.log(`ERROR, cont/login, ${err.message} `);
  }
};

restaurantController.logout = (req, res) => {
  try {
    console.log("GET cont/logout");
    req.session.destroy(function () {
      res.redirect("/resto");
    });
  } catch (err) {
    res.redirect("/resto/login");
    console.log(`ERROR, cont/login, ${err.message} `);
  }
};

restaurantController.validateAuthRestaurant = (req, res, next) => {
  if (req.session?.member?.mb_type === "RESTAURANT") {
    req.member = req.session.member; //brauser cockiesga yozadi
    next();
  }
  // res.redirect("/resto");
  else
    res.json({
      state: "fail",
      error: "only authenticated members with restaurant type",
    });
};

restaurantController.checkSessions = (req, res) => {
  if (req.session?.member) {
    res.json({ state: "succeed", data: req.session.member });
  } else {
    res.json({ state: "fail", message: "You are not authenticated" });
  }
};

restaurantController.validateAdmin = (req, res, next) => {
  if (req.session?.member?.mb_type === "ADMIN") {
    req.member = req.session.member; //brauser cockiesga yozadi
    next();
  } else {
    const html = `<script>
            alert("Admin page: Permission denied!");
            window.location.replace('/resto');
          </script>`;
    res.end(html);
  }
};

restaurantController.getAllRestaurants = async (req, res) => {
  try {
    console.log("GET cont/getAllRestaurants");

    const restaurant = new Restaurant();
    const restaurant_data = await restaurant.getAllRestaurantsData();
    // console.log("restaurant_data:", restaurant_data);

    // todo: hamma restaurantlarni db dan chaqiramiz
    res.render("all-restaurants", { restaurant_data: restaurant_data });
  } catch (err) {
    console.log(`ERROR, cont/getAllRestaurants, ${err.message} `);
    res.json({ state: "fail", message: err.message });
  }
};

restaurantController.updateRestaurantByAdmin = async (req, res) => {
  try {
    console.log("GET cont/updateRestaurantByAdmin");

    const restaurant = new Restaurant();
    const result = await restaurant.updateRestaurantByAdminData(req.body);
    await res.json({ state: "success", data: result });

    // todo: hamma restaurantlarni db dan chaqiramiz
    // res.render("all-restaurants", { restaurant_data: restaurant_data });
  } catch (err) {
    console.log(`ERROR, cont/updateRestaurantByAdmin, ${err.message} `);
    res.json({ state: "fail", message: err.message });
  }
};
