const swaggerAutogen = require("swagger-autogen")();

const doc = {
    info: {
        title: "JIWON BLOG API",
        description: "Node.js first project",
    },
    tags: [
        {
            name: "User",
            description: "회원 기능"
        },
        {
            name: "Post",
            description: "글 작성 기능"
        },
        {
            name: "Comment",
            description: "댓글 기능"
        }
    ],
    host: "localhost:3000",
    schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = [
    "./app.js"
];

swaggerAutogen(outputFile, endpointsFiles, doc);