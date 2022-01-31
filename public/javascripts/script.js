function addToCart(prodId) {
    $.ajax({
      url: '/add-to-cart/'+prodId,
      method: 'get',
      success: (response) => {
        if (response.status) {
          let count = $('#cart-increase-count').html()
          count = parseInt(count) + 1
          $('#cart-increase-count').html(count)
        }else{
          //alert('else')
          location.href='/login'
         
        }
      }
    })
  }