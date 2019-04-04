var asurl = require('bsurl.js');

function formatTime(date, type) {
    type = type || 1;
    //type 1,完成输出年月日时分秒，2对比当前时间输出日期，或时分;
    var d = new Date(date)
    var year = d.getFullYear()
    var month = d.getMonth() + 1
    var day = d.getDate()
    var hour = d.getHours()
    var minute = d.getMinutes()
    var second = d.getSeconds();
    if (type == 1) {
        return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
    } else if (type == 3) {
        return [year, month, day].map(formatNumber).join('-');
    } else {
        var jm = new Date
            , Fo = jm.getTime() - date;
        if (Fo <= 6e4)
            return "刚刚";
        var Qq = jm.getHours() * 36e5 + jm.getMinutes() * 6e4 + jm.getSeconds() * 1e3;
        if (day == jm.getDate()) {
            if (Fo < 36e5) {
                var bOh = Math.floor(Fo / 6e4);
                return bOh + "分钟前"
            }
            return [hour, minute].map(formatNumber).join(':');
        } else {
            if (Fo < Qq + 864e5) {
                return "昨天" + [hour, minute].map(formatNumber).join(':');
            } else {
                var hq = jm.getFullYear()
                    , bOg = new Date(hq, 0, 1);
                var Qq = jm.getTime() - bOg.getTime();
                if (Fo < Qq) {
                    return year + "年" + month + "月" + day + "日" + [hour, minute].map(formatNumber).join(':');
                }
                return year + "年" + month + "月" + day + "日"
            }
        }
    }
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function formatduration(duration) {
    duration = new Date(duration);
    return formatNumber(duration.getMinutes()) + ":" + formatNumber(duration.getSeconds());
}

function toggleplay(that, app, cb) {
    cb = cb || null;
    if (that.data.disable) {
        return;
    }
    console.log('---------- util.js.toggleplay()  line:60()  that.data.playing='); console.dir(that.data.playing);
    if (that.data.playing) {
        //console.log("暂停播放");
        that.setData({playing: false});

        app.stopmusic(1);
    } else {
        //console.log("继续播放")
        that.setData({
            playing: true
        });
        app.seekmusic(app.globalData.playtype, app.globalData.currentPosition, cb);
    }
}

function playAlrc(that, app) {
    //音乐播放监听
    if (app.globalData.globalStop) {
        that.setData({
            playtime: '00:00',
            duration: '00:00',
            percent: 0.1,
            playing: false,
            downloadPercent: 0
        });
        return;
    }
    if (that.data.music.id != app.globalData.curplay.id) {
        that.setData({
            music: app.globalData.curplay,
            //lrc: [],
            //showlrc: false,
            //lrcindex: 0,
            duration: formatduration(app.globalData.curplay.duration || app.globalData.curplay.dt)
        });
       // wx.setNavigationBarTitle({title: app.globalData.curplay.name});
    }
    app.globalData.backgroundAudioManager.onTimeUpdate(function () {
        var res = app.globalData.backgroundAudioManager;
        var downloadPercent = res.buffered;
        var time = res.currentTime / res.duration * 100 || 0;
        var playing = !res.paused;
        var playtime = res.currentTime;
        app.globalData.play = playing;
        that.setData({
            playtime: formatduration(playtime * 1000),
            percent: time,
            playing: playing,
            downloadPercent: downloadPercent
        })
        //console.log('---------- util.js.()  line:106()  res='); //console.dir(res);
    });
    app.globalData.backgroundAudioManager.onEnded(function () {
        app.nextplay(1);
    });
    // wx.getBackgroundAudioPlayerState({
    //     complete: function (res) {
    //         var time = 0, lrcindex = that.data.lrcindex, playing = false, playtime = 0, downloadPercent = 0;
    //         if (res.status != 2) {
    //             time = res.currentPosition / res.duration * 100;
    //             playtime = res.currentPosition;
    //             downloadPercent = res.downloadPercent
    //             if (that.data.showlrc && !that.data.lrc.scroll) {
    //                 for (let i in that.data.lrc.lrc) {
    //                     var se = that.data.lrc.lrc[i];
    //                     if (se.lrc_sec <= res.currentPosition) {
    //                         lrcindex = i
    //                     }
    //                 }
    //             }
    //             ;
    //
    //         }
    //         if (res.status == 1) {
    //             playing = true;
    //         }
    //         app.globalData.play = playing;
    //         that.setData({
    //             playtime: formatduration(playtime * 1000),
    //             percent: time,
    //             playing: playing,
    //             lrcindex: lrcindex,
    //             downloadPercent: downloadPercent
    //         })
    //     }
    // });
}

function lovesong(that, app, song, st, idx, list, cb) {
    //console.log('---------- util.js.lovesong()  line:147()  song='); //console.dir(song);
    wx.showLoading({
        title: '正在收藏...',
    });
    var data = {
        user_id: app.globalData.id,
        song_id: song.id,
        album_name: (song.album) ? song.album.name : song.al.name,
        artist_name: (song.artists) ? song.artists[0].name : song.ar[0].name,
        song_name: song.name,
        st: st,
        picUrl:(song.album) ? song.album.picUrl : song.al.picUrl,
    };
    wx.request({
        url: asurl + "song/add-love-song",
        method: "GET",
        data: data,
        success: function (res) {
            wx.hideLoading();
            wx.showToast({
                title: '收藏成功',//提示文字
                duration:1000,//显示时长
                icon:'success',
            })
            app.globalData.loved_music[0].push(song.id);
            list[idx].love = 1;
            cb && cb();
        },
        fail: function () {
            wx.hideLoading();
        }
    })
}

function cancellovesong(that, app, song, idx, list, cb) {

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
            wx.hideLoading();
            wx.showToast({
                title: '取消成功',//提示文字
                duration:1000,//显示时长
                icon:'success',
            });
            app.globalData.loved_music[0].splice(app.globalData.loved_music[0].indexOf(song.id), 1);
            list[idx].love = 0;
            cb && cb();
        },
        fail: function () {
            wx.hideLoading();
        }
    })
}

function lovealbum(that, app, album, idx, list, cb) {
    wx.showLoading({
        title: '正在收藏...',
    });
    var data = {
        user_id: app.globalData.id,
        album_id: album.id,
        album_name: album.name,
        picurl: album.picUrl,
        artist_name: (album.artists) ? album.artists[0].name : album.ar[0].name
    };
    wx.request({
        url: asurl + "album/add-love-album",
        method: "GET",
        data: data,
        success: function (res) {
            app.globalData.loved_music[1].push(album.id);
            list[idx].love = 1;
            cb && cb();
        },
        complete: function () {
            wx.hideLoading();
        }
    })
}

function cancellovealbum(that, app, album, idx, list, cb) {
    wx.showLoading({
        title: '取消收藏...',
    });
    var data = {
        user_id: app.globalData.id,
        album_id: album.id,
    };
    wx.request({
        url: asurl + "album/del-love-album",
        method: "GET",
        data: data,
        success: function (res) {
            app.globalData.loved_music[1].splice(app.globalData.loved_music[1].indexOf(album.id), 1);
            list[idx].love = 0;
            cb && cb();
        },
        complete: function () {
            wx.hideLoading();
        }
    })
}

module.exports = {
    formatTime: formatTime,
    formatduration: formatduration,
    toggleplay: toggleplay,
    playAlrc: playAlrc,
    lovesong: lovesong,
    cancellovesong: cancellovesong,
    lovealbum: lovealbum,
    cancellovealbum: cancellovealbum,
}
