//dotenv 키값 보안
require('dotenv').config();
//Imports
const express = require("express");

//CORS
const cors = require('cors');

// //xss security Import 라이브러리? 사용을 해야하는가? 예외처리 방식이 복잡.. 이해가 필요할듯
// const helmet = require("helmet");

const app = express();
const port = 3000;

//swagger
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output");
app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerFile));

//CORS 실행
app.use(cors());

//routers
const boardsRouter = require("./routers/boards");
const usersRouter = require("./routers/users");

//ejs Templating Engine setting
app.set("view engine", "ejs");
app.set("views", __dirname+ "/views" )
// console.log(__dirname)//__dirname == app.js의 현재 경로
// app.engine('html', require('ejs').renderFile) //html 파일을 ejs 파일로 읽기 위해 필요함.

//default
app.use(express.json());
app.use(express.urlencoded({extended : false})); //아악코드 html을 통해서 서버로 넘겨줄 경우때 해석에 필요
app.use("/auth", [usersRouter]);
app.use("/blog", [boardsRouter]);


// //xss security use
// app.use(helmet({contentSecurityPolicy: false}));

//기본 ip주소로 들어오면 /blog로 바로 연결
app.get("/", function (req, res){
    res.redirect("/blog");
});

//http 서버 실행
app.listen(port, () => {
    console.log(port, "포트로 서버가 켜졌어요!");
});
