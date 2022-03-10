// pages/video/video.js
import request from "../../utils/request"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], //导航标签数据
    navId: '', //导航的标识
    videoList: [], //视频列表数据
    videoId: '', //视频id标识
    videoUpdateTime: [], //记录时间播放的时长
    isTruggered: 'false' //标识下拉刷新是否被触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取导航数据
    this.getVideoGroupListData();
  },

  //获取导航数据
  async getVideoGroupListData() {
    let videoGroupListData = await request('/video/group/list')
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0, 14), //0~13条数据

      navId: videoGroupListData.data[0].id
      // 初始化navI的值其被选中
    })

    // 获取视频数据
    this.getVideoList(this.data.navId)
  },

  //点击切换导航的回调
  changeNav(event) {
    // 获取id元素的值
    let navId = event.currentTarget.id; //通过id向event传参时如果是number会自动转换为String
    // let navId = event.currentTarget.dataset.id; //dataset则number不会自动转换为String
    this.setData({
      navId: navId >>> 0,
      //右移零位将非number数据强制转换成number
      videoList: []
      // 点击导航让之前的视频数据清空
    })

    //显示正在加载
    wx.showLoading({
      title: '正在加载',
    })
    //动态获取当前导航对应的视频数据
    this.getVideoList(this.data.navId)
  },

  //获取导航的视频数据
  async getVideoList(navId) {
    // if (!navId) {
    //   return;
    // }
    let videoListData = await request('/video/group', {
      id: navId
    })

    //关闭消息框
    wx.hideLoading();

    //加入id的唯一标识符(key)
    let index = 0;
    let videoList = videoListData.datas.map(item => {
      item.id = index++;
      return item;
    })

    this.setData({
      videoList
    })
    // console.log(videoList)
  },

  //点击播放/继续播放的回调
  handlePlay(event) {
    let vid = event.currentTarget.id;
    // this.vid !== vid && this.videoContext && this.videoContext.stop();
    //等价于
    // if(this.vid !== vid){
    //   if(this.videoContext){
    //     this.videoContext.stop()
    //   }
    // }
    //跟下面一样要更新之前的vid值不然this.vid始终为空
    // this.vid = vid;

    //更新data中videoId的状态数据
    this.setData({
      videoId: vid
    })

    //创建控制video标签的实例对象（之前的）
    this.videoContext = wx.createVideoContext(vid);


    //判断当前的视频之前是否播放过，是否有播放记录，如果有,跳到指定的播放位置(概括描述)
    //拿到data中的的数据
    let {
      videoUpdateTime
    } = this.data;
    let videoItem = videoUpdateTime.find(item => item.vid === vid);
    if (videoItem) {
      this.videoContext.seek(videoItem.currentTime); //跳到指定的播放位置
    } else {
      this.videoContext.play();
    }
  },

  //监听视频播放进度的回调
  handleTimeUpdate(event) {
    let videoTimeObj = {
      vid: event.currentTarget.id,
      currentTime: event.detail.currentTime
    }
    //拿到data中的的数据
    let {
      videoUpdateTime
    } = this.data
    /*如果找到videoUpdateTime数组对象中的那组对象的vid和当前视频播放的vid相同,
    则把那组对象的内存地址指向videoIte(videoItem和那组对象指向了同一块内存地址)*/
    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);

    if (videoItem) { //之前有那组对象
      videoItem.currentTime = event.detail.currentTime;
    } else { //之前有那组对象这更新观看时长
      videoUpdateTime.push(videoTimeObj);
    }
    //更新videoUpdateTime
    this.setData({
      videoUpdateTime
    })
  },

  //监听视频播放进度的结束
  handleEnded(event) {
    //拿到data中的的数据
    let {
      videoUpdateTime
    } = this.data
    //找到数组那个视频的对象的位置
    var index = videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id);
    //删掉数组那个视频的对象
    videoUpdateTime.splice(index, 1)

    //更新videoUpdateTime
    this.setData({
      videoUpdateTime
    })
  },

  //自定义下拉刷新的回调：scroll-view
  handleRefresher() {
    //再次发请求，获取最新的视频列表数据
    this.getVideoList(this.data.navId),
      this.setData({
        isTruggered: false //关闭下拉刷新
      })
  },
  //自定义上拉触底的回调：scroll-view
  handleToLower() {
    console.log('scroll-view 上拉触底');
    // 数据分页： 1. 后端分页， 2. 前端分页
    console.log('发送请求 || 在前端截取最新的数据 追加到视频列表的后方');
    console.log('网易云音乐暂时没有提供分页的api');
    //模拟最新数据
    let newViedeoList = [{
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_F38F4C0A276039F41270428D4907B2B7",
          "coverUrl": "https://p2.music.126.net/ghjQP8sGMbUK5HhYMqzlMg==/109951165021872165.jpg",
          "height": 720,
          "width": 1280,
          "title": "盘尼西林翻唱朴树《New Boy》",
          "description": "盘尼西林翻唱朴树《New Boy》\n\n#这个翻唱有意思#",
          "commentCount": 257,
          "shareCount": 1907,
          "resolutions": [{
              "resolution": 240,
              "size": 35821651
            },
            {
              "resolution": 480,
              "size": 60634014
            },
            {
              "resolution": 720,
              "size": 99481454
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 350000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/tb8-dIH6MEI7fsXkinEOwA==/109951164417862349.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 350200,
            "birthday": 1567267200000,
            "userId": 253843819,
            "userType": 204,
            "nickname": "嬉皮星球",
            "signature": "独立音乐推广人",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951164417862350,
            "backgroundImgId": 109951164417865380,
            "backgroundUrl": "http://p1.music.126.net/W7Bkj5fyBoYAS5fzRLJQuA==/109951164417865376.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "音乐视频达人"
            },
            "djStatus": 0,
            "vipType": 11,
            "remarkName": null,
            "backgroundImgIdStr": "109951164417865376",
            "avatarImgIdStr": "109951164417862349"
          },
          "urlInfo": {
            "id": "F38F4C0A276039F41270428D4907B2B7",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/K0M9tu58_2974393441_shd.mp4?ts=1627224455&rid=8A7509165B291E84A42CB4C0136CC84D&rl=3&rs=eLKkyjNqOlkZAIkGEFYOuHyBSQEAmNNQ&sign=b2be91a0d0151fc1804052e301a6fdef&ext=opYZEnTp71Z%2B15rp9KVUkVPv0wL94ck4WYbGIknLmVbdm6MJk%2BoXRJ26iZxmIUCOaNsPhnRU78SHOegg7%2F8P8%2BXmUtpqXtJKiSpr4zcttEU0Gf8usS1gvrgf2VH5F7p8IQUYdgqP5WSPgkzgWBommIOLPhJMTSOL2AZH3UCICDn5wOw1UKp%2FR4OevJbuXRJGnKTDKhIjyR9E8BN7DcunblveUgM98jagBhGSXsDllAepAqTzHbCgs1ziDRYCOtQm",
            "size": 99481454,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 720
          },
          "videoGroup": [{
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 4101,
              "name": "娱乐",
              "alg": null
            },
            {
              "id": 3101,
              "name": "综艺",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [{
            "name": "New Boy",
            "id": 139371,
            "pst": 0,
            "t": 0,
            "ar": [{
              "id": 4721,
              "name": "朴树",
              "tns": [],
              "alias": []
            }],
            "alia": [],
            "pop": 100,
            "st": 0,
            "rt": "600902000001102508",
            "fee": 1,
            "v": 38,
            "crbt": null,
            "cf": "",
            "al": {
              "id": 13892,
              "name": "我去2000年",
              "picUrl": "http://p4.music.126.net/XC_KCBokxczQjq0asRBsbQ==/109951166118038905.jpg",
              "tns": [],
              "pic_str": "109951166118038905",
              "pic": 109951166118038910
            },
            "dt": 224400,
            "h": {
              "br": 320000,
              "fid": 0,
              "size": 8978852,
              "vd": -35883
            },
            "m": {
              "br": 192000,
              "fid": 0,
              "size": 5387329,
              "vd": -33327
            },
            "l": {
              "br": 128000,
              "fid": 0,
              "size": 3591567,
              "vd": -31740
            },
            "a": null,
            "cd": "1",
            "no": 1,
            "rtUrl": null,
            "ftype": 0,
            "rtUrls": [],
            "djId": 0,
            "copyright": 2,
            "s_id": 0,
            "rtype": 0,
            "rurl": null,
            "mst": 9,
            "cp": 22036,
            "mv": 0,
            "publishTime": 915120000000,
            "privilege": {
              "id": 139371,
              "fee": 1,
              "payed": 0,
              "st": 0,
              "pl": 0,
              "dl": 0,
              "sp": 0,
              "cp": 0,
              "subp": 0,
              "cs": false,
              "maxbr": 999000,
              "fl": 0,
              "toast": false,
              "flag": 0,
              "preSell": false
            }
          }],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "F38F4C0A276039F41270428D4907B2B7",
          "durationms": 249728,
          "playTime": 504338,
          "praisedCount": 5414,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_4E6681D3FC6E0C8BDE1572AD706434CD",
          "coverUrl": "https://p2.music.126.net/kc5h2SULF7NJogJiVZUEFQ==/109951163934883284.jpg",
          "height": 720,
          "width": 1280,
          "title": "前奏一响起，感觉全身打了鸡血，这个乐队让摇滚不朽",
          "description": "前奏一响起，感觉全身打了鸡血，这个乐队让摇滚不朽",
          "commentCount": 145,
          "shareCount": 232,
          "resolutions": [{
              "resolution": 240,
              "size": 24143983
            },
            {
              "resolution": 480,
              "size": 38504091
            },
            {
              "resolution": 720,
              "size": 47619712
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 430000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/kKwDfXNCECPLeR4hFwMQvw==/109951164779563364.jpg",
            "accountStatus": 0,
            "gender": 0,
            "city": 430100,
            "birthday": -2209017600000,
            "userId": 90188550,
            "userType": 0,
            "nickname": "音乐嗨FIVE",
            "signature": "最好听最时尚的音乐",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951164779563360,
            "backgroundImgId": 2002210674180201,
            "backgroundUrl": "http://p1.music.126.net/o3G7lWrGBQAvSRt3UuApTw==/2002210674180201.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "backgroundImgIdStr": "2002210674180201",
            "avatarImgIdStr": "109951164779563364"
          },
          "urlInfo": {
            "id": "4E6681D3FC6E0C8BDE1572AD706434CD",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/uEjjYaND_2382836968_shd.mp4?ts=1627224455&rid=8A7509165B291E84A42CB4C0136CC84D&rl=3&rs=NUkYUhAOAJOMhCfttYpmoLGziYkwKCnf&sign=3742acd1b01783d293a909f55ff604d3&ext=opYZEnTp71Z%2B15rp9KVUkVPv0wL94ck4WYbGIknLmVbdm6MJk%2BoXRJ26iZxmIUCOaNsPhnRU78SHOegg7%2F8P8%2BXmUtpqXtJKiSpr4zcttEU0Gf8usS1gvrgf2VH5F7p8IQUYdgqP5WSPgkzgWBommIOLPhJMTSOL2AZH3UCICDn5wOw1UKp%2FR4OevJbuXRJGnKTDKhIjyR9E8BN7DcunblveUgM98jagBhGSXsDllAepAqTzHbCgs1ziDRYCOtQm",
            "size": 47619712,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 720
          },
          "videoGroup": [{
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 4105,
              "name": "摇滚",
              "alg": null
            },
            {
              "id": 3107,
              "name": "混剪",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 14212,
              "name": "欧美音乐",
              "alg": null
            },
            {
              "id": 23109,
              "name": "歌曲混剪",
              "alg": null
            },
            {
              "id": 107113,
              "name": "Queen",
              "alg": null
            },
            {
              "id": 23116,
              "name": "音乐推荐",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "4E6681D3FC6E0C8BDE1572AD706434CD",
          "durationms": 199574,
          "playTime": 1383174,
          "praisedCount": 3668,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_D8722FAE87BD9A3DFA32A076EC154DBE",
          "coverUrl": "https://p2.music.126.net/ass76sVxpRggXzcZ6Lzz_Q==/109951164968136745.jpg",
          "height": 1080,
          "width": 1920,
          "title": "韩雪《处处吻》一吻便偷一个心，一吻便颠倒众生",
          "description": "#韩雪#《#处处吻#》一吻便偷一个心，一吻便颠倒众生",
          "commentCount": 532,
          "shareCount": 590,
          "resolutions": [{
              "resolution": 240,
              "size": 32513825
            },
            {
              "resolution": 480,
              "size": 59700974
            },
            {
              "resolution": 720,
              "size": 96182918
            },
            {
              "resolution": 1080,
              "size": 276181048
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 440000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/Z7YyrTboPVk7OMvubUg4gw==/109951165952899173.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 440100,
            "birthday": 936115200000,
            "userId": 430150543,
            "userType": 204,
            "nickname": "慕容簧笙",
            "signature": "新媒体│文学│插画│摄影│美食│理科男",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951165952899170,
            "backgroundImgId": 109951165952898380,
            "backgroundUrl": "http://p1.music.126.net/pMW6kBdzuQho6ifHX3S6yg==/109951165952898381.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "音乐视频达人"
            },
            "djStatus": 10,
            "vipType": 0,
            "remarkName": null,
            "backgroundImgIdStr": "109951165952898381",
            "avatarImgIdStr": "109951165952899173"
          },
          "urlInfo": {
            "id": "D8722FAE87BD9A3DFA32A076EC154DBE",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/x8MZhKEL_2992190969_uhd.mp4?ts=1627224455&rid=8A7509165B291E84A42CB4C0136CC84D&rl=3&rs=TycJGzNWbsJSfuKMujKSsafIDgqTwDoS&sign=d82f665711b2e28621ed3117faab183b&ext=opYZEnTp71Z%2B15rp9KVUkVPv0wL94ck4WYbGIknLmVbdm6MJk%2BoXRJ26iZxmIUCOaNsPhnRU78SHOegg7%2F8P8%2BXmUtpqXtJKiSpr4zcttEU0Gf8usS1gvrgf2VH5F7p8IQUYdgqP5WSPgkzgWBommIOLPhJMTSOL2AZH3UCICDn5wOw1UKp%2FR4OevJbuXRJGnKTDKhIjyR9E8BN7DcunblveUgM98jagBhGSXsDllAegDUudLbdLZlRH0rrqSQkW",
            "size": 276181048,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 1080
          },
          "videoGroup": [{
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 57105,
              "name": "粤语现场",
              "alg": null
            },
            {
              "id": 59101,
              "name": "华语现场",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "D8722FAE87BD9A3DFA32A076EC154DBE",
          "durationms": 184551,
          "playTime": 1542528,
          "praisedCount": 7264,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_F646E7F0427C4F33E04C0F96F8F978C2",
          "coverUrl": "https://p2.music.126.net/Ox2_KHhhhVrc3f8cW4d8og==/109951164017454475.jpg",
          "height": 1080,
          "width": 1920,
          "title": "BTS——boy with luv 舞台混剪",
          "description": "#BTS#  #防弹少年团#——boy with luv 舞台混剪",
          "commentCount": 29,
          "shareCount": 42,
          "resolutions": [{
              "resolution": 240,
              "size": 45355811
            },
            {
              "resolution": 480,
              "size": 69443754
            },
            {
              "resolution": 720,
              "size": 94943248
            },
            {
              "resolution": 1080,
              "size": 153716919
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 220000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/APWYDnUtYlOjy9MmO9wgww==/109951165716293571.jpg",
            "accountStatus": 0,
            "gender": 2,
            "city": 222400,
            "birthday": 845654400000,
            "userId": 87819969,
            "userType": 0,
            "nickname": "Yeonvely22",
            "signature": "2021你好~",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951165716293570,
            "backgroundImgId": 109951165395722990,
            "backgroundUrl": "http://p1.music.126.net/LulOmlCSpzNQKI9xmJYIcg==/109951165395722990.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "音乐视频达人"
            },
            "djStatus": 10,
            "vipType": 11,
            "remarkName": null,
            "backgroundImgIdStr": "109951165395722990",
            "avatarImgIdStr": "109951165716293571"
          },
          "urlInfo": {
            "id": "F646E7F0427C4F33E04C0F96F8F978C2",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/4UFobK6v_2459216335_uhd.mp4?ts=1627224455&rid=8A7509165B291E84A42CB4C0136CC84D&rl=3&rs=bTwkhuwAhzbaSisURUKbkAOahqDSldmE&sign=19053131463415fa1aeb17edbf039223&ext=opYZEnTp71Z%2B15rp9KVUkVPv0wL94ck4WYbGIknLmVbdm6MJk%2BoXRJ26iZxmIUCOaNsPhnRU78SHOegg7%2F8P8%2BXmUtpqXtJKiSpr4zcttEU0Gf8usS1gvrgf2VH5F7p8IQUYdgqP5WSPgkzgWBommIOLPhJMTSOL2AZH3UCICDn5wOw1UKp%2FR4OevJbuXRJGnKTDKhIjyR9E8BN7DcunblveUgM98jagBhGSXsDllAegDUudLbdLZlRH0rrqSQkW",
            "size": 153716919,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 1080
          },
          "videoGroup": [{
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 1101,
              "name": "舞蹈",
              "alg": null
            },
            {
              "id": 57107,
              "name": "韩语现场",
              "alg": null
            },
            {
              "id": 57108,
              "name": "流行现场",
              "alg": null
            },
            {
              "id": 10113,
              "name": "防弹少年团",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "F646E7F0427C4F33E04C0F96F8F978C2",
          "durationms": 238501,
          "playTime": 57107,
          "praisedCount": 816,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_D8B634E69DB0695F400B955A37FF9FD9",
          "coverUrl": "https://p2.music.126.net/hXuZaSXLnlcJljZ3uI2_XQ==/109951163572876339.jpg",
          "height": 720,
          "width": 1280,
          "title": "【未播】李荣浩 王俊凯 深情对唱《树读》 引众人合唱",
          "description": "【未播】李荣浩 王俊凯 深情对唱《树读》 引众人合唱《王牌对王牌2》第2期 20170129 [浙江卫视官方HD] 王源 王祖蓝 宋茜",
          "commentCount": 40,
          "shareCount": 84,
          "resolutions": [{
              "resolution": 240,
              "size": 5973636
            },
            {
              "resolution": 480,
              "size": 8510754
            },
            {
              "resolution": 720,
              "size": 13436725
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 130000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/WqX-CkCrYHcqAFXNGOoeFw==/18757668371562454.jpg",
            "accountStatus": 0,
            "gender": 0,
            "city": 131000,
            "birthday": -2209017600000,
            "userId": 395286153,
            "userType": 0,
            "nickname": "ffbabybaby",
            "signature": "",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 18757668371562456,
            "backgroundImgId": 2002210674180201,
            "backgroundUrl": "http://p1.music.126.net/o3G7lWrGBQAvSRt3UuApTw==/2002210674180201.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "音乐视频达人"
            },
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "backgroundImgIdStr": "2002210674180201",
            "avatarImgIdStr": "18757668371562454"
          },
          "urlInfo": {
            "id": "D8B634E69DB0695F400B955A37FF9FD9",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/T6Xr1RJu_138974201_shd.mp4?ts=1627224455&rid=8A7509165B291E84A42CB4C0136CC84D&rl=3&rs=yIUreplCNepsJSiAfrslRIAuaqprVDNA&sign=4cbab2a5d5b5ada645125d05c5a466ab&ext=opYZEnTp71Z%2B15rp9KVUkVPv0wL94ck4WYbGIknLmVbdm6MJk%2BoXRJ26iZxmIUCOaNsPhnRU78SHOegg7%2F8P8%2BXmUtpqXtJKiSpr4zcttEU0Gf8usS1gvrgf2VH5F7p8IQUYdgqP5WSPgkzgWBommIOLPhJMTSOL2AZH3UCICDn5wOw1UKp%2FR4OevJbuXRJGnKTDKhIjyR9E8BN7DcunblveUgM98jagBhGSXsDllAepAqTzHbCgs1ziDRYCOtQm",
            "size": 13436725,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 720
          },
          "videoGroup": [{
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 11137,
              "name": "TFBOYS",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 2104,
              "name": "民谣",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 23137,
              "name": "李荣浩",
              "alg": null
            },
            {
              "id": 25108,
              "name": "王俊凯",
              "alg": null
            },
            {
              "id": 13222,
              "name": "华语",
              "alg": null
            },
            {
              "id": 14137,
              "name": "感动",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": [
            109
          ],
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "D8B634E69DB0695F400B955A37FF9FD9",
          "durationms": 52523,
          "playTime": 142964,
          "praisedCount": 1488,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_20353CADC0C4EC0F33FEE2167D0063D5",
          "coverUrl": "https://p2.music.126.net/f6cJMbbC71eudug2xWe0Nw==/109951163573388939.jpg",
          "height": 360,
          "width": 642,
          "title": "王俊凯 深情演唱《水星记》 ，其实你才是最耀眼的那颗星",
          "description": "王俊凯 深情演唱《水星记》 ，其实你才是最耀眼的那颗星！",
          "commentCount": 3837,
          "shareCount": 6626,
          "resolutions": [{
            "resolution": 240,
            "size": 33115083
          }],
          "creator": {
            "defaultAvatar": false,
            "province": 110000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/7De0VT_qkryGCIcgRZsVAA==/109951163250181909.jpg",
            "accountStatus": 0,
            "gender": 2,
            "city": 110101,
            "birthday": 783360000000,
            "userId": 469299550,
            "userType": 0,
            "nickname": "盛夏de星空",
            "signature": "啊对，不要吐槽我的表情包| ू•ૅω•́)ᵎᵎᵎ",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163250181900,
            "backgroundImgId": 109951163700421520,
            "backgroundUrl": "http://p1.music.126.net/43wVe-zokYiImlGdRonRSw==/109951163700421523.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 0,
            "vipType": 11,
            "remarkName": null,
            "backgroundImgIdStr": "109951163700421523",
            "avatarImgIdStr": "109951163250181909"
          },
          "urlInfo": {
            "id": "20353CADC0C4EC0F33FEE2167D0063D5",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/2QeSIa8L_1528902906_sd.mp4?ts=1627224455&rid=8A7509165B291E84A42CB4C0136CC84D&rl=3&rs=tIaTarvJnnJFbMIDuFHiDLJPzPuhymob&sign=7dbb10f06e80b504a402ed39214a485d&ext=opYZEnTp71Z%2B15rp9KVUkVPv0wL94ck4WYbGIknLmVbdm6MJk%2BoXRJ26iZxmIUCOaNsPhnRU78SHOegg7%2F8P8%2BXmUtpqXtJKiSpr4zcttEU0Gf8usS1gvrgf2VH5F7p8IQUYdgqP5WSPgkzgWBommIOLPhJMTSOL2AZH3UCICDn5wOw1UKp%2FR4OevJbuXRJGnKTDKhIjyR9E8BN7DcunblveUgM98jagBhGSXsDllAepAqTzHbCgs1ziDRYCOtQm",
            "size": 33115083,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 240
          },
          "videoGroup": [{
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 59101,
              "name": "华语现场",
              "alg": null
            },
            {
              "id": 57108,
              "name": "流行现场",
              "alg": null
            },
            {
              "id": 59108,
              "name": "巡演现场",
              "alg": null
            },
            {
              "id": 11137,
              "name": "TFBOYS",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 14242,
              "name": "伤感",
              "alg": null
            },
            {
              "id": 25108,
              "name": "王俊凯",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": [
            109
          ],
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "20353CADC0C4EC0F33FEE2167D0063D5",
          "durationms": 368853,
          "playTime": 4891101,
          "praisedCount": 46153,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_04DE1383492C1F04F914ADD7BE0DE5AF",
          "coverUrl": "https://p2.music.126.net/VO7dqboe1PbsWun9c0Lf0w==/109951163573434805.jpg",
          "height": 1080,
          "width": 1920,
          "title": "王俊凯 - 葡萄成熟时",
          "description": "王俊凯“此刻之外”十九岁生日会\n",
          "commentCount": 1465,
          "shareCount": 1657,
          "resolutions": [{
              "resolution": 240,
              "size": 25726812
            },
            {
              "resolution": 480,
              "size": 46603720
            },
            {
              "resolution": 720,
              "size": 70980411
            },
            {
              "resolution": 1080,
              "size": 124910447
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 210000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/SUeqMM8HOIpHv9Nhl9qt9w==/109951165647004069.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 210600,
            "birthday": 932400000000,
            "userId": 300577898,
            "userType": 0,
            "nickname": "用户300577898",
            "signature": "",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951165647004060,
            "backgroundImgId": 2002210674180203,
            "backgroundUrl": "http://p1.music.126.net/bmA_ablsXpq3Tk9HlEg9sA==/2002210674180203.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 10,
            "vipType": 0,
            "remarkName": null,
            "backgroundImgIdStr": "2002210674180203",
            "avatarImgIdStr": "109951165647004069"
          },
          "urlInfo": {
            "id": "04DE1383492C1F04F914ADD7BE0DE5AF",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/UrbEZ3P3_2003086978_uhd.mp4?ts=1627224455&rid=8A7509165B291E84A42CB4C0136CC84D&rl=3&rs=fcPyuCevjiITcMdhiiWAknZoJMuuOjeA&sign=c5fa37025eeab1418835d02694a494be&ext=opYZEnTp71Z%2B15rp9KVUkVPv0wL94ck4WYbGIknLmVbdm6MJk%2BoXRJ26iZxmIUCOaNsPhnRU78SHOegg7%2F8P8%2BXmUtpqXtJKiSpr4zcttEU0Gf8usS1gvrgf2VH5F7p8IQUYdgqP5WSPgkzgWBommIOLPhJMTSOL2AZH3UCICDn5wOw1UKp%2FR4OevJbuXRJGnKTDKhIjyR9E8BN7DcunblveUgM98jagBhGSXsDllAepAqTzHbCgs1ziDRYCOtQm",
            "size": 124910447,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 1080
          },
          "videoGroup": [{
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 59101,
              "name": "华语现场",
              "alg": null
            },
            {
              "id": 57108,
              "name": "流行现场",
              "alg": null
            },
            {
              "id": 59108,
              "name": "巡演现场",
              "alg": null
            },
            {
              "id": 11137,
              "name": "TFBOYS",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 12100,
              "name": "流行",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 14242,
              "name": "伤感",
              "alg": null
            },
            {
              "id": 13222,
              "name": "华语",
              "alg": null
            },
            {
              "id": 25108,
              "name": "王俊凯",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [{
            "name": "葡萄成熟时",
            "id": 66285,
            "pst": 0,
            "t": 0,
            "ar": [{
              "id": 2116,
              "name": "陈奕迅",
              "tns": [],
              "alias": []
            }],
            "alia": [],
            "pop": 100,
            "st": 0,
            "rt": "600902000005290638",
            "fee": 8,
            "v": 68,
            "crbt": null,
            "cf": "",
            "al": {
              "id": 6491,
              "name": "U-87",
              "picUrl": "http://p3.music.126.net/Bl1hEdJbMSj5YJsTqUjr-w==/109951163520311175.jpg",
              "tns": [],
              "pic_str": "109951163520311175",
              "pic": 109951163520311170
            },
            "dt": 277040,
            "h": {
              "br": 320000,
              "fid": 0,
              "size": 11084321,
              "vd": -22400
            },
            "m": {
              "br": 192000,
              "fid": 0,
              "size": 6650610,
              "vd": -19800
            },
            "l": {
              "br": 128000,
              "fid": 0,
              "size": 4433755,
              "vd": -18200
            },
            "a": null,
            "cd": "1",
            "no": 6,
            "rtUrl": null,
            "ftype": 0,
            "rtUrls": [],
            "djId": 0,
            "copyright": 1,
            "s_id": 0,
            "rtype": 0,
            "rurl": null,
            "mst": 9,
            "cp": 7003,
            "mv": 303282,
            "publishTime": 1117555200000,
            "privilege": {
              "id": 66285,
              "fee": 8,
              "payed": 0,
              "st": 0,
              "pl": 128000,
              "dl": 0,
              "sp": 7,
              "cp": 1,
              "subp": 1,
              "cs": false,
              "maxbr": 999000,
              "fl": 128000,
              "toast": false,
              "flag": 4,
              "preSell": false
            }
          }],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "04DE1383492C1F04F914ADD7BE0DE5AF",
          "durationms": 254026,
          "playTime": 611893,
          "praisedCount": 4926,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_B7896430CA963B53B3582A98C42452ED",
          "coverUrl": "https://p2.music.126.net/s856AySWabX1jGsooA0Spw==/109951163601275292.jpg",
          "height": 640,
          "width": 360,
          "title": "【饭拍社】141127 AOA 雪炫 - 02（性感制服喷血热舞）",
          "description": null,
          "commentCount": 93,
          "shareCount": 302,
          "resolutions": [{
              "resolution": 480,
              "size": 81238827
            },
            {
              "resolution": 240,
              "size": 44801423
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 430000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/ec2Pf_lfa7YjEiS02fdy_g==/109951163534174711.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 430100,
            "birthday": 1002556800000,
            "userId": 35687049,
            "userType": 0,
            "nickname": "饭拍社",
            "signature": "改头换面",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163534174700,
            "backgroundImgId": 109951165395733630,
            "backgroundUrl": "http://p1.music.126.net/JoV68ORMXbVRqYMDNp28GA==/109951165395733633.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "音乐视频达人"
            },
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "backgroundImgIdStr": "109951165395733633",
            "avatarImgIdStr": "109951163534174711"
          },
          "urlInfo": {
            "id": "B7896430CA963B53B3582A98C42452ED",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/rXPUIXoW_2041939523_hd.mp4?ts=1627224455&rid=8A7509165B291E84A42CB4C0136CC84D&rl=3&rs=UZJQdoeKXotfYlnaTryegOeRkgJOchZw&sign=c17414452a52dc7b6e9f78ee212a2fd3&ext=opYZEnTp71Z%2B15rp9KVUkVPv0wL94ck4WYbGIknLmVbdm6MJk%2BoXRJ26iZxmIUCOaNsPhnRU78SHOegg7%2F8P8%2BXmUtpqXtJKiSpr4zcttEU0Gf8usS1gvrgf2VH5F7p8IQUYdgqP5WSPgkzgWBommIOLPhJMTSOL2AZH3UCICDn5wOw1UKp%2FR4OevJbuXRJGnKTDKhIjyR9E8BN7DcunblveUgM98jagBhGSXsDllAegDUudLbdLZlRH0rrqSQkW",
            "size": 81238827,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 480
          },
          "videoGroup": [{
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 1101,
              "name": "舞蹈",
              "alg": null
            },
            {
              "id": 57107,
              "name": "韩语现场",
              "alg": null
            },
            {
              "id": 57108,
              "name": "流行现场",
              "alg": null
            },
            {
              "id": 57110,
              "name": "饭拍现场",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "B7896430CA963B53B3582A98C42452ED",
          "durationms": 178445,
          "playTime": 494542,
          "praisedCount": 2837,
          "praised": false,
          "subscribed": false
        }
      }
    ];
    let videoList = this.data.videoList;
    //用三点运算符去拆包(去掉[]，留下对象{})
    videoList.push(...newViedeoList)
    //更新videoList
    this.setData({
      videoList
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
  onShareAppMessage: function ({
    from
  }) {
    console.log(from);
    if (from === 'button') {
      //自定义转发页面
      return {
        title: '来自button的转发',
        page: '/pages/video/video',
        imageUrl: '/static/images/nvsheng.jpg'
      }
    } else {
      return {
        title: '来自menu的转发',
        page: '/pages/video/video',
        imageUrl: '/static/images/nvsheng.jpg'
      }
    }
  }
})