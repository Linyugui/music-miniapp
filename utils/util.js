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
    if (that.data.playing) {
        console.log("暂停播放");
        that.setData({playing: false});
        app.stopmusic(1);
    } else {
        console.log("继续播放")
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
            lrc: [],
            showlrc: false,
            lrcindex: 0,
            duration: formatduration(app.globalData.curplay.duration || app.globalData.curplay.dt)
        });
        wx.setNavigationBarTitle({title: app.globalData.curplay.name});
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

module.exports = {
    formatTime: formatTime,
    formatduration: formatduration,
    toggleplay: toggleplay,
    playAlrc: playAlrc,
}
