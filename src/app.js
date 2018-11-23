const http = require('http')
const fs = require('fs')
const ws = require('ws')
const path = require('path')
const express = require('express')
const Jimp = require('jimp')
const port = 1996

const app = express()
const server = http.createServer(app)
const wss = new ws.Server({ server })

const width = 512
const height = 512

main()

// require就可以直接读取文件内的内容并 parse
let img
async function main() {
    try {
        img = await Jimp.read(path.join(__dirname, './painterImg.png'))
    } catch (error) {
        // 使用 jimp 生成白色图片
        img = new Jimp(256, 256, 0xffffffff)
    }

    let lastUpdate = 0
    // 不断的将数据以文件的形式保存下来记录（服务器挂掉不会影响数据）
    setInterval(() => {
        console.log('pending...')
        let now = Date.now()
        // now是一直在变化的，只要某次画点更新之后的之间与本次时间接近则保存文件
        if (now - lastUpdate < 3000) {
            img.write(path.join(__dirname, './painterImg.png'), () => {
                console.log('data of img.png saved!', now)
            })
        }
    }, 3000)
    // 用websocket通信
    wss.on('connection', (ws, req) => {
        console.log('c -> s: OK')
        img.getBuffer(Jimp.MIME_PNG, (err, buf) => {
            if (err) {
                console.log('err', err)
            } else {
                ws.send(buf)
                console.log(buf)
            }
        })
        // 向每个在线用户发
        wss.clients.forEach(ws => {
            // 在线人数，人来发一次
            ws.send(JSON.stringify({
                type: 'onlineCount',
                count: wss.clients.size,
            }))
        })

        // 人走也发一次
        ws.on('close', () => {
            // 向每一个在线用户发送
            wss.clients.forEach(ws => {
                ws.send(JSON.stringify({
                    type: 'onlineCount',
                    count: wss.clients.size,
                }))
            })
        });
        // 当服务器把数据发送过去以后立马再监听客户端 的消息
        // 每一次链接中不应该使得消息无间断发送，指定一个时间间隔
        let lastDraw = 0 // 最后一次戳点时间戳
        ws.on('message', msg => {
            msg = JSON.parse(msg)
            // 解构赋值
            var { x, y, color } = msg
            if (msg.type == 'drawDot') {
                let now = Date.now()
                // 如果一次连接中的两次消息间隔小于 200ms 则不允许再次发送
                if (now - lastDraw < 200) {
                    return
                }
                // 不能超出画板长宽范围
                if (x >= 0 && y >= 0 && x < width && y < height) {
                    lastDraw = now // 更新lastDraw
                    lastUpdate = now //更新lastUpdate
                    img.setPixelColor(Jimp.cssColorToHex(color), x, y)
                    // wss clients 对所有客户端发送更新
                    wss.clients.forEach(client => {
                        client.send(JSON.stringify({
                            type: 'updateDot',
                            x, y, color
                        }))
                    })
                }
            }
        }
        )
    })
    
    app.use(express.static(path.join(__dirname, './static')))
    app.use(express.static(path.join(__dirname, '../src')))
    server.listen(port, () => {
        console.log('listening on port ', port)
    })
}