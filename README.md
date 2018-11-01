# mypainter

![progress](http://progressed.io/bar/59?title=progress)	![wechat](https://img.shields.io/badge/WeChat-bairuobing2013-brightgreen.svg)
![tech](https://img.shields.io/badge/tech-canvas%20%7C%20WebSocket%20%7C%20express%20%7C%20socket.io%20%7C%20Buffer%20%7C%20pixel%20manipulation-red.svg)



## 技术

- canvas
- WebSocket
- express
- socket.io
- Buffer
- pixel manipulation



## 版本

### v1.0 线上交互画板功能



### v2.0 用canvas实现画板界面

* 提高服务器吞吐性能

### v2.1 添加取色功能



### v3.0 png格式保存减少传输数据量



### v3.1 采用二进制数据存储分发图片



### v3.2 增加取色指针工具的样式

* 增加指针样式，即时显示取色指针颜色
* 变更颜色选择的样式

### v4.0 增加放大和拖动功能



###v4.1 误差修正

* 鼠标相对于视口的位置 `-` 鼠标相对于元素的位置）`/` 缩放系数



### v4.2 增加在线人数功能

* 向每个在线用户广播

## 使用

1. 安装依赖

   ```npm install```

2. 服务器运行

   ```pm2 start --name=xxx app.js```

3. 访问```boolebook.com:9095```