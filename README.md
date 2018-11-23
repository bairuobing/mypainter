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

 ### 成长迭代版本

- 线上交互画板功能

- 用canvas实现画板界面

  - 提高服务器吞吐性能

- 添加取色功能

- png格式保存减少传输数据量

- 采用二进制数据存储分发图片

- 增加取色指针工具的样式

* 增加指针样式，即时显示取色指针颜色
* 变更颜色选择的样式

- 增加放大和拖动功能

  - 鼠标指针指哪儿大哪儿（地图放大原理，不动点）

- 用相对位置修正误差

  - 鼠标相对于视口的位置 `-` 元素相对于视口的位置）`/` 缩放系数

- 增加在线人数功能

  - 向每个在线用户广播

- 增加坐标指示优化界面样式
- 移动端交互上线

###线上版本

- v0.1 
  - 部署到```boolebook.com```

## 使用

1. 安装依赖

   ```npm install```

2. 服务器运行

   ```pm2 start --name=xxx app.js```

3. 访问[mypainter](http://boolebook.com:9095)



## 个人信息

![](https://img.shields.io/badge/-WeChat-brightgreen.svg)bairuobing2013

![WCPP](https://img.shields.io/badge/-WeChat%20public%20platform-green.svg)boolebook



