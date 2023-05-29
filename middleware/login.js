const con = require('../config/dbconfig')
const connection = con.promise()
//const {secretKey} = require('./config/config')
const secretKey = process.env.SECRET_KEY
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
/** jwt 토큰 발급 */
const generateToken = (payload) => {
  const token = jwt.sign(payload, secretKey,{ expiresIn: '1h' })
  return token
}
const auth_user = async (req,res, next) => {
    const { id, pw } = req.body
    try {
        const isvalid = await checkAccount(id,pw)
        if (isvalid) {
          const token = generateToken({id})
          req.token = token
          next()
        } else {
          return res.status(401).json({ suceed: false, message: '아이디 또는 비밀번호를 확인하세요.'})
        }
       
      } catch (err) {
        console.log(err)
        res.status(500).json({ suceed: true, message: '서버 오류 발생!' })
      }
}
/** 계정 비밀번호 확인 */
const checkAccount = async (id, pw) => {
    const [hashedpw] = await connection.execute('select password from auth where id=?;', [id])
    return bcrypt.compare(pw, hashedpw[0].password)
}