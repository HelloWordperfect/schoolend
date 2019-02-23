// pages/shutDown/shutDown.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    time:'9:00-20:00'
  },
  
  onShow: function () {
    var time = wx.getStorageSync('time');
    if(time){
      this.setData({
        time:time
      })
    }
  },
  go(){
    console.log(444)
  },
  // 分享
  onShareAppMessage: function (res) {
    return {
      title: app.globalData.programName,
      path: 'pages/start/start?scene=' + app.globalData.userId
    }
  },
})