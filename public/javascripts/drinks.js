// DOM
const checkoutButton = document.getElementById('checkoutButton')

// function


// eventListener
checkoutButton.addEventListener('click', () => {
  const checkoutConfirm = confirm('確定結帳嗎?')
  if (checkoutConfirm) {
    return true
  } else {
    return false
  }
})
