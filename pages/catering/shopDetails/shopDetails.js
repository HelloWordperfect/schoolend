// pages/shopDetails/shopDetails.js
import WxParse from '../../../wxParse/wxParse.js';
const app = getApp();
let goodsid;
Page({

  data: {
    //遮罩层
    mask: {
      opacity: 0,
      display: 'none',
      goods_id: ''
    },
    showLoading:true, //加载中
    //弹窗
    returnDeposit: {
      translateY: 'translateY(1500px)',
      opacity: 1
    },
    datas: '', //商品详情 
    guiGeNumber: 0, //弹窗里商品规格下标
    KouweiNumber: 0, //弹窗里口味下标
    numbers: 1, //商品数量
    swiperIndexs: 0, //商品详情和规格参数的下标
    imgUrls: [], //轮播图
    baseUrl: app.globalData.baseUrl, //图片路径
    type: '', //判断是否是购物车还是购买
    goodsid:'',  //商品id
    attrName:[],   //规格类型
    proAttrList: [] , //规格
    name:'默认',   //规格参数
    id:'',    //规格id
    list: '', //
    stock: '',  //库存 
    price: '', //价格
    list3: '' , //
    record:[],    //历史选择属性
    floor:0,     //楼层选择
    freight:''   //快递基价
  },
  // 分享
  onShareAppMessage: function (res) {
    return {
      title: app.globalData.programName,
      path: 'pages/catering/shopDetails/shopDetails?scene=' + this.data.userId + '&goodsid=' + this.data.goodsid
    }
  },
  // floor_choose(e){
  //   var index = e.currentTarget.dataset.index;
  //   this.setData({
  //     floor:index
  //   })
  // },

  // 获取formId
  submitOrders(e) {
    //console.log(e)
    var formId = e.detail.formId;
    var formIds = wx.getStorageSync('formId');
    if (!formIds) {
      formIds = [];
    }
    formIds.unshift(formId);
    wx.setStorageSync('formId', formIds);
  },
  onLoad: function (options) {
    //console.log(options);
    goodsid = options.goodsid;
    var schoolId = wx.getStorageSync('schoolId');
    //如果学校id不存在跳转到引导页
    if (!schoolId) {
      wx.reLaunch({
        url: '../../start/start?scene=' + options.scene + '&way=../catering/shopDetails/shopDetails?goodsid=' + this.data.goodsid
      })
    }
    var userId = wx.getStorageSync('userId');
    this.setData({
      schoolId:schoolId,
      userId: userId,
      goodsid: goodsid
    })
    //商品详情接口
    var that = this;
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}goods/goodsInfo`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        schoolId: schoolId,
        goodsId: goodsid
      },
      success: res => {
        //console.log(res);

        var pro = res.data.pro;
        this.setData({
          imgUrls: pro.img_arr,
          datas: pro,
          stock: pro.num,
          img: pro.photo_x
        });
        let article = res.data.pro.content;
        article = article.replace(/&amp;nbsp;/g, ' ');
        WxParse.wxParse('article', 'html', article, this, 5);
        //console.log(this.data.datas)
        var proAttrList = pro.proAttrList;  
        if (proAttrList) {
          var attrName = pro.attrName;  
          var len = attrName.length;
          var list = [];   //规格渲染数据
          var list3 = [];   //规格选择
          var len2 = proAttrList.length;
          var min_price = '';
          var max_price = '';
          for (var k = 0; k < len2; k++) {
            if (k == 0) {
              min_price = parseFloat(proAttrList[0].price);
              max_price = parseFloat(proAttrList[0].price);
            } else {
              var now_price = parseFloat(proAttrList[k].price);
              if (now_price < min_price) {
                min_price = now_price;
              }
              if (now_price > max_price) {
                max_price = now_price;
              }
            }
          }
          if (min_price == max_price) {
            var price = min_price;
          } else {
            var price = min_price + '~' + max_price;
          }

          for (var i = 0; i < len; i++) {
            list3.push('-1');
            var item = {
              attrkey: attrName[i],
              attrValues: [],
              attrValueStatus: []
            };
            for (var j = 0; j < len2; j++) {
              var name_list = proAttrList[j].name.split('/');
              var attrValues = item.attrValues;
              var len3 = attrValues.length;
              var control = true;
              for (var k = 0; k < len3; k++) {
                if (name_list[i] == attrValues[k]) {
                  control = false;
                  len3 = k + 1;
                }
              }
              if (control) {
                item.attrValues.push(name_list[i]);
                item.attrValueStatus.push(true);
              }
            }
            list.push(item);
          }
          //console.log(list)
          that.setData({
            proAttrList: proAttrList,
            list: list,
            price: price,
            list3: list3
          });
        }else{
          that.setData({
            price: pro.price_yh,
          })
        }
      },
      complete: () => {
        this.setData({
          showLoading: false
        })
      }
    });
  },
  /* 选择属性值事件 */
  selectAttrValue: function (e) {
    var record = this.data.record;  //记录历史选择的属性
    var status = e.currentTarget.dataset.status;
    var index1 = e.currentTarget.dataset.hindex;
    var val = e.currentTarget.dataset.val;
    var index2 = e.currentTarget.dataset.index;
    var list3 = this.data.list3;
    var proAttrList = this.data.proAttrList;
    var list = this.data.list;
    var len4 = list.length;
    if (record.length > 0) {
      var len0 = record.length;
      var control3 = false;
      for (var i = 0; i < len0; i++) {
        var record2 = record.slice(0, len0)
        if (record[i] == index1) {
          record = record.slice(0, i);
          len0 = i + 1;
          control3 = true;
        }
        if (control3) {
          var len1 = record2.length;
          //console.log(len1)
          if (i + 1 < len1) {
            list3[record2[i + 1]] = -1;
          }
        }
      }
    }
    //console.log(list3)
    record.push(index1);
    // 全部默认无法选中
    for (var i = 0; i < len4; i++) {
      var len5 = record.length;
      var control2 = true;
      for (var j = 0; j < len5; j++) {
        if (record[j] == i) {
          len5 = j + 1;
          control2 = false;
        }
      }
      if (control2) {
        var len6 = list[i].attrValueStatus.length;
        for (var j = 0; j < len6; j++) {
          list[i].attrValueStatus[j] = false;
        }
      }

    }

    var len = proAttrList.length;
    for (var i = 0; i < len; i++) {
      var name_list = proAttrList[i].name.split('/');
      var len2 = name_list.length;

      if (name_list[index1] == val) {
        for (var j = 0; j < len2; j++) {
          if (j != index1) {
            var val2 = name_list[j];
            var attrValues = list[j].attrValues;
            var len3 = attrValues.length;
            for (var k = 0; k < len3; k++) {
              if (attrValues[k] == val2) {
                list[j].attrValueStatus[k] = true;
              }
            }
          }
        }
      }
    }
    //console.log(list)

    if (status) {
      list3[index1] = index2;
    }
    this.setData({
      list3: list3,
      list: list
    })
    if (record.length == list3.length) {       //规格选完成
      this.setData({
        specs: true  //规格选完成
      })
      
      //console.log('全部选中');
      var len6 = list3.length;
      var specs = [];
      for (var m = 0; m < len6; m++) {
        var val1 = list[m].attrValues[list3[m]];
        specs.push(val1);
      }
      var str = specs.join('/');
      //console.log(str);
      for (var i = 0; i < len; i++) {
        if (proAttrList[i].name == str) {
          if (proAttrList[i].img) {
            //console.log(666)
            this.setData({
              img: proAttrList[i].img
            })
          } else {
            this.setData({
              img: this.data.datas.photo_x
            })
          }
          //console.log(proAttrList[i])
          this.setData({
            id: proAttrList[i].id,
            name: proAttrList[i].name,
            price: proAttrList[i].price,
            stock: proAttrList[i].stock
          })
        }
      }
    } else {
      this.setData({
        specs: false,
        img: this.data.datas.photo_x
      })
    }
  },
  // 进入购物车
  go_cart() {
    wx.switchTab({
      url: '../../cart/cart',
    })
  },

  //点击规格
  bindtapGui(e) {
    //console.log(e);
    let guiGe = e.currentTarget.dataset.index;
    this.setData({
      guiGeNumber: guiGe
    })
    //console.log(this.data.datas.goodsGuige.goodsGui)
    //console.log()
  },
  //点击口味
  bindtapKou(e) {
    //console.log(e);
    let Kouwei = e.currentTarget.dataset.index;
    this.setData({
      KouweiNumber: Kouwei
    })
  },
  // 加入购物车
  addcart() {
    var numbers = this.data.numbers;
    var datas = this.data.datas;
    var goodsimg = this.data.baseUrl+this.data.img;
    var goodsname = datas.name;
    var price = this.data.price;
    var attributeId = this.data.id;
    var  guige = this.data.name;
    //console.log(goodsid)
    var cart_item = { goods_id: goodsid, name: goodsname, attributeId: attributeId, info: guige, img: goodsimg, price: price, num: numbers, };
    var shop_cart = wx.getStorageSync('shop_cart');
    var test = true;
    if (shop_cart) {
      var len = shop_cart.length;
      if (len > 0) {
        for (var i = 0; i < len; i++) {
          if (goodsid == shop_cart[i].goods_id && attributeId == shop_cart[i].attributeId) {
            shop_cart[i].num += numbers;
            test = false;
          }
        }
      }
      if (test) { 
        shop_cart.push(cart_item);
      }
    } else {
      shop_cart = [];
      shop_cart.push(cart_item);
    }
    wx.setStorageSync('shop_cart', shop_cart);
    wx.showToast({
      title: '加入购物车成功',
    })
  },
  // 立即购买
  buy_now() {
    var userPhone = wx.getStorageSync('userPhone');
    if (!userPhone) {
      wx.showModal({
        title: '提示',
        content: '请绑定手机号',
        success: res => {
          if (res.confirm) {
            wx.navigateTo({
              url: '../../mycenter/information/information'
            })
          } else if (res.cancel) {

          }
        }
      })

      return
    }else{
      var numbers = this.data.numbers;
      var datas = this.data.datas;
      var goodsimg = this.data.baseUrl +this.data.img;
      var goodsname = datas.name;
      var price = this.data.price;
      var attributeId = this.data.id;
      var guige = this.data.name;
      //console.log(datas)
      //console.log(goodsid)
      var cart_item = { goods_id: goodsid, name: goodsname, attributeId: attributeId, info: guige, img: goodsimg, price: price, num: numbers };
      wx.setStorageSync('shop_buy', cart_item);
      wx.navigateTo({
        url: `../../submitOrder/submitOrder?type=1&&total=${price * 1 * this.data.numbers * 1}`
      })
    }
    
  },
  //点击显示商品详情
  shopDetail() {
    this.setData({
      swiperIndexs: 0,
    })
  },
  //点击显示规格参数
  shopSize() {
    this.setData({
      swiperIndexs: 1,
    })
  },
  //商品数量减少
  bindtapJian() {
    if (this.data.numbers <= 1) {
      wx.showToast({
        title: '数量不能小于1',
        image: '/image/warning.png',
        duration: 1500
      })
    } else {
      let numbersJian = this.data.numbers * 1 - 1;
      this.setData({
        numbers: numbersJian
      })
    }
  },
  //商品数量减少
  bindtapJia() {
    let numbersJia = this.data.numbers * 1 + 1;
    this.setData({
      numbers: numbersJia
    })
  },
  // 确定
  confrim() {
    var type = this.data.type;
    var list = this.data.list;
    var type = this.data.type;
    if (list[0]) {
      var specs = this.data.specs;
    } else {
      var specs = true;
    }
    if (specs) {
      this.bindtapClose();
      if (type == 1) {
        this.buy_now();
      } else {
        this.addcart();
      }
    } else {
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
    }
  },

  // 动画
  animate: function (status) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })

    this.animation = animation
    animation.translateY(300).step();

    this.setData({
      animationData: animation.export()
    })

    if (status == 1) {

      this.setData(
        {
          showModalStatus: true
        }
      );
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (status == 0) {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)
  },
  //弹窗显示
  bindtapMasks(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      type:index
    })
    this.animate(1);
  },
  //关闭弹窗
  bindtapClose() {
    this.animate(0);
  },
})