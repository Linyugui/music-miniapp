var app = getApp();
var bsurl = require('../../utils/bsurl.js');
var util = require('../../utils/util.js');
var nt = require("../../utils/nt.js");
Page({
    data: {
        result: {},
        curplay: 0,
        music: {},
        playing: false,
        playtype: 1,
        loading: true,
        // music: {},
        // playing: false,
        // playtype: 1,
        // share: {
        //     title: "一起来听",
        //     des: ""
        // }
    },
    toggleplay: function () {
        util.toggleplay(this, app);
    },
    music_next: function (r) {
        this.setData({
            music: r.music,
            playtype: r.playtype,
            curplay: r.music.id
        })
    },
    music_toggle: function (r) {
        //console.log('---------- index.js.music_toggle()  line:35()  r='); //console.dir(r);
        this.setData({
            playing: r.playing,
            music: r.music,
            playtype: r.playtype,
            curplay: r.music.id
        })
    },
    onHide: function () {
        nt.removeNotification("music_next", this)
        nt.removeNotification("music_toggle", this)
    },
    onLoad: function (options) {

        var that = this;
        var love = app.globalData.loved_music[0];
        wx.request({
            url: bsurl + 'v1/album',
            data: {
                id: options.pid
            },
            success: function (res) {
                var re = res.data;
                re.album.publishTime = util.formatTime(re.album.publishTime, 3);
                var songs = res.data.songs;
                var list = [];
                for (var i = 0, len = songs.length; i < len; i++) {
                    list.push(songs[i].id);
                }
                wx.setNavigationBarTitle({
                    title: res.data.album.name
                });
                wx.request({
                    url: bsurl + 'v1/song/detail',
                    data: {
                        ids: list.toString(),
                    },
                    method: 'GET',
                    success: function (res) {
                        var canplay = [];
                        var songs = res.data.songs;
                        var privileges = res.data.privileges;
                        for (var i = 0, len = songs.length; i < len; i++) {
                            if (love.indexOf(songs[i].id) != -1) {
                                songs[i].love = 1;
                            }
                            else {
                                songs[i].love = 0;
                            }
                            if (privileges[i].st * 1 > -1 && privileges[i].pl * 1 > 0) {
                                canplay.push(songs[i]);
                            }
                        }
                        re.songs = songs;
                        re.privileges = privileges;
                        that.setData({
                            result: re,
                            loading: false,
                            canplay: canplay,
                        });
                    },
                    fail: function () {
                        wx.navigateBack({
                            delta: 1
                        })
                    }
                })

            },
            fail: function (res) {
                wx.navigateBack({
                    delta: 1
                })
            }
        });
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
    artlist: function (e) {
        var userid = e.currentTarget.dataset.userid;
        wx.redirectTo({
            url: '../artist/index?id=' + userid
        })
    },
    playall: function (event) {
        if(this.data.canplay.length){
            this.setplaylist(this.data.canplay[0], 0);
            app.seekmusic(1)
        }
    },
    setplaylist: function (music, index) {
        //设置播放列表，设置当前播放音乐，设置当前音乐在列表中位置
        app.globalData.curplay = app.globalData.curplay.id != music.id ? music : app.globalData.curplay;
        app.globalData.index_am = index; //event.currentTarget.dataset.idx;
        app.globalData.playtype = 1;
        var shuffle = app.globalData.shuffle;
        app.globalData.list_sf = this.data.canplay; //this.data.list.tracks;
        app.shuffleplay(shuffle);
        app.globalData.globalStop = false;
    },
    playmusic: function (event) {
        var idx = event.currentTarget.dataset.idx;
        var st = event.currentTarget.dataset.st;
        var pl = event.currentTarget.dataset.pl;
        if (st * 1 < 0 || pl * 1 == 0) {
            wx.showToast({
                title: '歌曲已下架',
                icon: 'success',
                duration: 2000
            });
            return;
        }
        var song = this.data.result.songs[idx];
        this.setplaylist(song, idx);
        wx.navigateTo({
            url: '../playing/index?id=' + song.id + '&br=128000'
        })
    },
    lovesong: function (e) {
        var that = this;
        var result = that.data.result;
        var idx = e.currentTarget.dataset.idx;
        var song = result.songs[idx];
        var st = result.privileges[idx].st;
        var pl = result.privileges[idx].pl;
        util.lovesong(app, song, st, pl, function () {
            that.setData({
                result: result
            })
        });
    },
    cancellovesong: function (e) {
        var that = this;
        var result = that.data.result;
        var idx = e.currentTarget.dataset.idx;
        var song = result.songs[idx];
        util.cancellovesong(app, song, function () {
            that.setData({
                result: result
            })
        })

    },
});