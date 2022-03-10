// pages/recommendSong/recommendSong.js
import PubSub from 'pubsub-js'
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: '',
    month: '',
    recommendList: [], // 推荐列表数据
    index: 0, //歌曲列表标识
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 判断用户是否登录
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }
      })
    }

    // 更新日期的状态数据
    this.setData({
        day: new Date().getDate(),
        //国外月份比我们少一个月
        month: new Date().getMonth() + 1
      }),

      // 获取用户每日推荐数据
      this.getRecommendList();

    //订阅来自songDetail页面发布的消息
    PubSub.subscribe('switchType', (msg, data) => {
      let {
        recommendList,
        index
      } = this.data;
      if (data === 'pre') { //上一首
        (index === 0) && (index = recommendList.length) //如果index为0时其指向列表末端(此时超出列表长度，要配合index -= 1使用，使其指向列表末端)
        index -= 1;
      } else { //下一首
        (index === recommendList.length - 1) && (index = -1)
        index += 1;
      }
      //更新下标
      this.setData({
        index
      })
      let musicId = recommendList[index].id

      //将musicId回传给songDetail页面
      PubSub.publish('musicId', musicId)
    })
  },

  async getRecommendList() {
    let recommendListData = await request('/recommend/songs');
    this.setData({
      recommendList: recommendListData.recommend
    })
  },

  toSongDetail(event) {
    let {
      song,
      index
    } = event.currentTarget.dataset;
    this.setData({
      index: index //存储歌单列表歌单
    })
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?song=' + song.id,
    })
    console.log(event.currentTarget.dataset)
  },

  //
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

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