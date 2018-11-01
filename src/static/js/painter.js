const app = new Vue({
    el: '#app',
    data: {
        pixelData: [],
        commonColors: ["#000000", "#ffffff", "#aaaaaa", "#555555", "#faac8e", "#ff8b83", "#f44336", "#e91e63", "#e2669e", "#9c27b0", "#673ab7", "#3f51b5", "#004670", "#057197", "#2196f3", "#00bcd4", "#3be5db", "#97fddc", "#167300", "#37a93c", "#89e642", "#d7ff07", "#fff6d1", "#f8cb8c", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#b83f27", "#795548"],
        color: '#000000',
        width: 512,
        height: 512,
        isPickingColor: false,
        zoomFactor: 1,
        onlineCount: 0,
        currSite: {x:'_',y:'_'}
    },
    methods: {
        // 坐标获取
        getSite: function(e) {
            let {x, y} = this.getMousePosition(e)
            this.currSite.x = x
            this.currSite.y = y
            let canvas = this.$refs.canvas
            canvas.addEventListener('mouseout', (e)=> {
                this.currSite.x = '_'
                this.currSite.y = '_'
            })
        },
        // 拖拽
        prepareDrag: function (e) {
            // 由于click 与 move 事件有冲突，设置标志确定是否发生移动
            let moved = false
            // 绑定 mousemove 和 mouseup 俩事件
            let canvas = this.$refs.canvas
            // 不要用放大过的位置
            let startX = e.clientX
            let startY = e.clientY
            // 去下标
            let posX = parseInt(canvas.style.left)
            let posY = parseInt(canvas.style.top)
            // 定义在外层作用域的变量用来解绑或者绑定事件
            let moveHandler
            let upHandler
            canvas.addEventListener('mousemove', moveHandler = e => {
                let currX = e.clientX
                let currY = e.clientY
                let diffX = currX - startX
                let diffY = currY - startY
                if (diffX > 3 || diffY > 3) {
                    moved = true
                }
                canvas.style.left = posX + diffX + 'px'
                canvas.style.top = posY + diffY + 'px'
            })

            canvas.addEventListener('mouseup', upHandler = e => {
                var currX = e.clientX
                var currY = e.clientY
                var diffX = currX - startX
                var diffY = currY - startY
                if (Math.sqrt(diffX ** 2 + diffY ** 2) > 3) {
                    moved = true
                }
                canvas.removeEventListener('mousemove', moveHandler)
                canvas.removeEventListener('mouseup', upHandler)

                if (!moved) {
                    this.handleCanvasClick(e)
                }
            })
        },
        // 制作一个去色箭头指针
        makeCursorImg: function (color) {
            var cursor = document.createElement('canvas')
            var ctx = cursor.getContext('2d')
            cursor.width = 41
            cursor.height = 41

            ctx.beginPath()
            ctx.lineWidth = 2
            ctx.strokeStyle = '#000000'
            ctx.moveTo(0, 6)
            ctx.lineTo(12, 6)
            ctx.moveTo(6, 0)
            ctx.lineTo(6, 12)
            ctx.stroke()

            ctx.beginPath()
            ctx.arc(25, 25, 14, 0, 2 * Math.PI, false)
            ctx.lineWidth = 2
            ctx.strokeStyle = '#000000'
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(25, 25, 13.4, 0, 2 * Math.PI, false)
            ctx.fillStyle = color
            ctx.fill()

            // document.getElementById('canvas').style.cursor = 'crosshair'
            // document.getElementById('canvas').style.cursor = 'url(' + cursor.toDataURL() + ') 6 6, crosshair'

            return cursor.toDataURL()
        },
        updateCursor: function (e) {
            let color = this.getCurrHoverColor(e)
            let cursorUrl = this.makeCursorImg(color)
            // refs Vue自带的准确元素集
            this.$refs.canvas.style.cursor = `url(${cursorUrl}) 6 6, crosshair`
        },
        startPickingColor: function () {
            this.isPickingColor = true
            // 给 canvas绑定事件“当鼠标移动触发去色指针样式”
            this.$refs.canvas.addEventListener('mousemove', this.updateCursor)
        },
        // 用于功能分发
        handleCanvasClick: function (e) {
            if (this.isPickingColor) {
                this.pickColor(e)
            } else {
                this.drawDot(e)
            }
        },
        // rgb值转16进制
        rgba2hex: function (dot) {
            var arr = []
            arr.push(dot[0])
            arr.push(dot[1])
            arr.push(dot[2])
            // dot = dot.map(it => {
            //     it.toString(16).padStart(2, '0')
            // })

            var dot = arr.map(it => it.toString(16).padStart(2, '0'))
            // console.log(dot)
            return '#' + dot[0] + dot[1] + dot[2]
        },
        getCurrHoverColor: function (e) {
            // 更加精准的 canvas像素坐标，不会因为放大缩小而改变实际坐标
            var { x, y } = this.getMousePosition(e)
            // 如何获取 canvas 的颜色，获取之后是一串数组（RGBA）
            let p = this.ctx.getImageData(x, y, 1, 1).data
            let hexColor = this.rgba2hex(p)
            return hexColor
        },
        pickColor: function (e) {
            let hexColor = this.getCurrHoverColor(e)
            this.color = hexColor
            // 选取结束置为 false
            this.isPickingColor = false
            this.$refs.canvas.removeEventListener('mousemove', this.updateCursor)
            this.$refs.canvas.style.cursor = ``
        },
        // 得到鼠标指针相对于canvas的位置
        getMousePosition(e) {
            // 坐标有误差，在发送时作出修正
            let clientX = e.clientX // 相对于视口
            let clientY = e.clientY
            // getBoundingclientRect 也相对于视口，与clientX 作差即误差（并除以系数处理）
            let rect = this.$refs.canvas.getBoundingClientRect()
            // 正数浮点数与0 或运算 取整
            let x = (clientX - rect.left) / this.zoomFactor | 0
            let y = (clientY - rect.top) / this.zoomFactor | 0
            return { x, y }

        },
        getMousePositionCanvas(e) {
            // 坐标有误差，在发送时作出修正
            let clientX = e.clientX // 相对于视口
            let clientY = e.clientY
            // getBoundingclientRect 也相对于视口的 CSS坐标（top，left，bottom，right），做差便是相对于该元素
            let rect = this.$refs.canvas.getBoundingClientRect()
            // 正数浮点数与0 或运算 取整
            let x = (clientX - rect.left) | 0
            let y = (clientY - rect.top) | 0
            return { x, y }
        },
        drawDot: function (e) {
            var { x, y } = this.getMousePosition(e)
            console.log('(' + x + ',' + y + ')')
            // 该函数参数表示(绑定的)鼠标点击事件（e），通过事件来追踪其点击的像素坐标
            this.ws.send(JSON.stringify({
                type: 'drawDot',
                x: x,
                y: y,
                color: this.color
            }))
        },
        // Vue HTML标签属性不区分大小写，所以带有大小写区别的事件不应在标签处绑定
        // 放大, 放大后的相对指针位置与放大前的相对指针位置是始终不变的
        initZoom: function (e) {
            let canvas = this.$refs.canvas
            let wrapper = this.$refs.wrapper
            wrapper.addEventListener('mousewheel', (e) => {
                // 初始倍数（不一定为1）
                let preFactor = this.zoomFactor
                // 缩放之前的指针 相对 位置（缩放之后绝对位置应该在这个位置）
                let { x, y } = this.getMousePositionCanvas(e)
                let posX = parseInt(canvas.style.left)
                let posY = parseInt(canvas.style.top)
                // console.log("图像原始css坐标"+ posX,posY)
                e.preventDefault()
                if (e.deltaY < 0) {
                    this.zoomFactor = this.zoomFactor * 1.25
                } else {
                    this.zoomFactor = this.zoomFactor * 0.8
                }
                if (this.zoomFactor < 1) {
                    this.zoomFactor = 1
                    canvas.style.top = '0px'
                    canvas.style.left = '0px'
                } else if (this.zoomFactor > 25) {
                    this.zoomFactor *= 0.8
                }
                let mtp = this.zoomFactor / preFactor // 变化的倍数
                // 缩放后的指针 相对 坐标
                let cX = mtp * x
                let cY = mtp * y

                // 缩放中心（css设置为左上角(0,0)） 应当的位移(差值)
                let diffX = cX - x
                let diffY = cY - y
                // console.log('放大中心应当偏移'+ diffX, diffY)
                // console.log("相比于缩放前变化了" + mtp + "倍")
                canvas.style.top = (posY - diffY) + 'px'
                canvas.style.left = (posX - diffX) + 'px'
                if (this.zoomFactor == 1) {
                    // 当缩小到原图大小，应使整个图像保持在视野中
                    canvas.style.left = '0px'
                    canvas.style.top = '0px'
                }

                canvas.style.transform = `scale(${this.zoomFactor})`
            })
        }
    },
    mounted() {
        // 放大
        this.initZoom()
        var canvas = this.$refs.canvas
        // 去模糊
        canvas.style.imageRendering = 'pixelated'
        // 获取canvas 绘图上下文
        var ctx = canvas.getContext('2d')
        // 保存一份 ctx 在 this（Vue） 上，以备用
        this.ctx = ctx
        var ws = new WebSocket(`ws://${location.host}/yo`)
        this.ws = ws
        ws.onmessage = (e) => {//event
            // 接收到由ws发过来的 事件 messageEvent 中 blob 数据
            var data = e.data

            if (Object.prototype.toString.call(data) === '[object Blob]') {
                console.log('Blob图片载入完成')
                let tmpUrl = URL.createObjectURL(data)
                // console.log(tmpUrl)
                let image = new Image()
                // document.body.appendChild(image)
                image.src = tmpUrl
                // image 加载一张图片，加载完成后画在 canvas上
                image.onload = function () {
                    ctx.drawImage(image, 0, 0)
                }


            } else {
                data = JSON.parse(data)
                if (data.type == 'updateDot') {
                    ctx.fillStyle = data.color
                    ctx.fillRect(data.x, data.y, 1, 1)
                    // Vue.set(this.pixelData[data.y], data.x, data.color)
                } else if (data.type == 'onlineCount') {
                    let preCount = this.onlineCount
                    let currCount = data.count
                    if(currCount > preCount) {
                        console.log('一位玩家进入画室，当前在线人数 ' + this.onlineCount)    
                    } else {
                        console.log('一位玩家离开了，当前在线人数 ' + this.onlineCount)    
                    }
                    this.onlineCount = data.count
                }
            }
        }
    },
    components: {
        'picking': {
            template:'#picking',
        },
        'unpicking': {
            template:'#unpicking',
        }
    }
})