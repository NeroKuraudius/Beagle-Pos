// DOM
const addButton = document.querySelector('[data-alpha-pos="add-drink"]')


// function
function BeaglePos() { }

BeaglePos.prototype.getCheckedValue = function (inputName) {
  let selectedValue = ''
  document.querySelectorAll(`[name=${inputName}]`).forEach(item => {
    if (item.checked) {
      selectedValue = item.value
    }
  })
  return selectedValue
}

BeaglePos.prototype.getPrice = function (value) {
  const priceDOM = document.querySelector(`[value=${value}]`).previousElementSibling
  return priceDOM.innerText.slice(-2)
}

const orderLists = document.querySelector('[data-order-lists]')
BeaglePos.prototype.addDrink = function (drink, ice, sugar, price) {
  let orderListCard = `
  <div class="card mb-3">
    <div class="card-body pt-3 pr-3">
      <div class="text-right">
        <span data-alpha-pos="delete-drink">×</span>
      </div>
      <h6 class="card-title mb-1">${drink}</h6>
      <div class="card-text">${ice}</div>
      <div class="card-text">${sugar}</div>
    </div>
    <div class="card-footer text-right py-2">
      <div class="card-text text-light">$ <span data-drink-price>${price}</span></div>
    </div>
  `
  orderLists.insertAdjacentHTML('afterbegin', orderListCard)
}

// eventListener
const beaglePos = new BeaglePos()
addButton.addEventListener('click', () => {
  // 客製化點單
  const drink = beaglePos.getCheckedValue('drink')
  const ice = beaglePos.getCheckedValue('ice')
  const sugar = beaglePos.getCheckedValue('sugar')

  // 例外處理
  if (!drink) alert('請選擇飲品')

  // 取得單價
  const price = beaglePos.getPrice(drink)

  // 點單放入訂單區
  beaglePos.addDrink(drink, ice, sugar, price)
})

