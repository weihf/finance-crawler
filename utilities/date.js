const moment = require('moment')

exports.getNowDate = () => {
  moment.locale('zh-cn')
  return moment().format('YYYY-MM-DD')
}
