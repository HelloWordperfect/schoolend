// pages/retrieve/retrieve.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  // 分享
  onShareAppMessage: function (res) {
    return {
      title: app.globalData.programName,
      path: 'pages/start/start?scene=' + app.globalData.userId
    }
  },
  
})