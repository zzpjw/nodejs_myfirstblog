const Boards = require("../models/board");
const router = require("express").Router();
const authMiddleware = require("../middlewares/auth-middleware");
const User = require("../models/user");
const jwt = require("jsonwebtoken");


//기본 페이지
router.get("/", async (req, res) => {
    res.status(200).render('index', )
});


//회원가입 페이지
router.get("/register", async (req, res) => {
    res.status(200).render('register', )
});

//회원가입
router.post("/register", async (req, res) => {
    const {nickname, password, confirmPassword} = req.body;

    if (password !== confirmPassword) {
        res.status(400).send({
            errorMessage: '패스워드가 패스워드 확인란과 동일하지 않습니다.'
        });
        return;
    }

    const existUsers = await User.find({
        nickname,
    });
    if (existUsers.length) {
        res.status(400).send({
            errorMessage: '이미 가입된 닉네임이 있습니다.',
        });
        return;
    }


    const user = new User({nickname, password});
    await user.save();

    res.status(201).send({});
})

//로그인 페이지
router.get("/login", async (req, res) => {
    res.status(200).render('login', )
});

//로그인
router.post("/auth", async (req, res) => {
    const { nickname, password } = req.body;

    const user = await User.findOne({ nickname, password }).exec();

    if (!user) {
        res.status(400).send({
            errorMessage: '닉네임 또는 패스워드가 잘못됐습니다.'
        });
        return;
    }
    // console.log("userId", user.userId)
    //*************************************************시크릿 키 바꾸기*******************
    const token = jwt.sign({ userId: user.userId }, "my-secret-key");
    // console.log(token)
    res.send({
        token,
    });

});

//핸들러 앞에 authMiddleware를 붙이지 않으면 문제가 발생함.
router.get("/users/me", authMiddleware, async (req, res) => {
    const {user} = res.locals;
    // console.log(user);
    res.send({
        user: {  //원래는 이게 맞음. password를 보내주면 안됨
            // email: user.email,
            nickname: user.nickname,
        },
    });
});

module.exports = router;