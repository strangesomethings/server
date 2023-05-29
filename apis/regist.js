const con = require('../config/dbconfig')
const connection = con.promise()
const express = require("express")
const router = express.Router()
const moment = require("moment")
const cors = require("cors")
const bcrypt = require("bcrypt")
const corsOption = {
    "Access-Control-Allow_Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT",
    "Access-Control-Max-Age":"3600",
    "Access-Control-Allow-Headers":"Origin,Accept,X-Requested-With,Content-Type,Access-Control-Request-Method,Access-Control-Request-Headers,Authorization"
}
function createuuid() {
    const {v4: uuidv4} = require('uuid')
    const tokens = uuidv4().split('-')
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4]
}
router.use(cors({
    origin: 'http://localhost:3000', // 출처 허용 옵션
    credential: 'true' // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
}));


/** 닉네임 중복체크는 클라이언트에서 하도록 설정? 아직 모르겠다. */
router.post("/regist", async (req,res) => {
    res.header(corsOption)
    const { id, pw, name} = req.body
    try {
        const [dup_user] = await connection.query("select count(*)'dup' from auth where id=? or name=?;",[id,name])
        if(dup_user[0].dup > 0) {
            return res.status(401).json({suceed: false, message: '아이디나 닉네임이 이미 있습니다!'})
        }
        /** 암호화 해쉬 번호 바뀌면 로그인의 검증 해쉬 번호도 확인할 것!*/
        const hashedpw = await bcrypt.hash(pw, 10);
        const query = "insert into auth(uuid,id,password,name) values (?,?,?,?);"
        const uuid = createuuid()   
        const param = [uuid,id,hashedpw,name]
        await connection.query(query,param)
        res.json({suceed: true, message: '회원가입 완료!'})
    } catch (err) {
        console.log(err)
        res.status(401).json({suceed: true, message: '서버 오류 발생!'})
    }
}) 

router.get("/dupname",(req,res) => {
    res.header(corsOption)
    const {name} = req.query
    let query = "select count(*)'dup' from auth where name=?;"
    let param = [name]
    connection.query(query,param,function(err, result, fields) {
        if(err) {
            res.json({status: 400, message: err})
        }
        else{
            if(result[0].dup == 0) {
                res.json({status: 200, message: '닉네임 사용 가능'})
            }
            else{
                res.json({status: 401, message: '닉네임 중복'})
            }
        }
    })
})

router.get("/user",(req,res) => {
    res.header(corsOption)
    let query = "select * from auth;"
    connection.query(query,function(err, result, fields) {
        if(err) {
            res.json({status: 400, message: err})
        }
        else{
            res.json({status: 200, message: result})
        }
    })
})

module.exports = router