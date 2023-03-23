const connection = require('../config/dbconfig')
const express = require("express")
const router = express.Router()
const moment = require("moment")
const cors = require("cors")
const corsOption = {
    "Access-Control-Allow_Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT",
    "Access-Control-Max-Age":"3600",
    "Access-Control-Allow-Headers":"Origin,Accept,X-Requested-With,Content-Type,Access-Control-Request-Method,Access-Control-Request-Headers,Authorization"
}
router.use(cors({
    origin: 'http://localhost:3000', // 출처 허용 옵션
    credential: 'true' // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
}));

router.post("/regist", (req,res) => {
    res.header(corsOption)
    const {name} = req.body
    let query = "select count(*)'dup' from user where id=?"
    let param = []
    connection.query(query,param,function(err, result, fields) {
        
    })
})