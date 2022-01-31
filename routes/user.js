const { response } = require("express");
var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelper = require("../helpers/user-helpers");



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
  productHelpers.getAllProducts().then((Products) => {
    res.render("user/view-products", { admin: false, Products, user, cartCount, });
  });
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
    res.render("user/cart", { products, user, total });
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
  res.render('user/place-order', { total, user })
})
//----------POST-PLACE-ORDER----------//
router.post('/place-order', async (req, res) => {
  let userId = req.session.user._id
  let products = await userHelper.getCartProductList(req.body.userId)
  let total = await userHelper.getTotalAmount(req.session.user._id)
  userHelper.placeOrder(req.body, products, total, userId)
  res.json({ status: true })
})
//----------ORDER-SUCCESS----------//
router.get('/order-success', (req, res) => {
  res.render('user/order-success', { user: req.session.user })
})
//----------ORDERS----------//
router.get('/orders',verifyLogin, async (req, res) => {
  let user = req.session.user
  let userId = req.session.user._id
  let orders = await userHelper.getOrdersList(userId)
  res.render('user/order', { user, orders })
})
//----------ORDER-PRODUCTS----------//
router.get('/order-products/:id', async (req, res) => {
  id = req.params.id
  let products = await userHelper.getOrderProducts(id)
  res.render('user/order-products', { products, user: req.session.user })
})
//----------GET-EDIT-PROFILE----------//
router.get('/edit-profile',verifyLogin, (req, res) => {
  userHelper.getUserDetails(req.session.user._id).then((userData) => {
    let user = req.session.user
    res.render('user/edit-profile', { userData, user })
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
    res.render('user/product-details', { product, user: req.session.user, cartCount })
  })
})

module.exports = router;
