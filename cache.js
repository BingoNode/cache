const { getData } = require('./data-server')
const schedule = require('node-schedule')

class Cache {
  constructor(options){
    this.url = options.url 
    this.method = options.method
    const [hour, minute, second] = options.refreshTime.split(':')
    this.allCacheData = {} // 缓存对象,存储所有缓存数据
    this.currentId = ""  // 匹配动态路由中的id，将作为缓存对象中的key

    this.rule = new schedule.RecurrenceRule();
    this.rule.hour = hour
    this.rule.minute = minute
    this.rule.second = second

    this.myCache = this.myCache.bind(this)

    // 建立定时任务
    this.refresh()

    return this.myCache
  }
  async myCache(ctx, next){
    // 正则匹配规则：以配置项(options)中的url开始，且至少有一个字符结尾
    let regexp = new RegExp("^"+this.url+".+$")
    
    // 判断请求方式是否满足配置要求
    let isMatchMethod = ctx.method.toLowerCase() === this.method.toLowerCase()
    
    // 判断当前路由满足匹配规则
    let isMatchUrl = ctx.url.match(regexp)

    let startTime = new Date().getTime()
    /* await new Promise(async (resolve, reject)=>{
      if(isMatchMethod && isMatchUrl){
        // 获取id
        this.currentId = ctx.url.replace(this.url, "")

        if(this.allCacheData[this.currentId]!==undefined){ // 缓存中有数据
          // 打印
          this.printResult(ctx.url, startTime, "缓存")
          resolve()
        }else{  // 没有缓存数据

          // 发送请求
          let data = await getData(this.currentId)

          // 把请求回来的数据放入缓存，方便之后访问
          this.allCacheData[this.currentId] = data
          // 打印
          this.printResult(ctx.url, startTime, "请求")
          resolve()
        }
      }else{  // 不属于指定的url接口
        resolve()
      }
    }) */
    if(isMatchMethod && isMatchUrl){
      // 获取id
      this.currentId = ctx.url.replace(this.url, "")

      if(this.allCacheData[this.currentId]!==undefined){ // 缓存中有数据
        // 打印
        this.printResult(ctx.url, startTime, "缓存")
        next()
      }else{  // 没有缓存数据

        // 发送请求
        let data = await getData(this.currentId)

        // 把请求回来的数据放入缓存，方便之后访问
        this.allCacheData[this.currentId] = data
        // 打印
        this.printResult(ctx.url, startTime, "请求")
        next()
      }
    }else{  // 不属于指定的url接口
      next()
    }
    // 把本次请求的结果挂到ctx.request上，之后在响应给界面的时候可以取到
    // ctx.request.currentData = this.allCacheData[this.currentId]
  }
  // 刷新缓存事件
  refresh(){
    schedule.scheduleJob(this.rule, ()=>{
      this.allCacheData = {}
    　console.log("执行清空缓存任务");
    })
  }

  // 打印请求耗时，数据来自缓存、接口
  printResult(url, startTime, from){
    let endTime = new Date().getTime()
    console.log(`${url} ${endTime - startTime}ms ${from}`)
  }
}
module.exports = Cache