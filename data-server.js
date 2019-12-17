module.exports = {
  getData: (key)=>{ // 模拟接口请求
    return new Promise(resolve=>{
      setTimeout(()=>{
        resolve(`获取/api/data/${key}接口数据`)
      }, 200)
    })
  }
}