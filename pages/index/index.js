// pages/index/index.js
import request from "../../utils/request";
Page({

  // 跳转至recommendSong页面的回调
  toRecommendSong(){
    wx.navigateTo({
      url: '/pages/recommendSong/recommendSong'
    })
  },

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], //轮播图数据
    recommendList: [],
    topList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // async,await的引入让代码受到堵塞避开axios异步处理
  onLoad: async function (options) {
    let data = {
      'name': "是撒旦撒ss"
    }
    wx.setStorageSync('data', JSON.stringify(data))
    console.log(JSON.parse(wx.getStorageSync('data')))

    //轮播图
    let bannerListData = await request('/banner', {
      type: 2
    });
    // type:0 PC,1 android,2 iphone,3 ipad
    this.setData({
      bannerList: bannerListData.banners
    })

    //获取推荐歌单数据
    let recommendListData = await request('/personalized', {
      limit: 10
    });
    this.setData({
      recommendList: recommendListData.result
    })

    //获取推荐歌单数据
    let index = 0;
    let resultArr = [];
    while (index < 5) {
      let topListData = await request('/top/list', {
        idx: index++
      });
      //splice(会修改原数组，可以对指定的数组进行增删改)，slice(不会)
      let topListItem = {
        name: topListData.playlist.name,
        tracks: topListData.playlist.tracks.slice(0, 3)
      }
      // 用slice拿到trackes数组的三个数组对象{}，{}，{}

      resultArr.push(topListItem);

      //放在这里让用户体验好点
      this.setData({
        topList: resultArr
      })
    }

    //更新topList的状态值，放在此处更新会导致发送请求的过程中页面长时间白屏，用户体验差
    // this.setData({
    //   topList:resultArr
    // })
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