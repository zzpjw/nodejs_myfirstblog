const Boards = require("../models/board");
const Comments = require("../models/comment")
const router = require("express").Router();
const authMiddleware = require("../middlewares/auth-middleware");

// req, res 서버의 입장에서 생각!//
// request 모두 프론트 쪽에서 넘어온 것(유저의 행위는 모두 request)//
// response 내가 프론트로 넘겨주는 것.//

router.get("/" , async (req, res) => {
    // #swagger.description = "글 목록 페이지(기본)"
    // #swagger.tags = ["Post"]
    //createDate를 역순으로 정렬해서 최신순 목록 정렬함
    const boardsList = await Boards.find().sort({createDate: -1});
    res.status(200).render('board', {boardsList})
});

router.get("/posting", async (req, res) => {
    // #swagger.description = "글 작성 페이지"
    // #swagger.tags = ["Post"]
    res.status(200).render('posting')
});

router.post("/posting", authMiddleware, async (req, res) => {
    // #swagger.description = "글 작성 페이지 - 글 작성하기"
    // #swagger.tags = ["Post"]
    const {title, content} = req.body;
    const {user} = res.locals;
    if (title === "" || content === "") {
        res.status(400).send({
            errorMessage: '컨텐츠가 부족합니다.'
        });
        return;
    }
    // ******************************************************************************************
    // console.log(user.nickname);
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
        username: user.nickname,
        content,
        createDate: date,
        boardIdx: maxBoardIdx,
    });

    res.status(201).json({result: "success"})
});

router.get("/:boardIdx" , async (req, res) => {
    // #swagger.description = "글+댓글 상세 조회 페이지"
    // #swagger.tags = ["Post", "Comment"]
    const {boardIdx} = req.params;
    // console.log("보드 인덱스는 잘 뽑혔나?", boardIdx)
    const [posting] = await Boards.find({boardIdx: Number(boardIdx)})
    // console.log("포스팅은 잘 뽑혔나?", posting)
    const commentsList = await Comments.find({boardIdx: Number(boardIdx)}).sort({commentIdx: -1})
    // console.log("comment 잘 뽑혔나?", commentsList)
    res.status(200).render('post', {posting, commentsList})
});

router.post("/:boardIdx/comment", authMiddleware , async (req, res) => {
    // #swagger.description = "글+댓글 상세 조회 페이지 - 댓글 쓰기"
    // #swagger.tags = ["Comment"]
    const {comment} = req.body;
    const {boardIdx} = req.params
    const {user} = res.locals;
    if (comment === "") {
        res.status(400).send({
            errorMessage: '컨텐츠가 존재하지 않습니다.'
        });
        return;
    }
    //commentIdx 최신순 정렬
    const maxIndexByCommentIdx = await Comments.findOne().sort('-commentIdx').exec();
    //기존 boardIdx 값이 삭제되더라도 겹치는 boardIdx 값이 생기지 않도록. 만약 글이 없다면 1.
    const maxCommentIdx = maxIndexByCommentIdx ? maxIndexByCommentIdx.commentIdx + 1 : 1;

    // console.log("DB로 들어갈 데이터 목록", username, comment, commentIdx, boardIdx)

    await Comments.create({
        username: user.nickname,
        comment,
        commentIdx: maxCommentIdx,
        boardIdx,
    });

    res.status(201).json({result: "success"})
});

router.delete("/comment/:commentIdx", authMiddleware , async (req, res) => {
    // #swagger.description = "글+댓글 상세 조회 페이지 - 댓글 삭제하기"
    // #swagger.tags = ["Comment"]
    const {commentIdx} = req.params;
    // console.log("existsBoard 잘 뽑혔나?", existsBoard)
    await Comments.deleteOne({commentIdx: Number(commentIdx)})
    res.json({success: true});
});

router.patch("/comment/:commentIdx", authMiddleware , async (req, res) => {
    // #swagger.description = "글+댓글 상세 조회 페이지 - 댓글 수정하기"
    // #swagger.tags = ["Comment"]
    const {comment} = req.body
    const {commentIdx} = req.params;
    // console.log("existsBoard 잘 뽑혔나?", existsBoard)
    await Comments.updateOne({commentIdx: Number(commentIdx)}, {
        $set: {
            comment: comment
    }})
    res.status(200).json({result: "success"});
});

router.get("/:boardIdx/rewrite" , async (req, res) => {
    // #swagger.description = "글 수정 페이지"
    // #swagger.tags = ["Post"]
    const {boardIdx} = req.params;
    // console.log("보드 인덱스는 잘 뽑혔나?", boardIdx)
    const [posting] = await Boards.find({boardIdx: Number(boardIdx)})
    // console.log("포스팅은 잘 뽑혔나?", posting)
    res.status(200).render('rewrite', {posting})
});

router.put("/:boardIdx/rewrite", authMiddleware , async (req, res) => {
    // #swagger.description = "글 수정 페이지 - 글 수정하기"
    // #swagger.tags = ["Post"]
    const {title, content} = req.body;
    const {boardIdx} = req.params;
    const [existsBoard] = await Boards.find({boardIdx: Number(boardIdx)})
    const {user} = res.locals;
    // console.log("지금 수정하는거야!", boardIdx)

    //************************************업데이트 예정****************************************
    const date = Date.now()

    //기존 보드에서 가져온 password와 해시화 시킨 req의 비밀번호 비교
    if (existsBoard && existsBoard.username === user.nickname) {
        await Boards.updateOne({boardIdx: Number(boardIdx)}, {
                $set: {
                    title,
                    username:user.nickname,
                    content,
                    createDate: date,
                    boardIdx: boardIdx
                }
            }
        );
    }
    res.status(200).json({result: "success"})
});

router.delete("/:boardIdx/rewrite", authMiddleware , async (req, res) => {
    // #swagger.description = "글 수정 페이지 - 글 삭제하기"
    // #swagger.tags = ["Post"]
    const {boardIdx} = req.params;
    // console.log("보드 인덱스는 잘 뽑혔나?", boardIdx)
    const {user} = res.locals;
    const [existsBoard] = await Boards.find({boardIdx: Number(boardIdx)})
    // console.log("existsBoard 잘 뽑혔나?", existsBoard)
    if (existsBoard && existsBoard.username === user.nickname) {
        await Boards.deleteOne({boardIdx: Number(boardIdx)})
        await Comments.deleteMany({boardIdx: Number(boardIdx)})
    }
    res.json({success: true});
});

module.exports = router;