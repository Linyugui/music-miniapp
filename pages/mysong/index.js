var app = getApp();
var bsurl = require('../../utils/csurl.js');
var asurl = require('../../utils/bsurl.js');
var nt = require("../../utils/nt.js");
var util = require('../../utils/util.js');
Page({
    data: {
        list: [],
        curplay: {},
        pid: 0,
        cover: '',
        music: {},
        playing: false,
        playtype: 1,
        loading: true,
        toplist: false,
        userInfo: app.globalData.userInfo,
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
            url: asurl + 'song/love-song-detail',
            data: {
                user_id: app.globalData.id,
                limit: 1000
            },
            success: function (res) {
                var canplay = [];
                var list = res.data.data;
                var love_song = app.globalData.loved_music[0];
                var length = list.length;
                for (let i = 0; i < length; i++) {
                    if (list[i].st >= 0) {
                        canplay.push(list[i])
                    }
                }
                that.setData({
                    list: list,
                    canplay: canplay,
                    // cover: res.data[0].coverImgUrl + '?param=100y100',
                    // cover: id2Url.id2Url('' + (res.data.playlist.coverImgId_str || res.data.playlist.coverImgId))
                });
                console.log('---------- index.js.success()  line:84()  list='); console.dir(list);

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
        console.log('---------- index.js.playmusic()  line:113()  event=');
        console.dir(event);
        let music = event.currentTarget.dataset.idx;
        let st = event.currentTarget.dataset.st;
        if (st * 1 < 0) {
            wx.showToast({
                title: '歌曲已下架',
                icon: 'success',
                duration: 2000
            });
            return;
        }
        music = this.data.list.playlist.tracks[music];
        this.setplaylist(music, event.currentTarget.dataset.idx)
    },

    cancellovesong: function (e) {
        var that = this;
        var list = that.data.list;
        var song = e.currentTarget.dataset.re;
        var idx = e.currentTarget.dataset.idx;
        wx.showModal({
            title: '提示',
            content: '是否要删除收藏的歌曲',
            success: function (res) {
                if (res.cancel) {
                    console.log('用户点击了取消');
                    return ;
                }
            }
        });

        wx.showLoading({
            title: '取消收藏...',
        });
        var data = {
            user_id: app.globalData.id,
            song_id: song.id,
        };
        wx.request({
            url: asurl + "song/del-love-song",
            method: "GET",
            data: data,
            success: function (res) {
                app.globalData.loved_music[0].splice(idx, 1);
                list[idx].love = 0;
                cb && cb();
            },
            complete: function () {
                wx.hideLoading();
            }
        })

    },
});