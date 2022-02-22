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
// function close(){
//   console.log('hyyyyy')
//   $.ajax({
//     url: '/login-close',
//     method:'get',
//     success:(response)=>{
//       alert('clicked')
//       if(response.status){
//         location = '/login-close'
//       }
//     }
//   })
// }
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
$('#signupForm').submit((e) => {
  e.preventDefault()
  $.ajax({
    url: '/signup',
    method: 'post',
    data: $('#signupForm').serialize(),
    success: (response) => {

      if (response.status) {
        alert('Successfully Login')
        // location.href = '/order-success'
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
        document.getElementById('Subtotal').innerHTML = response.total
        document.getElementById('totalAmount').innerHTML = response.total
      }
    }
  })
}
function Windowless(event){
  
  $.ajax({
     url: '/login-close',
     method:'get',
     success:(response)=>{
   //alert(hy)
      if(response.status){
         location.href = '/'
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
function viewImageCategory(event) {
  document.getElementById('imgViewCat').src = URL.createObjectURL(event.target.files[0])
}
function viewImageSubCategory(event) {
  document.getElementById('imgViewSubCat').src = URL.createObjectURL(event.target.files[0])
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
$().ready(function () {
  $("#signupForm").validate({
      // in 'rules' user have to specify all the constraints for respective fields
      rules: {
          name: {
              required: true,
              minlength: 4 , //for length of name,
              maxlength: 16
          },
          password: {
              required: true,
              minlength: 6
          },
          confirm_password: {
              required: true,
              minlength: 6,
              equalTo: "#password" //for checking both passwords are same or not
          },
          email: {
              required: true,
              email: true
          },
      },
      messages: {
          name: {
              required: "Enter your Full Name",
              minlength: "Minimum 4 characters",
              maxlength:'Please enter no more than 16 characters.'
          },
          password: {
              required: "Please enter a password",
              minlength: "Password minimum 6 character.",
              maxlength:'Please enter no more than 16 characters.'
          },
          confirm_password: {
              required: "Please enter a password",
              minlength: "Password minimum 6 characters",
              equalTo: "Please enter the same password as above."
          },
          email:{
              required:'Enter your Email Address'
          }
      }
  });
});

$().ready(function () {
  $("#LoginForm").validate({
      // in 'rules' user have to specify all the constraints for respective fields
      rules: {
          password: {
              required: true,
              minlength: 6
          },
          email: {
              required: true,
              email: true
          },
      },
      messages: {
          password: {
              required: "Please enter a password",
              minlength: "Password minimum 6 character",
              maxlength:'Please enter no more than 16 characters'
          },
          email:{
              required:'Enter your Email Address'
          }
      }
  });
});