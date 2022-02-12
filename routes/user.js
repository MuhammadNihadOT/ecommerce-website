const { response } = require("express");
var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelper = require("../helpers/user-helpers");


//----------SET-VARIABLE----------//
var user_header = true;
//----------CHECK-USER-LOGIN----------//
const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
//----------HOME-PAGE----------//
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }
  productHelpers.getAllBanners().then((banners)=>{
    // banners[0]
    // console.log('data:',banners.lengthForBanner)
    // console.log('datavvvvvvvvvvv:',banners.banners[0])
    // console.log('lenght:',l)
    let image1 =banners[0]._id
    let image2 =banners[1]._id
    let image3 =banners[2]._id
    let fullimage = {
      image1:image1,
      image2:image2,
      image3:image3
    }

    // console.log(fullimage)

    // console.log(image1)
  productHelpers.getAllProducts().then((Products) => {
    res.render("user/view-products", { user_header, Products, user, cartCount,fullimage});
  });
})
});
//---------GET-LOGIN-PAGE----------//
router.get("/login", (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { userLogErr: req.session.userLogErr });
    req.session.userLogErr = false;
  }
});
//----------POST-LOGIN-PAGE----------//
router.post("/login", (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.userLoggedIn = true;
      res.redirect("/");
    } else {
      req.session.userLogErr = "Invalid Password or Username";
      res.redirect("/login");
    }
  });
});
//----------GET-SIGN-UP----------//
router.get("/signup", (req, res) => {
  res.render("user/signup");
});
//----------POST-SIGN-UP----------//
router.post("/signup", (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    req.session.user = response;
    req.session.userLoggedIn = true;
    res.redirect("/");
  });
});
//----------LOG-OUT----------//
router.get("/logout", (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = null;
  res.redirect("/login");
});
//----------CART----------//
router.get("/cart", verifyLogin, (req, res) => {
  let user = req.session.user;
  userHelper.getCartProducts(req.session.user._id).then(async (products) => {
    let total = await userHelper.getTotalAmount(req.session.user._id);
    res.render("user/cart", {user_header, products, user, total });
  });
});
//----------ADD-TO-CART----------//
router.get("/add-to-cart/:id", (req, res) => {
  if (req.session.userLoggedIn) {
    userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true });
    });
  } else {
    res.json({ status: false });
  }
});
//----------CHANGE-PRODUCT-QUANTITY----------//
router.post('/change-product-quantity', (req, res, next) => {
  userHelper.changeProductQuantity(req.body).then(async (response) => {
    let total = await userHelper.getTotalAmount(req.body.userId);
    response.total = total[0].total;
    res.json(response);
  });
});
//----------REMOVE-PRODUCT-FROM-CART----------//
router.post("/remove-product-from-cart", (req, res, next) => {
  userHelper.DeleteProductFromCart(req.body, req.session.user._id).then((response) => {
    res.json(response);
  });
});
//----------GET-PLACE-ORDER----------//
router.get('/place-order',verifyLogin, (req, res, next) => {
  let user = req.session.user;
  res.render('user/place-order', { user_header,total, user })
})
//----------POST-PLACE-ORDER----------//
router.post('/place-order', async (req, res) => {
  let userId = req.session.user._id
  let products = await userHelper.getCartProductList(req.body.userId)
  let total = await userHelper.getTotalAmount(req.session.user._id)
  //  total = total*100
  // let orderId = null
  // console.log('hyyyyyyyyyyyyyy')
  userHelper.placeOrder(req.body, products, total, userId).then((orderId)=>{
  //  let orderId = orderId
  // console.log('iddddddddddddddddddd')
    // console.log(req.body.payment)
    // console.log(total[0].total)

    if(req.body.payment==='COD'){
      // userHelper.getCartProducts(userId).then((products) => {
        console.log('haloooooo',products)
      // });
      res.json({ codSuccess: true }) 
      
      // res.json({ status:true })
      console.log('ffffffff',orderId)
    }else{
      userHelper.generateRazorpay(orderId,total).then((response)=>{
        console.log('ghyyy',response)
        res.json(response)
      })
    }
    // res.json({ codSuccess: true })
  })
   
  
  
})
//----------ORDER-SUCCESS----------//
router.get('/order-success', (req, res) => {
  res.render('user/order-success', { user_header, user: req.session.user })
})
//----------ORDERS----------//
router.get('/orders',verifyLogin, async (req, res) => {
  let user = req.session.user
  let userId = req.session.user._id
  let orders = await userHelper.getOrdersList(userId)
  if (user) {
    cartCount = await userHelper.getCartCount(userId);
  }
  res.render('user/order', {user_header, user, orders,cartCount })
})
//----------ORDER-PRODUCTS----------//
router.get('/order-products/:id', async (req, res) => {
  id = req.params.id
  let products = await userHelper.getOrderProducts(id)
  res.render('user/order-products', {user_header,products, user: req.session.user })
})
//----------GET-EDIT-PROFILE----------//
router.get('/edit-profile',verifyLogin, async(req, res) => {
  let user = req.session.user
  let userId = req.session.user._id
  if (user) {
    cartCount = await userHelper.getCartCount(userId);
  }
  userHelper.getUserDetails(req.session.user._id).then((userData) => {
    let user = req.session.user
    res.render('user/edit-profile', { user_header, userData, user,cartCount })
  })
})
//----------POST-EDIT-PROFILE----------//
router.post('/edit-profile', async (req, res) => {
  userHelper.updateProfile(req.session.user._id, req.body)
  let updateuser = await userHelper.getUserDetails(req.session.user._id)
  if (updateuser) {
    req.session.user = null;
    req.session.userLoggedIn = null;
    req.session.user = updateuser;
    req.session.userLoggedIn = true;
    res.redirect('/')
  }
})
//----------PRODUCT-DETAILS----------//
router.get('/product-details/:id', async (req, res) => {
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }
  userHelper.getProduct(req.params.id).then((product) => {
    res.render('user/product-details', {user_header, product, user: req.session.user, cartCount })
  })
})
router.post('/verify-payment',(req,res)=>{
  // console.log('order: ',req.body)
  userHelper.verifyPayment(req.body).then(()=>{
    userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      // userHelper.placeOrder(req.body, products, total, userId).then((orderId)=>{
       
        // res.json({ codSuccess: true }) 
        res.json({status:true})
      // })
     
    })
  }).catch((err)=>{
    console.log('error',err)
    res.json({status:false})
  })
})
router.get('/login-close',(req,res)=>{
  res.json({status:true})
})

module.exports = router;
