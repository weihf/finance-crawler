const schedule = require('node-schedule')

function timedTask (rule, callback) {
  schedule.scheduleJob(rule, function () {
    console.log('定时任务执行一次了')
    callback && callback()
  })
}

module.exports = timedTask
