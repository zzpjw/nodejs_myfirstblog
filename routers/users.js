const Boards = require("../models/board");
const router = require("express").Router();
// const authMiddleware = require("./middlewares/auth-middleware");
// const User = require("./models/user");
const jwt = require("jsonwebtoken");


//기본 페이지
router.get("/", async (req, res) => {
    res.status(200).render('index', )
});

//로그인 페이지
router.get("/login", async (req, res) => {
    res.status(200).render('login', )
});

//회원가입 페이지
router.get("/register", async (req, res) => {
    res.status(200).render('register', )
});

module.exports = router;