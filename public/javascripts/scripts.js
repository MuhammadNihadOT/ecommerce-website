function addToCart(prodId) {
  $.ajax({
    url: '/add-to-cart/' + prodId,
    method: 'get',
    success: (response) => {
      if (response.status) {
        let count = $('#cart-increase-count').html()
        count = parseInt(count) + 1
        $('#cart-increase-count').html(count)
      } else {
        //alert('else')
        location.href = '/login'

      }
    }
  })
}
function validate() {
  var password = document.formvalidate.password.value;
  var password_succesfull;
  var re_password = document.formvalidate.re_password.value;
  var error_password;
  if (password == re_password) {
    password_succesfull = document.getElementById("success_password").style = "color:green;display:block";
    password_succesfull.innerHTML;
  } else {
    error_password = document.getElementById("error_password").style = "color:red;display:block";
    error_password.innerHTML;
    document.formvalidate.re_password.focus();
  }
  return false
}
$('#checkout-form').submit((e) => {
  e.preventDefault()
  $.ajax({
    url: '/place-order',
    method: 'post',
    data: $('#checkout-form').serialize(),
    success: (response) => {

      if (response.status) {
        alert('Order Placed Successfully')
        location.href = '/order-success'
      }
    }
  })
})
function changeQuantity(cartId, proId, userId, count) {
  let quantity = parseInt(document.getElementById(proId).innerHTML)
  count = parseInt(count)
  $.ajax({
    url: '/change-product-quantity',
    data:
    {
      userId: userId,
      cartId: cartId,
      ProductId: proId,
      count: count,
      quantity: quantity
    },
    method: 'post',
    success: (response) => {
      if (response.RemoveProduct) {
        alert('Product Remove is successfully ')
        location.reload()
      } else {
        document.getElementById(proId).innerHTML = quantity + count
        document.getElementById('total').innerHTML = response.total
      }
    }
  })
}
function DeleteProductFromCart(cartId, productId) {
  $.ajax({
    url: '/remove-product-from-cart',
    data:
    {
      cartId: cartId,
      productId: productId,
    },
    method: 'post',
    success: (response) => {
      if (response.RemoveProduct) {
        alert('Product Remove is successfully ')
        location.reload()
      }
    }
  })
}
function viewImage(event) {
  document.getElementById('imgView').src = URL.createObjectURL(event.target.files[0])
}
function changeToShipping(orderId) {
  $.ajax({
    url: '/admin/change-to-shipping/' + orderId,
    method: 'get',
    success: (response) => {
      if (response.status) {
        location.reload()
      }
    }
  })
}