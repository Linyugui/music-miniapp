var bsurl = require('../../utils/bsurl.js');
var nt = require("../../utils/nt.js");
var util = require("../../utils/util.js");

var app = getApp();
Page({
    data: {
        art: {},
        loading: false,
        tab: 1,
        curplay: -1,
        album: {
            offset: 0,
            loading: false
        },
        desc: {
            loading: false
        },
        canplay: [],
    },
    onLoad: function (options) {
        var id = options.id;
        var that = this;
        var love = app.globalData.loved_music[0];
        wx.request({
            url: bsurl + 'v1/artists?id=' + id,
            success: function (res) {
                console.log('---------- index.js.success()  line:23()  res=');
                console.dir(res);
                var re = res.data;
                var songs = res.data.hotSongs;
                var list = [];
                for (var i = 0, len = songs.length; i < len; i++) {
                    list.push(songs[i].id);
                }
                wx.setNavigationBarTitle({
                    title: res.data.artist.name
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
                            art: re,
                            loading: true,
                            canplay: canplay
                        });
                    },
                    fail:function () {
                        wx.navigateBack({
                            delta: 1
                        })
                    }
                })
            },
            fail:function () {
                wx.navigateBack({
                    delta: 1
                })
            }
        })
    },
    onHide: function () {
        nt.removeNotification("music_next", this)
        nt.removeNotification("music_toggle", this)
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
    setplaylist: function (music, index) {
        //设置播放列表，设置当前播放音乐，设置当前音乐在列表中位置
        app.globalData.curplay = app.globalData.curplay.id != music.id ? music : app.globalData.curplay;
        app.globalData.index_am = index;//event.currentTarget.dataset.idx;
        app.globalData.playtype = 1;
        var shuffle = app.globalData.shuffle;
        app.globalData.list_sf = this.data.canplay; //设置可以播放的歌曲列表
        app.shuffleplay(shuffle);
        app.globalData.globalStop = false;
    },
    playmusic: function (event) {
        var idx = event.currentTarget.dataset.idx;
        var st = event.currentTarget.dataset.st;
        var pl = event.currentTarget.dataset.pl;
        console.log('---------- index.js.playmusic()  line:83()  idx='); console.dir(idx);
        console.log('---------- index.js.playmusic()  line:84()  st='); console.dir(st);
        console.log('---------- index.js.playmusic()  line:85()  pl='); console.dir(pl);
        if (st * 1 < 0 || pl * 1 == 0) {
            wx.showToast({
                title: '歌曲已下架',
                icon: 'success',
                duration: 2000
            });
            return;
        }
        var song = this.data.art.songs[idx];
        this.setplaylist(song, idx);
        wx.navigateTo({
            url: '../playing/index?id=' + song.id + '&br=128000'
        })
    },
    tabtype: function (e) {
        var t = e.currentTarget.dataset.t;
        this.setData({tab: t});
        var that = this;
        if (t == 2 && !this.data.album.loading) {
            this.setData({loading: false})
            wx.request({
                url: bsurl + 'v1/artist/album',
                data: {
                    id: that.data.art.artist.id,
                    offset: that.data.album.offset,
                    limit: 20
                },
                success: function (res) {
                    res.data.loading = true;
                    res.data.offset = that.data.album.offset + res.data.hotAlbums.length
                    that.setData({
                        album: res.data,
                        loading: true
                    })
                }
            })
        }
        if (t == 3 && !this.data.desc.loading) {
            this.setData({loading: false})
            wx.request({
                url: bsurl + 'v1/artist/desc',
                data: {
                    id: that.data.art.artist.id
                },
                success: function (res) {
                    res.data.loading = true;
                    that.setData({
                        loading: true,
                        desc: res.data
                    })
                }
            })
        }
    },
    lovesong: function (e) {
        var that = this;
        var art = that.data.art;
        var idx = e.currentTarget.dataset.idx;
        var song = art.songs[idx];
        var st = art.privileges[idx].st;
        var pl = art.privileges[idx].pl;
        util.lovesong(app, song, st, pl, function () {
            that.setData({
                art: art
            })
        });
    },
    cancellovesong: function (e) {
        var that = this;
        var art = that.data.art;
        var idx = e.currentTarget.dataset.idx;
        var song = art.songs[idx];
        util.cancellovesong(app, song, function () {
            that.setData({
                art: art
            })
        })

    },
})