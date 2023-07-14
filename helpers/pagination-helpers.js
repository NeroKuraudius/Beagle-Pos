const getOffset = (limit = 8, page = 1) => limit * (page - 1)

const getPagination = (limit = 8, page = 1, totalData = 25) => {
  const totalPage = Math.ceil(totalData / limit) // 總頁數
  const pages = Array.from({ length: totalPage }, (_, index) => index + 1) // 分頁器上顯示的數字
  const current = page < 1 ? 1 : page > totalPage ? totalPage : page // 當前頁面
  const prev = current - 1 < 1 ? 1 : current - 1 // 上一頁
  const next = current + 1 > totalPage ? totalPage : current + 1 // 下一頁
  return { totalPage, pages, current, prev, next }
}

module.exports = { getOffset, getPagination }