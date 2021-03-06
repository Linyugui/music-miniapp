const app = getApp();
var bsurl = require('../../utils/bsurl.js');
Page({
    data: {
        //判断小程序的API，回调，参数，组件等是否在当前版本可用。
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    onLoad: function () {
        var that = this;
        // 查看是否授权
        wx.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: function (res) {
                            //从数据库获取用户信息
                            that.queryUsreInfo();
                            //用户已经授权过
                            wx.switchTab({
                                url: '/pages/index/index'
                            })
                        }
                    });
                }
            }
        })
    },
    bindGetUserInfo: function (e) {
        if (e.detail.userInfo) {
            //用户按了允许授权按钮
            var that = this;
            //console.log('---------- index.js.bindGetUserInfo()  line:32()  e.detail.userInfo=');
            //console.dir(e.detail.userInfo);
            app.globalData.userInfo = e.detail.userInfo;
            wx.setStorageSync('userInfo',e.detail.userInfo);
            //插入登录的用户的相关信息到数据库
            wx.request({
                url: bsurl + 'user/update-user-info',
                data: {
                    id : app.globalData.id,
                    nickName: e.detail.userInfo.nickName,
                    avatarUrl: e.detail.userInfo.avatarUrl,
                    province: e.detail.userInfo.province||'',
                    city: e.detail.userInfo.city||'',
                    country: e.detail.userInfo.country||''
                },
                header: {
                    'content-type': 'application/json'
                },
                success: function (res) {
                    //console.log("插入小程序登录用户信息成功！");
                }
            });
            //授权成功后，跳转进入小程序首页
            wx.reLaunch({
                url: '/pages/index/index'
            })
        } else {
            //用户按了拒绝按钮
            wx.showModal({
                title: '警告',
                content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
                showCancel: false,
                confirmText: '返回授权',
                success: function (res) {
                    if (res.confirm) {
                        //console.log('用户点击了“返回授权”')
                    }
                }
            })
        }
    },
    //获取用户信息接口
    queryUsreInfo: function () {
        wx.request({
            url: bsurl + 'user/user-info',
            data: {
                openid: app.globalData.openid
            },
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                //console.log('---------- index.js.success()  line:83()  res=');
                //console.dir(res);
                var userInfo = {
                    nickName: res.data.nickName,
                    avatarUrl: res.data.avatarUrl,
                    province: res.data.province,
                    city: res.data.city,
                    country: res.data.country
                };
                app.globalData.userInfo = userInfo;
                app.globalData.id = res.data.id;
                wx.setStorageSync('id',res.data.id);
                wx.setStorageSync('userInfo',userInfo);
            }
        });
    },

})
