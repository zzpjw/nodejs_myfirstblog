//Import mongoose - 모델 구조를 필요로 함
const mongoose = require("mongoose");
//DB 연결 (app.js에서 connect 함수가 실행되면 -->)
const connect = () => {
    //mongoose를 통해서 mongodb 연결, undefined가 뜬다면 무시함.

    //******************************************몽고DB 아이디 패스워드****************************************
    const mongoId = process.env.MONGO_ID
    const mongoPw = process.env.MONGO_PW
    // console.log(mongoId, mongoPw);
    mongoose.connect(`mongodb://${mongoId}:${mongoPw}@localhost:27017/blogTest?authSource=admin&authMechanism=SCRAM-SHA-1`, { ignoreUndefined: true }).catch((err) => {
        console.log(err);
    });
};
//connect 함수를 app.js에서 사용할 수 있도록 exports
module.exports = connect;