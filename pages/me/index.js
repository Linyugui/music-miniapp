var app=getApp();
var bsurl = require('../../utils/csurl.js');
Page({
    data: {
        list:[],
        subcount:{},
        loading:true
    },
    onLoad: function () {

        var that = this;
        that.setData({
            userInfo: app.globalData.userInfo
        });
        wx.setNavigationBarTitle({
            title: "我的音乐"
        })

    },
    onShow: function () {

     }
})