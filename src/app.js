const http = require('http')
const fs = require('fs')
const ws = require('ws')
const path = require('path')
const express = require('express')
const port = 9095

const app = express()
const server = http.createServer(app)
const wss = new ws.Server({server})
const pixelData = [['red','yellow'],['blue','green'],['blue','blue']]
//用websocket通信
wss.on('connection', (ws, req) => {
    ws.send(JSON.stringify({
        pixelData: pixelData,
        type: 'init'
    }))
    // 当服务器把数据发送过去以后立马再监听客户端 的消息
    ws.on('message', msg => {
        msg = JSON.parse(msg)
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
)})

app.use(express.static(path.join(__dirname, './static')))

server.listen(port, () => {
    console.log('listening on port ', port)
})