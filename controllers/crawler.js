const request = require('request')
const cheerio = require('cheerio')
const db = require('../models/db')

// 通过 request 来获取需要爬取的新闻页
function downloadHTML (url) {
  return new Promise((resolve) => {
    request(url, function (err, res) {
      if (err) {
        console.log(err)
      }
      const $ = cheerio.load(res.body, { decodeEntities: false })
      resolve($)
    })
  })
}

// 东方财富-财经首页
async function filterEastMoney () {
  try {
    const url = 'http://finance.eastmoney.com/'
    const list = []
    const $ = await downloadHTML(url)
    $('.yaowen .content li').each(function (index, elem) {
      const $elem = $(elem)
      $elem.find('a').each(function (index, e) {
        const $e = $(e)
        const title = $e.text()
        const href = $e.attr('href')
        const hot = $e.parents('h3').length > 0
        list.push({
          title,
          href,
          hot: hot ? 1 : 0,
          tag: '东方财富 | 财经'
        })
      })
    })
    return list
  } catch (err) {
    console.log(err)
  }
}

// 华尔街见闻
async function filterWallStreet () {
  try {
    const url = 'https://wallstreetcn.com'
    const list = []
    const $ = await downloadHTML(url)
    $('.carousel-item').each(function (index, elem) {
      const $elem = $(elem)
      let hot = 0
      if (index === 0) {
        hot = 1
      }
      $elem.find('a').each(function (index, ele) {
        const $ele = $(ele)
        const href = $ele.attr('href')
        $ele.find('.text').each(function (index, el) {
          const $el = $(el)
          const title = $el.text()
          list.push({
            title,
            href,
            hot,
            tag: '华尔街见闻'
          })
        })
      })
    })
    return list
  } catch (err) {
    console.log(err)
  }
}

// 财联社
async function filterCLS () {
  try {
    const url = 'https://www.cls.cn'
    const list = []
    const $ = await downloadHTML(url)
    $('.home-article-list').each(function (index, elem) {
      const $elem = $(elem)
      $elem.find('a').each(function (index, e) {
        const $e = $(e)
        const title = $e.text()
        const href = url + $e.attr('href')
        const hot = $e.prev('span').length > 0
        list.push({
          title,
          href,
          hot: hot ? 1 : 0,
          tag: '财联社'
        })
      })
    })
    return list
  } catch (err) {
    console.log(err)
  }
}

// 头条
function handleHotNews (data) {
  data.sort((a, b) => {
    return b.hot - a.hot
  })
  return data
}

async function saveData () {
  try {
    const wallstreet = await filterWallStreet()
    const cls = await filterCLS()
    const eastmoney = await filterEastMoney()

    // 处理多个异步请求
    const [wallstreetData, clsData, eastmoneyData] = await Promise.all([
      wallstreet,
      cls,
      eastmoney
    ])
    // 将三个请求拿到的数据合并
    let list = wallstreetData.concat(clsData, eastmoneyData)

    list = handleHotNews(list)

    // 清空数据库
    await db.query('delete from list;')

    // 将处理过的数据存入数据库
    for (let i = 0; i < list.length; i++) {
      const sqlStr =
        `insert into list (title, href, hot, tag) 
            values(
                '${list[i].title}',
                '${list[i].href}',
                '${list[i].hot}',
                '${list[i].tag}'
                );
                `
      await db.query(sqlStr)
    }

    // 查询存入的数据
    const result = await db.query('SELECT * FROM list')
    return result
  } catch (err) {
    console.log(err)
  }
}

async function indexFunc () {
  try {
    // 1. 查询数据库
    let result = await db.query('SELECT * FROM list')

    // 2. 如果数据库返回的是空数组，则去爬取数据
    if (!result.length) {
      result = await saveData()
    }
    return result
  } catch (error) {
    console.log(error)
    return []
  }
}

module.exports = {
  indexFunc,
  saveData
}
