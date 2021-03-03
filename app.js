const express = require('express')
const app = express()
require('art-template')
const crawler = require('./controllers/crawler')
const timedTask = require('./utilities/timedTask')
const date = require('./utilities/date')
const port = 3000

// 配置 art-template
app.engine('html', require('express-art-template'))

// 开放静态文件
app.use('/static/', express.static('./static'))

app.use(async (req, res) => {
  try {
    const data = await crawler.indexFunc()
    res.render('index.html', { data: data, time: date.getNowDate() })
  } catch (err) {
    console.log(err)
  }
})

app.listen(3000, () => {
  console.log('server is running ...')
  console.log(`http://127.0.0.1:${port}`)

  // 每小时爬取一次数据：每小时的0分0秒触发
  timedTask('0 0 * * * *', function () { crawler.saveData() })
})
