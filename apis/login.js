const con = require('../config/dbconfig')
const connection = con.promise()
const express = require("express")
const router = express.Router()
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt_auth = require('../middleware/jwt_auth')
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
router.post("/login", async (req, res) => {
  res.header(corsOption)
  const { id, pw } = req.body
  let query = "select password from auth where id=?;"
  try {
    const [result] = await connection.execute(query, [id])
    if (result.length > 0) {
      const verification = await new Promise((resolve, reject) => {
        bcrypt.compare(pw, result[0].password, (err, same) => {
          if (err) {
            reject(err)
          } else {
            resolve(same)
          }
        })
      })
      if (verification === false) {
        return res.status(401).json({ suceed: false, message: '아이디 또는 비밀번호를 확인하세요.' })
      }
      res.json({ suceed: true, message: '로그인 성공!' })
    } else {
      res.status(401).json({ suceed: false, message: '해당 아이디가 존재하지 않습니다.' })
    }
  } catch (err) {
    console.log(err)
    res.status(401).json({ suceed: true, message: '서버 오류 발생!' })
  }
})
  // 로그인 엔드포인트
router.post('/logintest', async (req, res) => {
  const { username, password } = req.body;

  
});
module.exports = router