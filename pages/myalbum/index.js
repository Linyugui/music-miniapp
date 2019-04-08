var app = getApp();
var asurl = require('../../utils/bsurl.js');
var nt = require("../../utils/nt.js");
var id2Url = require('../../utils/base64md5.js');
var util = require('../../utils/util.js');
Page({
    data: {
        list: [],
        cover: '',
        loading: true,
        userInfo: app.globalData.userInfo,
    },
    music_next: function (r) {
        this.setData({
            music: r.music,
            playtype: r.playtype,
            curplay: r.music.id
        })
    },
    music_toggle: function (r) {
        this.setData({
            playing: r.playing,
            music: r.music,
            playtype: r.playtype,
            curplay: r.music.id
        })
    },
    onShow: function () {
        nt.addNotification("music_next", this.music_next, this);
        nt.addNotification("music_toggle", this.music_toggle, this);
        this.setData({
            curplay: app.globalData.curplay.id,
            music: app.globalData.curplay,
            playing: app.globalData.playing,
            playtype: app.globalData.playtype
        })
    },
    onHide: function () {
        nt.removeNotification("music_next", this)
        nt.removeNotification("music_toggle", this)
    },
    onLoad: function () {
        var that = this;
        wx.request({
            url: asurl + 'album/love-album',
            data: {
                user_id: app.globalData.id,
                limit: 1000
            },
            success: function (res) {
                var list = res.data.data;
                that.setData({
                    loading: false,
                    list: list,
                });

            }, fail: function (res) {
                wx.navigateBack({
                    delta: 1
                })
            }
        });
        wx.setNavigationBarTitle({
            title: "收藏的专辑"
        })
    },
    cancellovealbum: function (e) {
        var that = this;
        var list = that.data.list;
        var re = e.currentTarget.dataset.re;
        var idx = e.currentTarget.dataset.idx;
        wx.showModal({
            title: '提示',
            content: '是否要删除收藏的专辑',
            success: function (res) {
                if (res.cancel) {
                    //console.log('用户点击了取消');
                    return;
                } else {
                    wx.showLoading({
                        title: '取消收藏...',
                    });
                    var data = {
                        user_id: app.globalData.id,
                        album_id: re.id,
                    };
                    wx.request({
                        url: asurl + "album/del-love-album",
                        method: "GET",
                        data: data,
                        success: function () {
                            wx.hideLoading();
                            wx.showToast({
                                title: '取消成功',//提示文字
                                duration: 1000,//显示时长
                                icon: 'success',
                            })
                            app.globalData.loved_music[1].splice(app.globalData.loved_music[1].indexOf(re.id), 1);
                            list.splice(idx, 1);
                            that.setData({
                                list: list,
                            })
                        },
                        fail: function () {
                            wx.hideLoading();
                        }
                    })
                }
            }
        });
    }


});