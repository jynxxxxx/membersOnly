const express = require("express");
const router = express.Router();
const board_controller = require("../controllers/boardController")


router.get("/", board_controller.home_page )

router.post("/post", board_controller.message_form_post )

router.post("/secret", board_controller.secret_post);

router.get("/sign-up", board_controller.signup_page_get);

router.post("/sign-up", board_controller.signup_page_post);

router.get("/login", board_controller.login_page_get)

router.post("/login", board_controller.login_page_post)

router.get("/log-out", board_controller.logout_page_get);


module.exports = router;