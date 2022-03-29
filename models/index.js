//Import mongoose - 모델 구조를 필요로 함
const mongoose = require("mongoose");
//DB 연결 (app.js에서 connect 함수가 실행되면 -->)
const connect = () => {
    //mongoose를 통해서 mongodb 연결, undefined가 뜬다면 무시함.
    mongoose.connect("mongodb://localhost:27017/blogTest", { ignoreUndefined: true }).catch((err) => {
        console.log(err);
    });
};
//connect 함수를 app.js에서 사용할 수 있도록 exports
module.exports = connect;