import WxParse from '../../wxParse/wxParse.js';
const app = getApp();
Page({

  data: {
    //遮罩层 
    mask: {
      opacity: 0,
      display: 'none',
    },
    //弹窗
    returnDeposit: {
      translateY: 'translateY(1500px)',
      opacity: 1
    },
    datas: '', //商品详情数据
    baseUrl: app.globalData.baseUrl, //图片路径
    lists: [], //送水列表数据
    water: '', //有桶无桶的数组
    floor: '', //楼层的数组
    freight: '0.00', //楼层的价格
    numbers: 1, //商品数量
    swiperIndexs: 0, //商品详情和规格参数的下标
    buy_type: '', //判断是购买还是加入购物车
    price: '', //有无桶的价格
    total: '', //总价
    choose2: 0, //楼层的下标
    choose: 0, //有桶无桶的下标
    list: [],
    schoolName: '', //学校名字
    waterBaseMoney: '',   //水基价

    name: '默认',   //规格参数
    id: '',    //规格id
    attrName: [],   //规格类型
    proAttrList: [], //规格
    list: '', //
    stock: '',  //库存 
    price: '', //价格
    list3: '', //
    record: [],    //历史选择属性
    floor: 0,     //楼层选择
    animationData:{} , //动画
    deliver:[],    //加价规则
    chooses:[],   //加价规则选择
    money2:[],   //加价规则金额
    showLoading1:true,
    showLoading2:true
  },

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
  onShow() {
    var schoolName = wx.getStorageSync('schoolName');
    this.setData({
      schoolName: schoolName,
      chooses:[]
    });
  },
  // 分享
  onShareAppMessage: function (res) {
    return {
      title: app.globalData.programName,
      path: 'pages/water/water?scene=' + this.data.userId
    }
  },
  onLoad: function(options) {
    var goodsId = options.goodsId; 
    var shopId = options.shopId;
    var schoolId = wx.getStorageSync('schoolId');
    //console.log(schoolId)
    //如果学校id不存在跳转到引导页
    if (!schoolId && !options.scene) {
      var way = '../water/water?goodsId=' + goodsId + '&shopId=' + shopId;
      wx.reLaunch({
        url: '../start/start?way=' + way
      })
    }
    if (!schoolId && options.scene) {
      var ways = '../water/water?goodsId=' + goodsId;
      wx.reLaunch({
        url: '../start/start?scene=' + options.scene + '&way=' + ways
      })
    }
    var userId = wx.getStorageSync('userId');
    this.setData({
      schoolId: schoolId,
      userId: userId,
      goodsId: goodsId,
      shopId: shopId
    })
    wx.request({
      url: app.globalData.api + 'common/getShopDliverType',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        shopId: shopId,
      },
      success: res => {
        //console.log(res)
        var data = res.data;
        var status = data.status;
        if (status == 1) {
          var waterBaseMoney = parseFloat(data.data.deliverMoney);
          var deliverBaseId = data.data.deliverBaseId;
          this.setData({
            waterBaseMoney: waterBaseMoney,
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
      complete: () => {
        this.setData({
          showLoading1: false
        })
      }
    })
    this.getLists();
  },
  getLists() {
    var schoolId = this.data.schoolId;
    var userId = this.data.userId;
    var goodsId = this.data.goodsId;
    var that = this;
        //送水详情接口（获取列表的第一个商品Id）
        wx.request({
          method: 'POST',
          url: `${app.globalData.api}goods/goodsInfo`,
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          data: {
            schoolId: schoolId,
            goodsId: goodsId,
          },
          success: res => {
            //console.log({ goodsId: goodsId })
            //console.log(res);
            var pro = res.data.pro;
            this.setData({
              datas: pro,
              img: pro.photo_x,
              bannerItem: pro.img_arr
            });
            //this.loadProductDetail();
            //console.log(this.data.datas);
            let article = pro.content;
            article = article.replace(/&amp;nbsp;/g, ' ');
            WxParse.wxParse('article', 'html', article, this, 5);

            
            var proAttrList = pro.proAttrList;  
            // proAttrList = [{ id: "50", pid: "291", name: "XXL/蓝/HelloKitty", price: "120.00", stock: "119", img:''},
            //   { id: "51", pid: "291", name: "XL/红/Tom", price: "130.00", stock: "100", img: ''},
            //   { id: "52", pid: "291", name: "M/黄/多啦A梦", price: "200.00", stock: "20", img: '' }]; //假数据
            

            if (proAttrList) {
              //var stock = proAttrList[0].stock;
              var attrName = pro.attrName;  
              // attrName = ["尺寸", "颜色", "样式"];   //假数据
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
                //stock: stock,
                price: price,
                list3: list3
              });
            } else {
              that.setData({
                //stock: pro.num,
                price: pro.price_yh
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
          complete: () => {
            this.setData({
              showLoading2: false
            })
          }
        });
    //   }
    // });
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
    if (record.length == list3.length) {
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
            //stock: proAttrList[i].stock
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

  // 加入购车、立即购买确定
  confirm: function(e) {
    var type = this.data.buy_type;
    var list = this.data.list;
    var chooses = this.data.chooses;
    //console.log(chooses)
    var len1 = chooses.length;
    var deliver = this.data.deliver;
    //console.log(deliver)
    var len2 = deliver.length;
    if(len2>0){
      if (len1 == len2) {
        for(var i=0;i<len1;i++){
          if (chooses[i]==undefined){
            wx.showToast({
              title: '请选择规格',
              icon: 'none'
            })
            return
          }
        }
      }else{
        wx.showToast({
          title: '请选择规格',
          icon: 'none'
        })
        return
      }
    }
    if (list[0]) {
      var specs = this.data.specs;
    } else {
      var specs = true;
    }
    if (specs) {
      var freight = parseFloat(this.data.waterBaseMoney);
      var money2 = this.data.money2;
      //console.log(freight)
      //console.log(money2)
      var len3 = money2.length;
      for (var i = 0; i < len3; i++) {
        freight += parseFloat(money2[i]);
        //console.log(freight)
      }
      var price = this.data.price;
      var numbers = this.data.numbers;
      this.setData({
        freight: freight
      })
      if (type == 1) {
        this.buy_now();
      } else {
        this.addShopCart();
      }
      this.bindtapClose();
    } else {
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
    }
  },
  // 进入购物车
  go_cart() {
    wx.switchTab({
      url: '../cart/cart',
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
              url: '../mycenter/information/information'
            })
          } 
        }
      })

      return
    } else{
      var price = this.data.price;
      var freight = this.data.freight;
      var u_price = parseFloat(price);
      var attributeId = this.data.id;
      var guige = this.data.name;
      var choose = this.data.choose;
      var chooses = this.data.chooses;
      var deliverBaseId = this.data.deliverBaseId;
      chooses.unshift(deliverBaseId);
      var floor = this.data.floor;
      var numbers = this.data.numbers;
      var goodsId = this.data.goodsId;
      var shopId = this.data.shopId;
      var water_item = { shopId:shopId,attributeId: attributeId, info: guige, chooses: chooses, img: app.globalData.baseUrl + this.data.img, price: u_price, num: numbers, shopId: this.data.shopId, goodsId: goodsId, freight: freight, name: this.data.datas.name };
      wx.setStorageSync('water_buy', water_item);
      this.setData({
        chooses: []
      });
      wx.navigateTo({
        url: `../submitOrder/submitOrder?type=2&&total=${price*1*numbers}`
      })
    }
  },
  // 加入购物车
  addShopCart() {
    var price = this.data.price;
    var freight = this.data.freight;
    var u_price = parseFloat(price);
    var attributeId = this.data.id;
    var guige = this.data.name;
    var choose = this.data.choose;
    var chooses = this.data.chooses;
    var deliverBaseId = this.data.deliverBaseId;
    chooses.unshift(deliverBaseId);
    var floor = this.data.floor;
    var numbers = this.data.numbers;
    var goodsId = this.data.goodsId;
    var shopId = this.data.shopId;
    var water_item = { shopId:shopId,attributeId: attributeId, info: guige, chooses: chooses, img: app.globalData.baseUrl + this.data.img, price: u_price, num: numbers, shopId: this.data.shopId, goodsId: goodsId, freight: freight, name: this.data.datas.name};

    var water = wx.getStorageSync('water_cart');
    var control = true;
    if (water) {
      var len = water.length;
      for (var i = 0; i < len; i++) {
        var chooses1 = chooses.toString();
        var chooses2 = water[i].chooses.toString();
        var len2 = chooses.length;
        if (attributeId == water[i].attributeId && goodsId == water[i].goodsId && chooses1 == chooses2) {
          water[i].num += numbers;
          control = false;
        }
      }
      if (control) {
        water.push(water_item);
        control = false;
      }
    }
    if (control) {
      water = [];
      water.push(water_item);
    }
    this.setData({
      chooses: []
    });
    wx.setStorageSync('water_cart', water);
    wx.showToast({
      title: '成功加入购物车',
      icon: 'none',
      duration: 1000
    })
  },
  // 影响运费 规格选择
  choose2(e) {
    var index1 = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.id;
    var price = e.currentTarget.dataset.price;
    var chooses = this.data.chooses;
    var money2 = this.data.money2;
    chooses[index1] = id;
    money2[index1] = price;
    //console.log(chooses)
    //console.log(chooses.length)
    this.setData({
      chooses: chooses,
      money2: money2
      // freight: freight,
    })
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
        numbers: numbersJian,
      })
    }
  },
  //商品数量增加
  bindtapJia() {
    var numbersJia = this.data.numbers * 1 + 1;
    this.setData({
      numbers: numbersJia
    })
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
    var index = e.currentTarget.dataset.type;
    this.setData({
      buy_type: index
    })
    this.animate(1);
  },
  //关闭弹窗
  bindtapClose() {
    this.animate(0);
  },
})