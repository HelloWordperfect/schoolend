// pages/courier/courier.js
var app = getApp();
Page({
 
  /**
   * 页面的初始数据
   */
  data: { 
    take_info: '',
    send_info: '',
    choose1: 0, //时间选择
    choose2: 0,  //公斤选择
    time:[], //选择时间
    weight: [],  //选择重量
    textarea:'',
    total: '0.00',  //总价
    basisPrice:'0.00',  //基础价
    weightPrice: '0.00',
    timePrice: '0.00',
    insurance:'0.00', //保险费用
    deliver:[] ,  //加价
    chooses: [],  //加价选择id
    choosesName: [],  //加价选择name
    money2:[],  //加价金额
    showLoading:true, //加载中
    deliverBaseId:'' , //基价id
  },
  // 分享
  onShareAppMessage: function (res) {
    return {
      title: app.globalData.programName,
      path: 'pages/courier/courier?scene=' + app.globalData.userId
    }
  },
  // 选择送达时间
  choose(e){
  //console.log(e)
    var index1 = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    var price = e.currentTarget.dataset.money;
    var chooses = this.data.chooses;
    var choosesName = this.data.choosesName;  
    var money2 = this.data.money2;
    chooses[index1] = id;
    choosesName[index1] = name;
    money2[index1] = price;
    var len = money2.length;
  //console.log(money2)
    var total = this.data.basisPrice;
    for (var i = 0; i < len; i++) {
    //console.log(money2[i])
      if (money2[i]) {
      //console.log(total)
        total += parseFloat(money2[i]);
      }
    }
  //console.log(total)
    this.setData({
      chooses: chooses,
      money2: money2,
      choosesName: choosesName,
      total: total
    })
  },
  // 备注信息
  textarea(e){
    var val = e.detail.value;
    this.setData({
      textarea:val
    })
  },
  // 提交
  submit() {
    var userPhone = wx.getStorageSync('userPhone');
    if (!userPhone) {
      wx.showModal({
        title: '提示',
        content: '请绑定手机号',
        success: res => {
          if (res.confirm) {
            wx.navigateTo({
              url: '../mycenter/information/information'
            })
          } else if (res.cancel) {

          }
        }
      })

      return
    } else {

      var take_info = this.data.take_info;
      var send_info = this.data.send_info;
      var textarea = this.data.textarea;
      if (!take_info) {
        wx.showToast({
          title: '请填写取件地址',
          icon: 'none'
        })
        return
      }
      if (!send_info) {
        wx.showToast({
          title: '请填写送件地址',
          icon: 'none'
        })
        return
      }
      var chooses = this.data.chooses; 
      var choosesName = this.data.choosesName;
      var len1 = chooses.length;
      var deliver = this.data.deliver;
      var len2 = deliver.length;
      if (len2 > 0) {
        if (len1 == len2) {
          for (var i = 0; i < len1; i++) {
            if (chooses[i] == undefined) {
              wx.showToast({
                title: '请选择规格',
                icon: 'none'
              })
              return
            }
          }
        } else {
          wx.showToast({
            title: '请选择规格',
            icon: 'none'
          })
          return
        }
      }

      var total = this.data.total;
      var insurance = this.data.insurance;
      var weight = this.data.weight;
      var time = this.data.time; 
      var deliverBaseId = this.data.deliverBaseId; 
      chooses.unshift(deliverBaseId)
      var courier_buy = {
        deliverIds: chooses.toString(),
        deliverInfo: choosesName.toString().replace(/\,/g,' '),
        take_info: take_info,
        send_info: send_info,
        textarea: textarea
      }
      wx.setStorageSync('courier_buy', courier_buy);
      this.setData({
        chooses:[]
      })
      wx.navigateTo({
        url: `./submit/submit?insurance=${insurance}&total=${total}`
      })
    }
  },
  onLoad: function (options) {
    var schoolId = wx.getStorageSync('schoolId');
    //如果学校id不存在跳转到引导页
    if (!schoolId && !options.scene) {
    //console.log('1111')
      wx.reLaunch({
        url: '../start/start?way=../courier/courier'
      })
    }
    //如果学校id不存在跳转到引导页
    if (!schoolId && options.scene) {
    //console.log('222222')
      wx.reLaunch({
        url: '../start/start?scene=' + options.scene + '&way=../courier/courier'
      })
    }
    var schoolName = wx.getStorageSync('schoolName');
    var userId = wx.getStorageSync('userId');
    this.setData({
      schoolId: schoolId,
      userId: userId,
      schoolName: schoolName
    })
    wx.removeStorageSync('take_info');
    wx.removeStorageSync('send_info');
    // 获取保险费
    wx.request({
      url: app.globalData.api + 'common/sysConfig',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        adType: '',
      },
      success: res => {
      //console.log(res)
        var data = res.data;
        var status = data.status;
        if (status == 1) {
          data = data.data;
          var insurance = data[0].protectMoney.fieldValue;
          this.setData({
            insurance: insurance
          })
        } else {
          wx.showToast({
            title: data.msg,
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
      }
    })
    // 请求加价类型
    wx.request({
      url: app.globalData.api + 'common/getShopDliverType',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        shopId: 2,
      },
      success: res => {
      //console.log(res)
        var data = res.data;
        var status = data.status;
        if (status == 1) {
          var basisPrice = parseFloat(data.data.deliverMoney);
          var deliverBaseId = data.data.deliverBaseId;
          this.setData({
            basisPrice: basisPrice,
            deliverBaseId: deliverBaseId
          })
        //console.log(data.data.deliver)
          if (data.data.deliver && data.data.deliver.length > 0) {
            var deliver = data.data.deliver;
            this.setData({
              deliver: deliver
            })
          }
        } else {
          wx.showToast({
            title: data.msg,
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
      complete:() => {
        this.setData({
          showLoading:false
        })
      }
    })
  }, 
  onShow: function () {
    
    // // 取件信息
    var take_info = wx.getStorageSync('take_info');
    // //console.log(take_info)
    if (take_info){
      this.setData({
        take_info: take_info
      })
    }
    // // 收件信息
    var send_info = wx.getStorageSync('send_info');
    // //console.log(send_info)
    if (send_info) {
      this.setData({
        send_info: send_info
      })
    }

    
  },
  // 选择取件地址
  take: function () {
    wx.navigateTo({
      url: 'perfect/perfect'
    })
  },
  // 选择收件地址
  send: function () {
    wx.navigateTo({
      url: 'send_where/send_where'
    })
  }
})