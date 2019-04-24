var app = getApp();
var bsurl = require('../../utils/bsurl.js');
Page({
    data: {
        catelist: {
            res: {},
            checked: {}
        },
        tabidx: 1,
        playlist: {
            idx: 1, loading: false,
            list: {},
            offset: 0,
            limit: 20
        },
        cateisShow: false,
    },
    onLoad: function (options) {
        var that = this;
        wx.request({
            url: bsurl + 'v1/playlist/catlist',
            complete: function (res) {
                that.setData({
                    catelist: {
                        isShow: false,
                        res: res.data,
                        checked: res.data.all
                    }
                })
                that.gplaylist();
            }
        })
    },
    togglePtype: function () {
        this.setData({
            cateisShow: !this.data.cateisShow
        })
    },
    gplaylist: function (isadd) {
        //分类歌单列表
        var that = this;
        wx.request({
            url: bsurl + 'v1/top/playlist',
            data: {
                limit: that.data.playlist.limit,
                offset: that.data.playlist.offset,
                cat: that.data.catelist.checked.name
            },
            complete: function (res) {
                that.data.playlist.loading = true;
                if (!isadd) {
                    that.data.playlist.list = res.data
                } else {
                    res.data.playlists = that.data.playlist.list.playlists.concat(res.data.playlists);
                    that.data.playlist.list = res.data
                }
                that.data.playlist.offset += res.data.playlists.length;
                that.setData({
                    playlist: that.data.playlist
                })
            }
        })
    },
    onReachBottom: function () {
        if (this.data.tabidx == 1) {
            this.gplaylist(1);//更多歌单
        }
    },
    cateselect: function (e) {
        var t = e.currentTarget.dataset.catype;
        this.data.catelist.checked = t
        this.setData({
            playlist: {
                idx: 1,
                loading: false,
                list: {},
                offset: 0,
                limit: 20
            },
            cateisShow: !this.data.cateisShow,
            catelist: this.data.catelist
        });
        this.gplaylist();
    },
});