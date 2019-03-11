var app = getApp();
var bsurl = require('../../utils/csurl.js');
var nt = require("../../utils/nt.js");
var id2Url = require('../../utils/base64md5.js');
var common = require('../../utils/util.js');
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
        user: wx.getStorageSync('user') || {}
    },
    // toggleplay: function () {
    //     common.toggleplay(this, app);
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
    lovesong: function () {
        common.songheart(this, app, 0, (this.data.playtype == 1 ? this.data.music.st : this.data.music.starred));
    },
    onLoad: function (options) {
        var that = this
        wx.request({
            url: bsurl + 'playlist/detail',
            data: {
                id: options.pid,
                limit: 1000
            },
            success: function (res) {
                var canplay = [];
                var love_song = app.globalData.loved_music[0];
               // console.log('---------- index.js.success()  line:68()  res.data='); console.dir(res.data);
                var length = res.data.playlist.tracks.length;
                for (let i = 0; i < length; i++) {
                    if (love_song.indexOf(res.data.playlist.tracks[i].id) != -1) {
                        res.data.playlist.tracks[i].love = 1;
                    }
                    else {
                        res.data.playlist.tracks[i].love = 0;
                    }
                    if (res.data.privileges[i].st >= 0) {
                        canplay.push(res.data.playlist.tracks[i])
                    }
                }
                that.setData({
                    list: res.data,
                    canplay: canplay,
                    toplist: (options.from == 'stoplist' ? true : false),
                    cover: res.data.playlist.coverImgUrl+'?param=100y100',
                    // cover: id2Url.id2Url('' + (res.data.playlist.coverImgId_str || res.data.playlist.coverImgId))
                });

                wx.setNavigationBarTitle({
                    title: res.data.playlist.name
                })
            }, fail: function (res) {
                wx.navigateBack({
                    delta: 1
                })
            }
        });
    },

    userplaylist: function (e) {
        var userid = e.currentTarget.dataset.userid;
        wx.redirectTo({
            url: '../user/index?id=' + userid
        })
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
        console.log('---------- index.js.playmusic()  line:113()  event='); console.dir(event);
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
    lovesong: function (e) {

        var that = this;
        var curtab = this.data.list;
        wx.showLoading({
            title: '正在收藏...',
        });
        var song = e.currentTarget.dataset.re;
        var idx = e.currentTarget.dataset.idx;
        console.log('---------- index.js.lovesong()  line:145()  song='); console.dir(song);
        console.log('---------- index.js.lovesong()  line:146()  idx='); console.dir(idx);
        var data = {
            user_id: app.globalData.id,
            song_id: song.id,
            album_name: song.album.name,
            artist_name: song.artists[0].name,
            song_name: song.name
        };
        wx.request({
            url: asurl + "song/add-love-song",
            method: "GET",
            data: data,
            success: function (res) {
                app.globalData.loved_music[index].push(song.id);
                // console.log('---------- index.js.success()  line:291()  curtab.relist='); console.dir(curtab.relist);
                curtab.playlist.tracks[idx].love = 1;
                that.setData({
                    list:curtab
                })
            },
            complete:function () {
                wx.hideLoading();
            }
        })

    },
    cancellovesong: function (e) {
        var that = this;
        var curtab = this.data.list;
        wx.showLoading({
            title: '取消收藏...',
        });
        var song = e.currentTarget.dataset.re;
        var idx = e.currentTarget.dataset.idx;
        var data = {
            user_id: app.globalData.id,
            song_id: song.id,
        };
        wx.request({
            url: asurl + "song/del-love-song",
            method: "GET",
            data: data,
            success: function (res) {
                app.globalData.loved_music[index].splice(idx,1);
                curtab.playlist.tracks[idx].love = 0;
                // curtab.relist.songs[idx].love = 0;
                that.setData({
                    list:curtab
                })
            },
            complete:function () {
                wx.hideLoading();
            }
        })

    },
});