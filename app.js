//Imports
const express = require("express");
const connect = require("./schemas");

const app = express();
const port = 3000;

//db연결
connect();

//routers
const boardsRouter = require("./routers/boards")

//ejs Templating Engine setting
app.set("view engine", "ejs");
app.set("views", __dirname+ "/views" )
// console.log(__dirname)//__dirname app.js의 현재 경로
app.engine('html', require('ejs').renderFile)

//default
app.use(express.json());
app.use(express.urlencoded({extended : false})); //아악코드 html을 통해서 넘겨줄 경우에 해석에 필요
app.use("/blog", [boardsRouter]);

//
app.get("/", function (req, res){
    res.redirect("/blog");
});


app.listen(port, () => {
    console.log(port, "포트로 서버가 켜졌어요!");
});
