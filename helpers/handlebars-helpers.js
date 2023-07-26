const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)

module.exports = {
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  },
  catchTime: a => dayjs(a).tz('Asia/Taipei').format('HH:mm:ss'),
  catchDate: a => dayjs(a).tz('Asia/Taipei').format('YYYY-MM-DD')
}