var asurl = require('../../utils/bsurl.js');
// var bsurl = require('../../utils/csurl.js');
var async = require('../../utils/async.js');
var common = require('../../utils/util.js');
var nt = require("../../utils/nt.js");
var app = getApp();
Page({
    data: {
        rec: {
            idx: 0, loading: true,
        },
        music: {},
        playing: false,
        playtype: {},
        thisday: (new Date()).getDate(),
        playlist: {
            idx: 1, loading: false,
            list: {},
            offset: 0,
            limit: 20
        },
    },
    toggleplay: function () {
        common.toggleplay(this, app);
    },
    playnext: function (e) {
        app.nextplay(e.currentTarget.dataset.pt)
    },
    music_next: function (r) {
        this.setData({
            music: r.music,
            playtype: r.playtype
        })
    },
    music_toggle: function (r) {
        this.setData({
            playing: r.playing
        })
    },
    onLoad: function (options) {
        if (options.share == 1) {
            var url = '../' + options.st + '/index?id=' + options.id
            // console.log(url, options.st, options.id)
            wx.navigateTo({
                url: url,
                success: function () {
                    // console.log("tiaozhuan chenggong")
                }
            })
            return;
        }
        ;
    },
    onHide: function () {
        nt.removeNotification("music_next", this)
        nt.removeNotification("music_toggle", this)
    },
    onShow: function () {
        nt.addNotification("music_next", this.music_next, this);
        nt.addNotification("music_toggle", this.music_toggle, this)
        this.setData({
            music: app.globalData.curplay,
            playing: app.globalData.playing,
            playtype: app.globalData.playtype,
        })
        // var user = wx.getStorageSync('user');
        // console.log('---------- index.js.onShow()  line:85()  user='); console.dir(user);
        this.init() && this.data.rec.loading;
    },


    init: function () {
        var that = this;
        var rec = this.data.rec;
        //个性推荐内容,歌单，新歌，mv，电台
        async.map(['v1/personalized', 'v1/personalized/newsong'], function (item, callback) {
            wx.request({
                url: asurl + item,
                data: {
                    limit: 6
                },
                success: function (res) {
                    // console.log('---------- index.js.success()  line:218()  res='); console.dir(res);
                    callback(null, res.data.result)
                }
            })
        }, function (err, results) {
            // console.log(err);
            rec.loading = true;
            rec.re = results;
            that.setData({
                rec: rec
            })
        });
    }
})