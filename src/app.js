const http = require('http')
const fs = require('fs')
const ws = require('ws')
const path = require('path')
const express = require('express')
const port = 9095

const app = express()
const server = http.createServer(app)
const wss = new ws.Server({server})

const width = 70
const height = 70
// require就可以直接读取文件内的内容并 parse
let pixelData
try {
    pixelData = require('./pixel.json')
} catch (error) {
    pixelData = new Array(height).fill(0).map(it => new Array(width).fill('white'))
}

// 不断的将数据以文件的形式保存下来记录（服务器挂掉不会影响数据）
setInterval(() => {
    fs.writeFile(path.join(__dirname, './pixel.json'), JSON.stringify(pixelData), (err) => {
        console.log('data saved!')
    })
},3000)
// 用websocket通信
wss.on('connection', (ws, req) => {
    ws.send(JSON.stringify({
        pixelData: pixelData,
        type: 'init'
    }))
    // 当服务器把数据发送过去以后立马再监听客户端 的消息
    // 每一次链接中不应该使得消息无间断发送，指定一个时间间隔
    let lastDraw = 0 // 最后一次戳点时间戳
    ws.on('message', msg => {
        msg = JSON.parse(msg)
        // 解构赋值
        // var {x, y, color} = msg
        let now = Date.now()
        // 如果一次连接中的两次消息间隔小于 200ms 则不允许再次发送
        if (now - lastDraw < 200) {
            return
        }
        // 不能超出画板长宽范围
        if (msg.x > 0 && msg.y > 0 && msg.x < width && msg.y < height) {
            lastDraw = now // 更新lastDraw
            if(msg.type == 'drawDot'){
                pixelData[msg.y][msg.x] = msg.color
                // wss clients 对所有客户端发送更新
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({
                        type: 'updateDot',
                        x: msg.x,
                        y: msg.y,
                        color: msg.color
                    }))
                })
            }
        }
    }
)})

app.use(express.static(path.join(__dirname, './static')))

server.listen(port, () => {
    console.log('listening on port ', port)
})