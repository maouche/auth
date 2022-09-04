const express = require("express");
const { register, login, refreshToken, verify  } = require("../controller/auth");
const router = express.Router();

router.route("/register").post(register);
router.route("/auth").post(login);
router.route("/refreshToken").post(refreshToken);
router.route("/verify/:token").get(verify);

module.exports = router;