var bsurl = require('../../utils/bsurl.js');
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
        var song = this.data.art.songs[idx];
        //this.setplaylist(song, idx);
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
    }
})