// pages/songDetail/songDetail.js
import PubSub from 'pubsub-js'
import request from '../../utils/request'
const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, //播放暂停标识
    musicId: "", //传过来的推荐歌曲的Id
    song: {}, //歌曲详情对象
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // options: 用于接收路由跳转的query参数
    // 原生小程序中路由传参，对参数的长度有限制，如果参数长度过长会自动截取掉

    let musicId = options.song
    //获取音乐详情
    this.getMusicInfo(musicId)

    /*
     * 问题： 如果用户操作系统的控制音乐播放/暂停的按钮，页面不知道，导致页面显示是否播放的状态和真实的音乐播放状态不一致
     * 解决方案：
     *   1. 通过控制音频的实例 backgroundAudioManager 去监视音乐播放/暂停
     *
     * */

    // 判断当前页面音乐是否在播放
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      // 修改当前页面音乐播放状态为true
      this.setData({
        isPlay: true
      })
    }

    // 创建控制音乐播放的实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager();

    //监视音乐播放/暂停/停止(要真机才能看得到)
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true)

      //修改全局变量音乐播放的状态
      // appInstance.globalData.isMusicPlay=true;
      appInstance.globalData.musicId = musicId;
    });
    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false)
      // appInstance.globalData.isMusicPlay=false;
    });
    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false)
      // appInstance.globalData.isMusicPlay=false;
    });
  },
  //修改播放状态的功能函数
  changePlayState(isPlay) {
    //修改音乐是否的状态
    this.setData({
      isPlay
    });
    //修改全局变量音乐播放的状态
    appInstance.globalData.isMusicPlay = isPlay;
  },
  //点击播放/暂停的回调
  handleMusicPlay() {
    let isPlay = !this.data.isPlay;
    // this.setData({
    //   isPlay
    // })

    let {
      musicId
    } = this.data;
    this.musicControl(isPlay, musicId)
  },

  //控制音乐播放/暂停的功能函数
  async musicControl(isPlay, musicId) {

    if (isPlay) {
      //获取音乐播放链接
      let musicLinkData = await request('/song/url', {
        id: musicId
      })
      let musicLink = musicLinkData.data[0].url

      //设置了src 时，会自动开始播放
      this.backgroundAudioManager.src = musicLink
      //当设置title(歌曲名称)，才会播放
      this.backgroundAudioManager.title = this.data.song.name
    } else {
      this.backgroundAudioManager.pause()
    }
  },
  //获取音乐详情的功能函数
  async getMusicInfo(musicId) {
    let songData = await request('/song/detail', {
      ids: musicId
    })
    this.setData({
      musicId,
      song: songData.songs[0]
    })

    //动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.name,
    })
  },

  handleSwitch(event) {
    // console.log(event.target.id)
    let ChangeSong = event.target.id;

    //发送消息给recommendSong页面
    PubSub.publish('switchType', ChangeSong);

    //订阅来自recommendSong页面发布的musicId消息
    //订阅消息每执行一次之前的回调都会执行，且累加次数
    PubSub.subscribe('musicId', (msg, musicId) => {
      console.log(musicId)

      //关闭之前的正在播放的音乐
      this.backgroundAudioManager.pause()
      //获取音乐详情信息
      this.getMusicInfo(musicId)
      //自动播放当前的音乐
      this.musicControl(true, musicId)
      //取消订阅
      PubSub.unsubscribe('musicId');
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