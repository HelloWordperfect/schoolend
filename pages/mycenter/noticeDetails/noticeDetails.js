// pages/mycenter/noticeDetails/noticeDetails.js
import WxParse from '../../../wxParse/wxParse.js';
const app = getApp();
Page({
  data: {
    datas: {}, //内容
    showLoading: true
  },
  // 分享
  onShareAppMessage: function (res) {
    return {
      title: app.globalData.programName,
      path: 'pages/start/start?scene=' + app.globalData.userId
    }
  },
  onLoad: function(options) {
    //console.log(options);
    //公告信息接口
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}common/article`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        type: 1,
        articleId: options.articleid
      },
      success: res => {
        //console.log(res);
        this.setData({
          datas: res.data.data[0]
        });
        let article = res.data.data[0].articleContent;
        article = article.replace(/&amp;nbsp;/g, ' ');
        WxParse.wxParse('article', 'html', article, this, 5);
        //console.log(this.data.datas)
      },
      complete: () => {
        this.setData({
          showLoading: false
        })
      }
    });

  },
});