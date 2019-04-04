var app = getApp();
var bsurl = require('../../utils/csurl.js');
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
    // toggleplay: function () {
    //     util.toggleplay(this, app);
    // },
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
        var curloved_music = app.globalData.loved_music[0];
        wx.request({
            url: bsurl + 'album ',
            data: {
                id: options.pid
            },
            success: function (res) {
                var re = res.data;
                re.album.publishTime = util.formatTime(re.album.publishTime, 3);
                var canplay = [];
                var length = res.data.songs.length;
                for (var i = 0; i < length; i++) {
                    var r = res.data.songs[i];
                    if (curloved_music.indexOf(r.id) != -1) {
                        r.love = 1;
                    }
                    else {
                        r.love = 0;
                    }
                    if (r.privilege.st > -1) {
                        canplay.push(r)
                    }
                }
                that.setData({
                    result: res.data,
                    loading: false,
                    canplay: canplay,
                    share: {
                        id: options.id,
                        title: res.data.album.name + '-' + res.data.album.artist.name,
                        des: res.data.album.description
                    }
                });
                wx.setNavigationBarTitle({
                    title: res.data.album.name
                })
            },
            fail: function (res) {
                wx.navigateBack({
                    delta: 1
                })
            }
        });
    },
    onShareAppMessage: function () {
        if (this.data.share.id) return;
        return {
            title: this.data.share.title,
            desc: this.data.share.des,
            path: 'page/component/playing/index?id=' + this.data.share.id
        }
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
        this.setplaylist(this.data.canplay[0], 0);
        app.seekmusic(1)

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
        var that = this;
        var music = event.currentTarget.dataset.idx;
        var st = event.currentTarget.dataset.st;
        if (st * 1 < 0) {
            wx.showToast({
                title: '歌曲已下架',
                icon: 'success',
                duration: 2000
            });
            return;
        }
        music = this.data.result.songs[music];
        that.setplaylist(music, event.currentTarget.dataset.idx)
    },
    lovesong: function (e) {
        var that = this;
        var result = that.data.result;
        var list = result.songs;
        var song = e.currentTarget.dataset.re;
        var idx = e.currentTarget.dataset.idx;
        var st = song.st;
        util.lovesong(that,app,song,st,idx,list,function () {
            that.setData({
                result:result
            })
        });
    },
    cancellovesong: function (e) {
        var that = this;
        var result = that.data.result;
        var list = result.songs;
        var song = e.currentTarget.dataset.re;
        var idx = e.currentTarget.dataset.idx;
        util.cancellovesong(that,app,song,idx,list,function () {
            that.setData({
                result:result
            })
        })

    },
});