const http = require('http')
const fs = require('fs')
const ws = require('ws')
const path = require('path')
const express = require('express')
const Jimp = require('jimp')
const port = 9095

const app = express()
const server = http.createServer(app)
const wss = new ws.Server({server})

const width = 256
const height = 256

main()

// require就可以直接读取文件内的内容并 parse
let img 
async function main() {
    try {
        img = await Jimp.read(path.join(__dirname, './virginalImg.png'))
    } catch (error) {
        // 使用 jimp 生成白色图片
        img = new Jimp(256, 256, 0xffffffff)
    }
    
    // 不断的将数据以文件的形式保存下来记录（服务器挂掉不会影响数据）
    setInterval(() => {
        img.write(path.join(__dirname, './processedImg.png'), () => {
            console.log('data of img.png saved!')
        })
    },3000)
    // 用websocket通信
    wss.on('connection', (ws, req) => {
        img.getBuffer(Jimp.MIME_PNG, (err, buf) => {
            if(err) {
                console.log('err', err)
            } else {
                ws.send(buf)
            }
        })
        // 当服务器把数据发送过去以后立马再监听客户端 的消息
        // 每一次链接中不应该使得消息无间断发送，指定一个时间间隔
        let lastDraw = 0 // 最后一次戳点时间戳
        ws.on('message', msg => {
            msg = JSON.parse(msg)
            // 解构赋值
            var {x, y, color} = msg
            if(msg.type == 'drawDot'){
                let now = Date.now()
                // 如果一次连接中的两次消息间隔小于 200ms 则不允许再次发送
                if (now - lastDraw < 200) {
                    return
                }
                // 不能超出画板长宽范围
                if (x >= 0 && y >= 0 && x < width && y < height) {
                    lastDraw = now // 更新lastDraw
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
    )})
    
    app.use(express.static(path.join(__dirname, './static')))
    
    server.listen(port, () => {
        console.log('listening on port ', port)
    })
}