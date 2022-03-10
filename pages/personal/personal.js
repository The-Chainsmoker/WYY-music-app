import request from '../../utils/request'

// pages/personal/personal.js
let startY = 0;
let moveY = 0;
let moveDistance = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: 'translateY(0)',
    //首开手指缓慢回弹
    coveTransition: '',

    userInfo: {}, //用户信息
    recentPlayList: [], //用户播放记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      // 更新userInfo的状态
      this.setData({
        userInfo: JSON.parse(userInfo) //反编译把js格式转化为json格式(接收数据)
      })

      //获取用户播放记录的功能
      this.getUserRecentPlayList(this.data.userInfo.userId)
    }
  },

  //获取用户播放记录的功能函数
  async getUserRecentPlayList(userId) {
    let recentPlayListData = await request('/user/record', {
      uid: userId,
      type: 0
    })
    console.log(recentPlayListData)
    let index = 0;
    //向对象组加入新的对象id
    let recentPlayList = recentPlayListData.allData.splice(0, 10).map(item => {
      item.id = index++;
      return item;
    })


    this.setData({
      recentPlayList: recentPlayList
    })
  },


  handleTouchStart(event) {
    this.setData({
      coveTransition: ''
    })
    //获取手指起始坐标(以最顶部为原点)
    startY = event.touches[0].clientY
  },
  handleTouchMove(event) {
    //滑动后的坐标
    moveY = event.touches[0].clientY;
    moveDistance = moveY - startY;

    if (moveDistance <= 0) {
      return;
    } //不能向上移动
    if (moveDistance >= 80) {
      moveDistance = 80
    }
    //动态更新
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`
    })
  },
  handleTouchEnd() {
    this.setData({
      coverTransform: `translateY(${0}rpx)`,
      coveTransition: 'transform 1s linear'
    })
  },

  //跳转至登录Login页面的回调
  toLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})