
const Boards = require("../schemas/board");
const router = require("express").Router();

// req, res 서버의 입장에서 생각!
// request 모두 프론트 쪽에서 넘어온 것(유저의 행위는 모두 request)
// response 내가 프론트로 넘겨주는 것.

//글 목록
router.get("/", async (req, res) => {
    const boardsList = await Boards.find().sort({createDate: -1});
    res.status(200).render('index', {boardsList})
});

//글 작성 페이지
router.post("/posting", async (req, res) => {
    const { title, username, password, content } = req.body;
    const date = Date.now()
    console.log(title, username, password, content)

    const maxIndexByBoardIdx = await Boards.findOne().sort('-boardIdx').exec();
    console.log("maxIndexByBoardIdx", maxIndexByBoardIdx)
    const maxBoardIdx = maxIndexByBoardIdx ? maxIndexByBoardIdx.boardIdx + 1 : 1;
    console.log("maxBoardIdx", maxBoardIdx)
    await Boards.create({
        title,
        username,
        password,
        content,
        createDate: date,
        boardIdx: maxBoardIdx,
    });

    res.status(200).json({ result: "success" })
});

//글쓰기 페이지
router.get("/posting", async (req, res)=>{
    res.status(200).render('posting')
});

//글 상세 조회
router.get("/:boardIdx", async (req, res)=>{
    const { boardIdx } = req.params;
    console.log("보드 인덱스는 잘 뽑혔나?", boardIdx)
    const [posting] = await Boards.find({boardIdx: Number(boardIdx)})
    console.log("포스팅은 잘 뽑혔나?", posting)
    res.status(200).render('board',{posting,})
});

//글 상세 조회
router.get("/:boardIdx/rewrite", async (req, res)=>{
    const { boardIdx } = req.params;
    console.log("보드 인덱스는 잘 뽑혔나?", boardIdx)
    const [posting] = await Boards.find({boardIdx: Number(boardIdx)})
    console.log("포스팅은 잘 뽑혔나?", posting)
    res.status(200).render('rewrite',{posting,})
});

//수정하기
router.put("/:boardIdx/rewrite", async (req, res) => {
    const { title, username, password, content } = req.body;
    const { boardIdx } = req.params;
    const [existsBoard] = await Boards.find({ boardIdx: Number(boardIdx) })
    console.log(existsBoard.password)
    console.log("지금 수정하는거야!", boardIdx)
    const date = Date.now()
    if (existsBoard && (existsBoard.password === password) ) {
        await Boards.updateOne({ boardIdx: Number(boardIdx)}, {
                $set: {
                    title,
                    username,
                    password,
                    content,
                    createDate: date,
                    boardIdx: boardIdx
                }
            }
        );
    }
    res.status(200).json({ result: "success" })
});

//삭제하기
router.delete("/:boardIdx/rewrite", async (req, res) => {
    const { boardIdx } = req.params;
    console.log("보드 인덱스는 잘 뽑혔나?", boardIdx)
    const [existsBoard] = await Boards.find({ boardIdx: Number(boardIdx) })
    console.log("existsBoard 잘 뽑혔나?", existsBoard)
    console.log("existsBoard.password", existsBoard.password)
    console.log("req.body.password", req.body.password)
    if (existsBoard && (existsBoard.password === req.body.password) ) {
        await Boards.deleteOne({ boardIdx: Number(boardIdx) })
    }
    res.json({success:true});
});

module.exports = router;