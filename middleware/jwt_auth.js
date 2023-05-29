const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY

// JWT 인증 미들웨어
function verifyToken(req, res, next) {
  const {id, pw} = req.body
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ success: false, message: '토큰이 유효하지 않습니다.' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: '토큰 인증에 실패했습니다.' });
    }

    req.user = decoded;
    next();
  });
}

module.exports = { verifyToken };