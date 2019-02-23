// pages/universal_help/universal_help.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    img_url: app.globalData.baseUrl,
    showLoading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var schoolId = wx.getStorageSync('schoolId');
    wx.request({
      url: app.globalData.api + 'shop/helpShopList',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        schoolId: schoolId,
        type: 2
      },
      success(res) {
        //console.log(res)
        var status = res.data.status;
        if (status == 1) {
          var root = res.data.data.root;
          that.setData({
            root: root
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            duration: 2000,
            icon: 'none'
          });
        }

      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000,
          icon: 'none'
        });
      },
      complete() {
        that.setData({
          showLoading: false
        })
      }
    })
  },


  // 分享
  onShareAppMessage: function (res) {
    return {
      title: app.globalData.programName,
      path: 'pages/start/start?scene=' + this.data.userId
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  }
  
})