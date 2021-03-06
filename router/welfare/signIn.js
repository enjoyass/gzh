var Token =require('../cognate/token')
var opts=require('../../config/config').wechat
var authInfo=require('../../config/config').authToken
var visitUrl=require('../../config/config').visit_url
var request=require('request');
var Promise=require('promise')
var Moment=require('moment');

module.exports=function(router){
	var tokenApi=new Token(opts);
    router.get('/page',function(req,res){
        var url='https://open.weixin.qq.com/connect/oauth2/authorize?appid='+opts.appID+'&redirect_uri='+authInfo.signIn_url+'&response_type=code&scope='+authInfo.scope+'&state='+authInfo.state+'#wechat_redirect'
        res.redirect(url);
    })
    router.get('/signIn',function(req,res){
        var code =req.query.code;
        tokenApi.getAuthToken(code).then(function(data){
            var _data=data;
			  global.DBManager.wechatUserInfo.findOne({where:{openId:_data.openid}}).then(function(result){
                if(!result){
                    return Promise.resolve(false);
                }else{
                    return Promise.resolve(result);
                }
            }).then(function(data1){
                if(data1.uid && data1.openId  && data1.info){
                  	global.DBManager.wechatSignInAward.findAll().then(function(result){
						var AwardArr=result[0].dataValues;
						var getTime=Moment(new Date()).format("YYYY-MM-DD");
						global.DBManager.wechatSignInAwardRecord.findOne({where:{uid:data1.uid,openId:data1.openId,getTime:getTime}}).then(function(result){
							if(!result){
								var isGet=false;
    		                    res.render('signIn.html',{uid:data1.uid,openId:data1.openId,AwardArr:AwardArr,isGet:isGet});
								return;
							}
							var isGet=true;
                            res.render('signIn.html',{uid:data1.uid,openId:data1.openId,AwardArr:AwardArr,isGet:isGet});
						}).catch(function(err){
							 res.render('404.html');	
						})
					}).catch(function(err){
						res.render('404.html');
					})
                }else{
					res.render('goBind.html',{url:visitUrl.code});
                }
            }).catch(function(err){
                res.status(404);
                res.render('404.html');
            })
        })
    })
	router.post('/getAward',function(req,res){
		var data=req.body;
		console.dir(data);
		data.getTime=Moment(new Date()).format("YYYY-MM-DD");
		global.DBManager.wechatSignInAwardRecord.create(data).then(function(result){
			res.json({
				errcode:'0',
				errMsg:'OK'
			})
		}).catch(function(err){
			console.log(err)
			res.json({
				errcode:'2001',
				errMsg:'database error,create failed'
			})
		})
	})
    return router
}
