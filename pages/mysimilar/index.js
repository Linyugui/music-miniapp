var app = getApp();
var bsurl = require('../../utils/bsurl.js');
var nt = require("../../utils/nt.js");
var util = require('../../utils/util.js');
Page({
    data: {
        list: [],
        curplay: {},
        cover: '',
        music: {},
        playing: false,
        playtype: 1,
        loading: true,
        toplist: false,
        userInfo: app.globalData.userInfo,
        canplay:[],
    },
    toggleplay: function () {
        util.toggleplay(this, app);
    },
    playnext: function (e) {
        app.nextplay(e.currentTarget.dataset.pt)
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
        nt.removeNotification("music_next", this);
        nt.removeNotification("music_toggle", this)
    },

    onLoad: function (options) {
        var that = this;
        wx.request({
            url: bsurl + 'similarsong/daily-similar-song',
            data: {
                user_id: app.globalData.id,
            },
            success: function (res) {
                var canplay = [];
                var love = app.globalData.loved_music[0];
                var list = res.data.data;
                var length = list.length;
                for (var i = 0; i < length; i++) {
                    if (love.indexOf(list[i].id) != -1) {
                        list[i].love = 1;
                    } else {
                        list[i].love = 0;
                    }
                    if (list[i].st * 1 >= 0 && list[i].pl * 1 > 0) {
                        canplay.push(list[i])
                    }
                }
                console.log('---------- index.js.success()  line:77()  list='); console.dir(list);
                that.setData({
                    loading:false,
                    list: list,
                    canplay: canplay,
                    cover:list.length?list[0].picUrl+"?param=100y100":"",
                    // cover: id2Url.id2Url('' + (res.data.playlist.coverImgId_str || res.data.playlist.coverImgId))
                });

            }, fail: function (res) {
                wx.navigateBack({
                    delta: 1
                })
            }
        });
    },
    playall: function (event) {
        this.setplaylist(this.data.canplay[0], 0);
        app.seekmusic(1)

    },
    setplaylist: function (music, index) {
        //设置播放列表，设置当前播放音乐，设置当前音乐在列表中位置
        app.globalData.curplay = app.globalData.curplay.id != music.id ? music : app.globalData.curplay;
        app.globalData.index_am = index;//event.currentTarget.dataset.idx;
        app.globalData.playtype = 1;
        var shuffle = app.globalData.shuffle;
        app.globalData.list_sf = this.data.canplay;//this.data.list.tracks;
        app.shuffleplay(shuffle);
        app.globalData.globalStop = false;
    },
    playmusic: function (event) {
        var idx = event.currentTarget.dataset.idx;
        var st = event.currentTarget.dataset.st;
        if (st * 1 < 0) {
            wx.showToast({
                title: '歌曲已下架',
                icon: 'success',
                duration: 2000
            });
            return;
        }
        var song = this.data.list[idx];
        this.setplaylist(song, idx);
        wx.navigateTo({
            url:'../playing/index?id='+song.id+'&br=128000'
        })
    },

    lovesong: function (e) {
        var that = this;
        var list = that.data.list;
        var playlist = list.playlist.tracks;
        var song = e.currentTarget.dataset.re;
        var idx = e.currentTarget.dataset.idx;
        var st = e.currentTarget.dataset.st;
        var pl = e.currentTarget.dataset.pl;
        util.lovesong(that, app, song, st, pl, idx, playlist, function () {
            that.setData({
                list: list
            })
        })

    },
    cancellovesong: function (e) {
        var that = this;
        var list = that.data.list;
        var playlist = list.playlist.tracks;
        var song = e.currentTarget.dataset.re;
        var idx = e.currentTarget.dataset.idx;
        util.cancellovesong(that, app, song, idx, playlist, function () {
            that.setData({
                list: list
            })
        })
    },
});