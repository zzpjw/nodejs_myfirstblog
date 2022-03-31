const router = require("express").Router();
const authMiddleware = require("../middlewares/auth-middleware");
const Users = require("../models/user");
const jwt = require("jsonwebtoken");

//password hashing module
const crypto = require('crypto');

//Crypto 모듈의 randomBytes 메소드를 통해 salt를 반환하는 함수
const createSalt = () =>
    new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if (err) reject(err);
            resolve(buf.toString('base64'));
        });
    });


//salt를 사용해서 입력된 password를 해시화하는 함수
const createHashedPassword = (plainPassword) =>
    new Promise(async (resolve, reject) => {
        const salt = await createSalt();
        crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
            if (err) reject(err);
            resolve({hashPassword: key.toString('base64'), salt});
        });
    });

router.get("/basic", async (req, res) => {
    // #swagger.description = "기본 페이지"
    // #swagger.tags = ["User"]
    res.status(200).render('index', )
});

router.get("/register", async (req, res) => {
    // #swagger.description = "회원가입 페이지"
    // #swagger.tags = ["User"]
    res.status(200).render('register', )
});

router.post("/register", async (req, res) => {
    // #swagger.description = "회원가입 페이지 - 회원가입하기"
    // #swagger.tags = ["User"]
    const {nickname, password, confirmPassword} = req.body;
    //아이디 정규표현식 숫자, 영문 대소문자 필수 포함, 숫자와 영문 대소문자 사용 가능 3~20자리
    const regExp_nickname = /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{3,20}$/;
    if (!regExp_nickname.test(nickname)) {
        res.status(400).send({
            errorMessage: '닉네임의 형식을 확인해주세요. 영문과 숫자 필수 포함, 3-20자'
        });
        return;
    }
    // 패스워드 정규표현식 숫자, 영문 대소문자 필수 포함, 숫자와 영문 대소문자와 특수문자 사용 가능 4~20자리
    const regExp_password = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*]{4,20}$/;//()안에 내용은 필수 포함//'\d'는 숫자를 의미함//
    if (!regExp_password.test(password)) {
        res.status(400).send({
            errorMessage: '비밀번호의 형식을 확인해주세요. 영문과 숫자 필수 포함, 특수문자(!@#$%^&*) 사용 가능 4-20자'
        });
        return;
    }
    if (password.match(nickname)) {
        res.status(400).send({
            errorMessage: '비밀번호에 닉네임을 포함할 수 없습니다.'
        });
        return;
    }
    //nickname 중복 확인
    const existUsers = await Users.find({
        nickname,
    });
    if (existUsers.length) {
        res.status(400).send({
            errorMessage: '이미 가입된 닉네임이 있습니다.',
        });
        return;
    }
    //패스워드 확인
    if (password !== confirmPassword) {
        res.status(400).send({
            errorMessage: '패스워드가 패스워드 확인란과 동일하지 않습니다.'
        });
        return;
    }
    //hashing 적용하기, salt 만들기
    const {hashPassword, salt} = await createHashedPassword(password);
    // console.log("hashPassword, salt", hashPassword, salt)
    //새로운 user 객체 만들기
    const user = new Users({
        nickname,
        password: hashPassword,
        salt,
    });
    // console.log("user", user)
    await user.save();

    res.status(201).send({});
})

router.get("/login", async (req, res) => {
    // #swagger.description = "로그인 페이지"
    // #swagger.tags = ["User"]
    res.status(200).render('login', )
});

router.post("/login", async (req, res) => {
    // #swagger.description = "로그인 페이지 - 로그인하기"
    // #swagger.tags = ["User"]
    const { nickname, password } = req.body;
    //닉네임 입력하지 않았을 때
    if (nickname === "") {
        res.status(400).send({
            errorMessage: '닉네임을 입력하세요.'
        });
        return;
    }
    //패스워드 입력하지 않았을 때
    if (password === "") {
        res.status(400).send({
            errorMessage: '패스워드를 입력하세요.'
        });
        return;
    }
    const [existsUser] = await Users.find({nickname})
    // console.log([existsUser])
    if (existsUser === undefined) {
        res.status(400).send({
            errorMessage: '존재하지 않는 닉네임입니다.'
        });
        return;
    }
    //기존 경로에 맞는 DB의 salt를 가져와서 입력된 plainPassword와 조합하는 함수
    const makePasswordHashed = (plainNickname, plainPassword) =>
        new Promise(async (resolve, reject) => {
            // salt를 가져오는 부분은 각자의 DB에 따라 수정
            // [existsBoard]는 항이 하나만 있는 배열이다.
            // console.log([existsUser][0].salt);
            // console.log(plainPassword)
            crypto.pbkdf2(plainPassword, [existsUser][0].salt, 9999, 64, 'sha512', (err, key) => {
                if (err) reject(err);
                resolve(key.toString('base64'));
            });
        });
    //해시화 함수 사용
    const hashPassword = await makePasswordHashed(nickname, password);
    // console.log(password, hashPassword)
    const user = await Users.findOne({ nickname, password: hashPassword }).exec();
    // console.log(user)
    if (!user) {
        res.status(400).send({
            errorMessage: '잘못된 패스워드입니다.'
        });
        return;
    }
    // console.log("userId", user.userId)

    const token = jwt.sign({ userId: user.userId }, process.env.SECRET_KEY);
    // console.log(token)
    res.send({
        token,
    });
});

//핸들러 앞에 authMiddleware를 붙이지 않으면 문제가 발생함.
router.get("/users/me", authMiddleware, async (req, res) => {
    // #swagger.description = "로그인 여부 확인"
    // #swagger.tags = ["User"]
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