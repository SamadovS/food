const express = require("express");
// const app = express();
const router_bssr = express.Router();
const restaurantController = require("./controllers/restaurantController");

/**********************************
 *          BSSR EJS              *
 *********************************/

router_bssr
    .get("/signup", restaurantController.getSignupMyRestaurant)
    .post("/signup", restaurantController.signupProcess);

router_bssr
    .get("/login", restaurantController.getLoginMyRestaurant)
    .post("/login", restaurantController.loginProcess);

router_bssr.get("/logout", restaurantController.logoutProcess);
router_bssr.get("/check-me", restaurantController.checkSession);

router_bssr.get("/products/menu", restaurantController.getMyRestaurantData);

module.exports = router_bssr;
