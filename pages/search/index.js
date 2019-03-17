var bsurl = require('../../utils/csurl.js');
var asurl = require('../../utils/bsurl.js');
var typelist = require('../../utils/searchtypelist.js');
var nt = require("../../utils/nt.js");
var util = require("../../utils/util.js");
var app = getApp();
Page({
    data: {
        tab: {tab: typelist[0].type, index: 0},
        value: "",
        tabs: typelist,
        recent: wx.getStorageSync("recent") || [],
        loading: false,
        prevalue: "",
    },
    onLoad: function (options) {
        var v = options.key;
        v && this.search(v);

    },
    inputext: function (e) {
        var name = e.detail.value;
        this.setData({value: name});
    },
    playmusic: function (event) {
        let that = this;
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
        music = this.data.tabs[0].relist.songs[music];
        app.globalData.curplay = music
    },
    search: function (name) {
        if (!name || (name == this.data.prevalue)) return;
        var index = this.data.tab.index;
        var tl = typelist;
        this.setData({
            tabs: tl,
            prevalue: name,
            value: name,
            loading: true
        });
        var curtab = this.data.tabs[index];
        var curloved_music = app.globalData.loved_music[index];
        var that = this;
        tl = this.data.tabs;
        this.httpsearch(name, curtab.offset, this.data.tab.tab, curloved_music,function (res) {
            var resultarry = res.songs || res.albums || [];

            curtab.relist = res;
            curtab.loading = true;
            curtab.offset = resultarry.length;
            var size = res.songCount || res.albumCount;
            size = size ? size : 0;
            curtab.none = curtab.offset >= size ? true : false;
            tl[index] = curtab;
            var recent = that.data.recent;
            var curname = recent.findIndex(function (e) {
                return e == name
            });
            if (curname > -1) {
                recent.splice(curname, 1)
            }
            recent.unshift(name);
            wx.setStorageSync('recent', recent)
            that.setData({
                tabs: tl,
                loading: true,
                recent: recent,
                prevalue: name
            });

        }, function () {
            curtab.loading = true;
            curtab.none = true;
            tl[index] = curtab;
            that.setData({
                tabs: tl
            })
        })
    },
    searhFrecent: function (e) {
        this.search(e.currentTarget.dataset.value)
    },
    searhFinput: function (e) {
        this.search(e.detail.value.name)
    },
    onReachBottom: function (e) {
        var index = this.data.tab.index;
        var tl = this.data.tabs,
            that = this;
        var curtab = tl[index];
        var curloved_music = app.globalData.loved_music[index];
        if (curtab.none) {
            return;
        }
        curtab.loading = false;
        tl[this.data.tab.index] = curtab
        this.setData({
            tabs: tl
        })
        this.httpsearch(this.data.prevalue, curtab.offset, this.data.tab.tab,curloved_music, function (res) {
            var resultarry = res.songs || res.albums || [];
            console.log('---------- index.js.()  line:126()  resultarry=');
            console.dir(resultarry);
            var size = res.songCount || res.albumCount;
            size = size ? size : 0;
            var length = resultarry.length;
            curtab.loading = true;
            curtab.offset = curtab.offset + length;
            curtab.none = curtab.offset >= size ? true : false;
            curtab.relist.songs = curtab.relist.songs ? curtab.relist.songs.concat(resultarry) : null;
            curtab.relist.albums = curtab.relist.albums ? curtab.relist.albums.concat(resultarry) : null;
            tl[that.data.tab.index] = curtab
            that.setData({
                tabs: tl
            })
        }, function () {
            curtab.loading = true;
            curtab.none = true;
            tl[that.data.tab.index] = curtab
            that.setData({
                tabs: tl
            })
        })
    },
    httpsearch: function (name, offset, type, love, cb, err) {
        wx.request({
            url: asurl + 'v1/search',
            data: {
                keywords: name,
                offset: offset,
                limit: 20,
                type: type
            },
            method: 'GET',
            success: function (res) {
                console.log('---------- index.js.success()  line:160()  res.data.result=');
                console.dir(res.data.result);
                if(type == 1){
                    var songs = res.data.result.songs;
                    var list = new Array();
                    for (var i = 0, len = songs.length; i < len; i++) {
                        list.push(songs[i].id);
                    }
                    wx.request({
                        url:asurl+'v1/song/detail',
                        data:{
                            ids:list.toString(),
                        },
                        method: 'GET',
                        success:function (res) {
                            console.log('---------- index.js.success()  line:160()  res='); console.dir(res);
                            var songs = res.data.songs;
                            for (var i = 0, len = songs.length; i < len; i++) {
                                if (love.indexOf(songs[i].id) != -1) {
                                    songs[i].love = 1;
                                }
                                else {
                                    songs[i].love = 0;
                                }
                            }
                            cb && cb(res.data);
                        },
                        fail:function () {
                            err && err();
                        }

                    })
                }
                else{
                    var albums = res.data.result.albums || [];
                    for (var i = 0, len = albums.length; i < len; i++) {
                        if (love.indexOf(albums[i].id) != -1) {
                            albums[i].love = 1;
                        }
                        else {
                            albums[i].love = 0;
                        }
                    }
                    cb && cb(res.data.result);
                }

            },
            fail: function () {
                err && err();
            }
        })
    },
    tabtype: function (e) {
        var index = e.currentTarget.dataset.index;
        var curtab = this.data.tabs[index];
        var curloved_music = app.globalData.loved_music[index];
        var type = e.currentTarget.dataset.tab;
        var that = this;
        var tl = that.data.tabs;
        if (!curtab.loading) {
            this.httpsearch(this.data.prevalue, curtab.offset, type, curloved_music,function (res) {
                var resultarry = res.songs || res.albums || [];
                curtab.loading = true;
                curtab.relist = res;
                curtab.offset = resultarry.length;
                var size = res.songCount || res.albumCount;
                size = size ? size : 0;
                curtab.none = curtab.offset >= size ? true : false;
                console.log(size, curtab.offset)

                tl[index] = curtab;
                that.setData({
                    tabs: tl
                })
            }, function () {
                curtab.loading = true;
                curtab.none = true;
                tl[index] = curtab;
                that.setData({
                    tabs: tl
                })
            })
        }
        this.setData({
            tab: {
                tab: type,
                index: index
            }
        })
    },
    clear_kw: function () {
        this.setData({
            value: "",
            loading: false,
            tabs: typelist,
            prevalue: ""
        })
    },
    scan_code: function () {
        // 允许从相机和相册扫码
        var that = this;
        wx.scanCode({
            success(res) {
                wx.request({
                    method: 'GET',
                    url: 'https://music.douban.com/j/subject_suggest',
                    data: {
                        q: res.result,
                    },
                    success(res) {
                        console.log('---------- index.js.success()  line:205()  res=');
                        console.dir(res);
                        if (res.data.length != 0) {
                            that.setData({
                                value: res.data[0].title,
                                loading: false,
                                tabs: typelist,
                                prevalue: ""
                            });
                            that.search(that.data.value);

                        } else {
                            //搜索不到
                            wx.showModal({
                                title: '提示',
                                content: '没有扫描结果请重试',
                                showCancel: false,
                                confirmText: '返回',
                            })
                        }

                    }
                })
            }
        })
    },
    del_research: function (e) {
        //删除搜索历史
        var index = e.currentTarget.dataset.index;
        this.data.recent.splice(index, 1);
        this.setData({
            recent: this.data.recent
        })
        wx.setStorageSync('recent', this.data.recent)
    },

    lovesong: function (e) {
        var that = this;
        var index = that.data.tab.index;
        var tabs = that.data.tabs;
        var list = tabs[index].relist.songs;
        var song = e.currentTarget.dataset.re;
        var idx = e.currentTarget.dataset.idx;
        var st = tabs[index].relist.privileges[idx].st;
        util.lovesong(that, app, song, st, idx, list, function () {
            that.setData({
                tabs: tabs
            })
        });
    },
    cancellovesong: function (e) {
        var that = this;
        var index = that.data.tab.index;
        var tabs = that.data.tabs;
        var list = tabs[index].relist.songs;
        var song = e.currentTarget.dataset.re;
        var idx = e.currentTarget.dataset.idx;
        util.cancellovesong(that, app, song, idx, list, function () {
            that.setData({
                tabs: tabs
            })
        })

    },
    lovealbum: function (e) {
        var that = this;
        var index = that.data.tab.index;
        var tabs = that.data.tabs;
        var list = tabs[index].relist.albums;
        var album = e.currentTarget.dataset.re;
        var idx = e.currentTarget.dataset.idx;
        util.lovealbum(that, app, album, idx, list, function () {
            that.setData({
                tabs: tabs
            })
        })
    },
    cancellovealbum: function (e) {
        var that = this;
        var index = that.data.tab.index;
        var tabs = that.data.tabs;
        var list = tabs[index].relist.albums;
        var album = e.currentTarget.dataset.re;
        var idx = e.currentTarget.dataset.idx;
        util.cancellovesong(that, app, album, idx, list, function () {
            that.setData({
                tabs: tabs
            })
        })
    }

})