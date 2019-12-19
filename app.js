const Koa = require('koa')
const app = new Koa()

const Router = require('koa-router') 
const router = new Router(); 

const Cache = require('./cache')

const originRequest = require('request')  // 可以从后端发起请求

const cacheConfig = {
  method: "get",
  url: "/api/data/",  //指定/api/data/下的接口
  refreshTime: "00:00:00"  // 刷新缓存时刻每日0点,假设时间规则是时分秒
}

// 缓存中间件
app.use(new Cache(cacheConfig))

// 动态路由匹配，表示/api/data下的所有接口
router.get("/api/data/:id", async (ctx, next)=>{
  // 将当前请求结果返回界面
  ctx.body = ctx.request.currentData
})

router.get("/api/users", async (ctx, next)=>{
  // 将当前请求结果返回界面
  ctx.body = {name: "Bingo", sex: 'male'}
})

// 路由中间件
app.use(router.routes(), router.allowedMethods());

app.listen(3000, ()=>{
  console.log("服务启动，端口3000")
})

// 测试缓存接口
function testUnit(count){
  if(count < 1) return
  // 每次获取一个10以内的随机数进行测试
  let num = Math.floor(Math.random()*10)
  originRequest(`http://localhost:3000/api/data/${num}`, {encoding: null}, ()=>{})
  setTimeout(()=>{
    testUnit(count-1)
  }, 500)
}

testUnit(20)  // 表示测试执行次数