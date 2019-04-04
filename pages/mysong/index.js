var app = getApp();
var bsurl = require('../../utils/csurl.js');
var asurl = require('../../utils/bsurl.js');
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
        userInfo: app.globalData.userInfo,
        more: false,
        selectall: false,
        select: [],
        select_idx: [],
        canplay: [],
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
        this.httpsearch();
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
        app.globalData.list_sf = this.data.canplay; //设置可以播放的歌曲列表
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
            url: '../playing/index?id=' + song.id + '&br=128000'
        })
    },
    selectmusic: function (event) {
        if (this.data.more) {
            var idx = event.currentTarget.dataset.idx;
            var id = event.currentTarget.dataset.id;
            var select = this.data.select;
            var select_idx = this.data.select_idx;
            var list = this.data.list;
            list[idx].select = !list[idx].select;
            if (list[idx].select) {
                select.push(id);
                select_idx.push(idx);
            } else {
                select.splice(select.indexOf(id), 1);
                select_idx.splice(select.indexOf(idx), 1);
            }
            this.setData({
                list: list,
            })
        } else {
            this.playmusic(event);
        }
    },
    cancellovesong: function (e) {
        var that = this;
        var list = that.data.list;
        var id = e.currentTarget.dataset.id;
        var idx = e.currentTarget.dataset.idx;
        wx.showModal({
            title: '提示',
            content: '是否要删除收藏的歌曲',
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
                        song_id: id,
                    };
                    wx.request({
                        url: asurl + "song/del-love-song",
                        method: "GET",
                        data: data,
                        success: function () {
                            app.globalData.loved_music[0].splice(app.globalData.loved_music[0].indexOf(id), 1);
                            list.splice(idx, 1);
                            that.setData({
                                list: list
                            });
                            wx.hideLoading();
                            wx.showToast({
                                title: '取消成功',//提示文字
                                duration: 1000,//显示时长
                                icon: 'success',
                            })
                        },
                        fail: function () {
                            wx.hideLoading();
                        }
                    })
                }
            }
        });


    },

    cancellovesongs: function () {
        var that = this;
        var list = that.data.list;
        var select = that.data.select;
        var select_idx = that.data.select_idx;
        console.log('---------- index.js.cancellovesongs()  line:200()  select=');
        console.dir(select);
        console.log('---------- index.js.cancellovesongs()  line:201()  select_idx=');
        console.dir(select_idx);
        wx.showModal({
            title: '提示',
            content: '是否要删除这些收藏的歌曲',
            success: function (res) {
                if (res.cancel) {
                    return;
                } else {
                    wx.showLoading({
                        title: '取消收藏...',
                    });
                    var data = {
                        user_id: app.globalData.id,
                        song_id: select.join(',')
                    };
                    wx.request({
                        url: asurl + "song/del-love-songs",
                        method: "GET",
                        data: data,
                        success: function () {
                            var length = select.length;
                            select_idx.sort();
                            for (var i = 0; i < length; i++) {
                                app.globalData.loved_music[0].splice(app.globalData.loved_music[0].indexOf(select[i]), 1);
                                list.splice(select_idx[length - 1 - i], 1);

                            }
                            that.selectmore();
                            that.setData({
                                list: list
                            });
                            wx.hideLoading();
                            wx.showToast({
                                title: '取消成功',//提示文字
                                duration: 1000,//显示时长
                                icon: 'success',
                            })
                        },
                        fail: function () {
                            wx.hideLoading();
                        }
                    })
                }
            }
        });


    },
    selectmore: function () {
        var more = !this.data.more;
        var list = this.data.list;
        var length = list.length;
        if (!more) {
            this.data.select = [];
            this.data.select_idx = [];
            for (var i = 0; i < length; i++) {
                list[i].select = false;
            }
        }
        this.setData({
            more: more,
            list: list
        });
    },

    selectall: function () {
        var select = [];
        var select_idx = [];
        var list = this.data.list;
        var length = list.length;
        var selectall = !this.data.selectall;
        if (selectall) {
            for (var i = 0; i < length; i++) {
                list[i].select = true;
                select.push(list[i].id);
                select_idx.push(i);
            }
        } else {
            select = [];
            select_idx = [];
            for (var i = 0; i < length; i++) {
                list[i].select = false;
            }
        }
        this.setData({
            list: list,
            selectall: selectall,
            select: select,
            select_idx: select_idx
        })
    },
    orderby: function () {

        var that = this;
        wx.showActionSheet({
            itemList: [
                '按收藏时间排序',
                '按歌曲名称排序',
                '按歌手名称排序',
            ],
            success: function (res) {
                var tapIndex = res.tapIndex;
                var orderlist = ['created_at', 'song_name', 'artist_name'];
                if (app.globalData.field_name == orderlist[tapIndex]) {
                    if(app.globalData.order == 0){
                        app.globalData.order = 1;
                    }else{
                        app.globalData.order = 0;
                    }
                } else {
                    app.globalData.field_name = orderlist[tapIndex];
                    app.globalData.order = 0;
                }
                that.httpsearch();
            },
            fail: function () {
                wx.showToast({
                    title: '你可以选择一个看看效果',
                    icon: 'none',
                    duration: 2000
                })
            }
        });
    },
    httpsearch:function () {
        var that = this;
        wx.request({
            url: asurl + 'song/love-song-detail',
            data: {
                user_id: app.globalData.id,
                limit: 1000,
                field_name: app.globalData.field_name,
                order: app.globalData.order
            },
            success: function (res) {
                var canplay = [];
                var list = res.data.data;
                var length = list.length;
                for (let i = 0; i < length; i++) {
                    list[i].select = false;
                    if (list[i].st >= 0) {
                        canplay.push(list[i])
                    }
                }
                that.setData({
                    loading: false,
                    list: list,
                    canplay: canplay,
                    cover: list.length ? list[0].picUrl + "?param=100y100" : "",
                    // cover: res.data[0].coverImgUrl + '',
                    // cover: id2Url.id2Url('' + (res.data.playlist.coverImgId_str || res.data.playlist.coverImgId))
                });
                //console.log('---------- index.js.success()  line:84()  list='); //console.dir(list);

            }, fail: function (res) {
                wx.navigateBack({
                    delta: 1
                })
            }
        });
    }
});