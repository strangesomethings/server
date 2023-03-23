require("dotenv").config()
const express = require("express")
const http = require("http")
const app = express()
app.set('port',process.env.PORT)
const server = http.createServer(app)
const PORT = process.env.PORT
app.use(express.urlencoded({extended: true}))
const cors = require("cors")
// const test = require('./test/test')
// app.use("/",test)
app.use(cors({
    origin: 'localhost:3000',//여기 클라이언트쪽 포트 적기.
    Credential: 'true'
}))
const SocketIO = require('./socket/socket.js')
SocketIO(server)
server.listen(PORT, () => console.log(`서버 열기 성공!, 포트: ${PORT}`))