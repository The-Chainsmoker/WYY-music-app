import config from "./config";
export default (url, data = {}, method = 'GET') => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: config.host + url,
            data,
            method,
            header: {
                //当没登录空数组时，find元素会报错
                // cookie: wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1)

                //改进后的
                cookie: wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1) : ''
            },
            success: (res) => {
                if (data.isLogin) { //登录请求
                    //将用户的cookie存入至本地
                    wx.setStorage({
                        key: 'cookies',
                        data: res.cookies
                    })
                    // wx.setStorageSync('cookies', res.cookies)
                }
                console.log('请求成功', res);
                resolve(res.data);
            },
            fail: (err) => {
                console.log('请求失败', err);
                reject(err);
            }
        })
    })
}