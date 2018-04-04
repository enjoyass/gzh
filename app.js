const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const ejs = require('ejs');
const app = express();
const router = express.Router();

const config = require('./config/config');
global.logger = require('./logger.js');
global.DBManager = require("./DBManager/DB.js")(config.DBConfig);

var wechatModule = require('./router/wechat/wechatMiddle')(router, config.wechat)
var menuRouter = require('./router/black/menuRouter')(router, config.wechat)
var tagRouter = require('./router/black/tagRouter')(router, config.wechat)
var userRouter = require('./router/black/userRouter')(router, config.wechat)
var userRouter = require('./router/black/userRouter')(router, config.wechat)
var authTokenRouter = require('./router/cognate/bindUid')(router)


app.set("view engine", 'ejs');
app.engine('html', ejs.renderFile);
app.set('views', __dirname + '/views');
app.use(express.static('public'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(multer());

app.use(wechatModule);
app.use('/menu', menuRouter);
app.use('/tag', tagRouter);
app.use('/user', userRouter);
app.use('/cognate', authTokenRouter);

app.get('/name', function(req, res) {
    res.send('aaaa')
})
app.listen(config.server.port, function() {
    console.log("server run at http://0.0.0.0:" + config.server.port);
});