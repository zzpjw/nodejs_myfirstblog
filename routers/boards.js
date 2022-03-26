const Boards = require("../models/board");
const router = require("express").Router();
const authMiddleware = require("../middlewares/auth-middleware");

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

// req, res 서버의 입장에서 생각!//
// request 모두 프론트 쪽에서 넘어온 것(유저의 행위는 모두 request)//
// response 내가 프론트로 넘겨주는 것.//

//글 목록 페이지(기본)
router.get("/" , async (req, res) => {
    //createDate를 역순으로 정렬해서 최신순 목록 정렬함
    const boardsList = await Boards.find().sort({createDate: -1});
    res.status(200).render('board', {boardsList})
});

//글 작성 페이지
router.get("/posting" , async (req, res) => {
    res.status(200).render('posting')
});

//글 작성
router.post("/posting" , async (req, res) => {
    const {title, username, password, content} = req.body;
    //hashing 적용하기, salt 만들기
    const {hashPassword, salt} = await createHashedPassword(password);
    //boards 최신순 정렬
    const maxIndexByBoardIdx = await Boards.findOne().sort('-boardIdx').exec();
    //기존 boardIdx 값이 삭제되더라도 겹치는 boardIdx 값이 생기지 않도록. 만약 글이 없다면 1.
    const maxBoardIdx = maxIndexByBoardIdx ? maxIndexByBoardIdx.boardIdx + 1 : 1;

    //************************************업데이트 예정****************************************
    const date = Date.now()

    // console.log("DB로 들어갈 데이터 목록", title, username, hashPassword, salt, content, date, maxBoardIdx)
    // console.log("maxIndexByBoardIdx", maxIndexByBoardIdx)

    await Boards.create({
        title,
        username,
        password: hashPassword,
        salt,
        content,
        createDate: date,
        boardIdx: maxBoardIdx,
    });

    res.status(200).json({result: "success"})
});

//글 상세 조회 페이지
router.get("/:boardIdx" , async (req, res) => {
    const {boardIdx} = req.params;
    // console.log("보드 인덱스는 잘 뽑혔나?", boardIdx)
    const [posting] = await Boards.find({boardIdx: Number(boardIdx)})
    // console.log("포스팅은 잘 뽑혔나?", posting)
    res.status(200).render('post', {posting,})
});

//수정하기 페이지
router.get("/:boardIdx/rewrite" , async (req, res) => {
    const {boardIdx} = req.params;
    // console.log("보드 인덱스는 잘 뽑혔나?", boardIdx)
    const [posting] = await Boards.find({boardIdx: Number(boardIdx)})
    // console.log("포스팅은 잘 뽑혔나?", posting)
    res.status(200).render('rewrite', {posting,})
});

//수정하기
router.put("/:boardIdx/rewrite" , async (req, res) => {
    const {title, username, password, content} = req.body;
    const {boardIdx} = req.params;
    const [existsBoard] = await Boards.find({boardIdx: Number(boardIdx)})
    // console.log(existsBoard.password)
    // console.log("지금 수정하는거야!", boardIdx)
    //hashing 적용하기
    const { rewritePassword } = await createHashedPassword(password);

    //기존 경로에 맞는 DB의 salt를 가져와서 입력된 plainPassword와 조합하는 함수
    const makePasswordHashed = (Idx, plainPassword) =>
        new Promise(async (resolve, reject) => {
            // salt를 가져오는 부분은 각자의 DB에 따라 수정
            // [existsBoard]는 항이 하나만 있는 배열이다.
            crypto.pbkdf2(plainPassword, [existsBoard][0].salt, 9999, 64, 'sha512', (err, key) => {
                if (err) reject(err);
                resolve(key.toString('base64'));
            });
        });
    //[existsBoard]는 배열임. 따라서 배열의 첫 항의 특정 key값을 얻기 위해 [0]포함
    const existSalt = [existsBoard][0].salt
    //해시화 함수 사용
    const hashPassword = await makePasswordHashed(boardIdx, password);

    //************************************업데이트 예정****************************************
    const date = Date.now()

    //기존 보드에서 가져온 password와 해시화 시킨 req의 비밀번호 비교
    if (existsBoard && (existsBoard.password === hashPassword)) {
        await Boards.updateOne({boardIdx: Number(boardIdx)}, {
                $set: {
                    title,
                    username,
                    password: rewritePassword,
                    salt: existSalt,
                    content,
                    createDate: date,
                    boardIdx: boardIdx
                }
            }
        );
    }
    res.status(200).json({result: "success"})
});

//삭제하기
router.delete("/:boardIdx/rewrite" , async (req, res) => {
    const {boardIdx} = req.params;
    // console.log("보드 인덱스는 잘 뽑혔나?", boardIdx)
    const [existsBoard] = await Boards.find({boardIdx: Number(boardIdx)})
    // console.log("existsBoard 잘 뽑혔나?", existsBoard)

    //기존 경로에 맞는 DB의 salt를 가져와서 입력된 plainPassword와 조합하는 함수.
    const makePasswordHashed = (Idx, plainPassword) =>
        new Promise(async (resolve, reject) => {
            // salt를 가져오는 부분은 각자의 DB에 따라 수정
            //[existsBoard]는 배열임. 따라서 배열의 첫 항의 특정 key값을 얻기 위해 [0]포함
            // console.log([existsBoard][0].salt);
            crypto.pbkdf2(plainPassword, [existsBoard][0].salt, 9999, 64, 'sha512', (err, key) => {
                if (err) reject(err);
                resolve(key.toString('base64'));
            });
        });
    //입력된 패스워드를 기존 DB에 있던 salt와 합쳐서 해시화
    const hashPassword = await makePasswordHashed(boardIdx, req.body.password);
    // console.log(existsBoard.password, hashPassword);
    if (existsBoard && (existsBoard.password === hashPassword)) {
        await Boards.deleteOne({boardIdx: Number(boardIdx)})
    }
    res.json({success: true});
});

module.exports = router;