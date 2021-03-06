// pages/address/address.js
const app = getApp();
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    address: '',
    type:0,
    userId:'',  //用户id
    showLoading:true
  },

  onLoad: function(options) {
    var schoolId = wx.getStorageSync('schoolId');
    //console.log(schoolId)
    //如果学校id不存在跳转到引导页
    if (!schoolId) {
      //console.log('1111111111');
      var way = '../address/address';
      wx.reLaunch({
        url: '../start/start?way=' + way
      });
    }
    if (options.type){
      this.setData({
        type: options.type
      })
    }
  },
  // 分享
  onShareAppMessage: function (res) {
    return {
      title: app.globalData.programName,
      path: 'pages/start/start?scene=' + this.data.userId
    }
  },
  onShow() {
    //请求地址接口
    var userId = wx.getStorageSync('userId');
    this.setData({
      userId: userId
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}address/list_address`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        userId: userId
      },
      success: res => {
        wx.stopPullDownRefresh();
        //console.log(res);
        this.setData({
          address: res.data.data
        });
      },
      complete: () => {
        this.setData({
          showLoading: false
        })
      }
    });
  },
  // 删除地址
  del(e) {
    var index = e.currentTarget.dataset.index;
    //console.log(index)
    wx.showModal({
      title: '提示',
      content: '确认删除该条地址吗？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中',
          })
          wx.request({
            method: 'POST',
            url: `${app.globalData.api}address/del_address`,
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
              addressId: index
            },
            success: res => {
              //console.log(res);
              wx.hideLoading();
              if (res.data.status == 1) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 1500
                });
                var choose = wx.getStorageSync('default_address');
                if (choose.addressId == index){
                  wx.removeStorageSync('default_address');
                }
                this.onShow();
              } else {
                wx.showToast({
                  title: '删除失败',
                  imgae: '../../image/warning.png',
                  duration: 1500
                })
              } 
            }
          });
        } else if (res.cancel) {
          //console.log('用户点击取消')
        }
      }
    })
  },
  // 编辑地址
  write(e) {
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: `./addAddress/addAddress?type=${index}`
    })
  },
  // 选择返回上一页 type=1
  goBack(e){ 
    var index = e.currentTarget.dataset.index;
    var isDefault = e.currentTarget.dataset.isDefault;
    var addId = e.currentTarget.dataset.id;
    var address = this.data.address;
    var choose = address[index];
    if (isDefault == 1) {
      var addre = this.data.address.filter(item => item.addressId == addId)[0];
      //console.log(addre);
      wx.showLoading({
        title: '加载中',
      })
      wx.request({
        method: 'POST',
        url: `${app.globalData.api}address/add_address`,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          userId: app.globalData.userId,
          addressId: addId,
          isDefault: 1,
          address: addre.address,
          floorNum: addre.floorNum,
          buildName: addre.buildName,
          schoolName: addre.schoolName,
          userPhone: addre.userPhone,
          userName: addre.userName,
        },
        success: res => {
          //console.log(res);
          wx.hideLoading()
          if (res.data.status == 1) {
            wx.showToast({
              title: '默认地址设置成功',
              icon: 'none',
              duration: 1500
            });
            wx.setStorageSync('default_address', choose);
            this.onShow();
            setTimeout(function() {
              wx.navigateBack({
                delta: 1,
              })
            }, 1000)
            // 2、返回上一页
          } else {
            wx.showToast({
              title: '默认地址设置失败',
              icon: 'none',
              duration: 1500
            });
          }
        }
      });
    }else{
      wx.setStorageSync('default_address', choose);
      setTimeout(function () {
        wx.navigateBack({
          delta: 1,
        })
      }, 1000)
    }
  }, 
  // 选择返回上一页 type=2
  goBack2(e) {
    var index = e.currentTarget.dataset.index;
    var address = this.data.address;
    var choose = address[index];
    wx.setStorageSync('send_info2', choose);
    setTimeout(function () {
      wx.navigateBack({
        delta: 1,
      })
    }, 1000)
  }, 
  // 选择默认地址
  choose(e) {
    // 1、将该条地址设为默认地址
    var index = e.currentTarget.dataset.index;
    var addId = e.currentTarget.dataset.id;
    var addre = this.data.address.filter(item => item.addressId == addId)[0];
    //console.log(addre);
    var address = this.data.address;
    var choose = address[index];
    //console.log(address)
    //console.log(choose)
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}address/add_address`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        userId: app.globalData.userId,
        addressId: addId,
        isDefault: 1,
        address: addre.address,
        floorNum: addre.floorNum,
        buildName: addre.buildName,
        schoolName: addre.schoolName,
        userPhone: addre.userPhone,
        userName: addre.userName,
      },
      success: res => {
        //console.log(res);
        wx.hideLoading()
        if (res.data.status == 1) {
          wx.showToast({
            title: '默认地址设置成功',
            icon: 'none',
            duration: 1500
          });
          wx.setStorageSync('default_address', choose);
          this.onShow();
          // setTimeout(function() {
          //   wx.navigateBack({
          //     delta: 1,
          //   })
          // }, 1000)
          // 2、返回上一页
        } else {
          wx.showToast({
            title: '默认地址设置失败',
            icon: 'none',
            duration: 1500
          });
        }
      }
    });
  },
  //下拉刷新
  onPullDownRefresh(){
    this.onShow();
  },
})