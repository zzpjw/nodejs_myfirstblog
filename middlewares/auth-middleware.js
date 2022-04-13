const jwt = require("jsonwebtoken");
const { User } = require("../models");

//jwt 토큰 모듈 미들웨어
module.exports = (req, res, next) => {
    //Bearer와 token을 받아옴
    // console.log(req.headers)
    const {authorization} = req.headers;
    // console.log(authorization)
    //String을 배열로 만들어서 Bearer와 token을 분리
    const [tokenType, tokenValue] = authorization.split(' ');
    // console.log(tokenType, tokenValue)
    if (!tokenValue || tokenType !== 'Bearer') {
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요',
        });
        return;
    }

    try {
        const { userId } = jwt.verify(tokenValue, process.env.SECRET_KEY);
        User.findByPk(userId).then((user) => {
            // if (!user){
            //     res.status(401).send({
            //         errorMessage: '로그인 후 사용하세요',
            //     });
            //     return;
            // }
            res.locals.user = user;
            //성공했을 때만 next로 다음 미들웨어에 넘겨준다.
            next();
        });
    } catch (error) {
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요',
        });
        return;
    }
}