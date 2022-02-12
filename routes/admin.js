const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();



//----------SET-VARIABLE----------//
var admin = true;
//----------LOGIN-CHECK----------//
const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};
//----------HOME-PAGE----------//
router.get('/', verifyLogin, function (req, res, next) {
  if (req.session.adminLoggedIn) {
    let Admin = req.session.admin
    productHelpers.getAllProducts().then((Products) => {
      res.render('admin/view-products', { admin, Products, Admin });
    })
  } else {
    res.redirect('/admin/login')
  }
});
//----------GET-ADD-PRODUCT----------//
router.get('/add-product',verifyLogin, (req, res) => {
  res.render('admin/add-product', { admin })
})
//----------POST-ADD-PRODUCT----------//
router.post('/add-product', (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.image
    image.mv('./public/product-images/' + id + '.jpg', (err) => {
      if (!err) {
        res.redirect('/admin/add-product')
      } else {
        console.log(err)
      }
    })
  })
})
//----------DELETE-PRODUCT----------//
router.get('/delete-product/:id',verifyLogin, (req, res) => {
  let proId = req.params.id
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin/')
  })
})
//----------GET-EDIT-PRODUCT----------//
router.get('/edit-product/:id',verifyLogin, async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-product', { product, admin, Admin: req.session.admin })
})
//----------POST-EDIT-PRODUCT----------//
router.post('/edit-product/:id', (req, res) => {
  let id = req.params.id
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    let image = req.files
    if (image) {
      let image = req.files.image
      image.mv('./public/product-images/' + id + '.jpg')
    }
    res.redirect('/admin')
  })
})
//----------ALL-USERS----------//
router.get('/all-users', verifyLogin, (req, res) => {
  let Admin = req.session.admin
  productHelpers.getUserDetails().then((userData) => {
    res.render('admin/all-users', { admin, userData, Admin })
  })
})
//----------ALL-ORDERS----------//
router.get('/all-orders', verifyLogin, (req, res) => {
  let Admin = req.session.admin
  productHelpers.getUserDetails().then((userData) => {
    res.render('admin/all-orders', { admin, userData, Admin })
  })
})
//----------GET-LOGIN----------//
router.get('/login', (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect("/admin", { admin });
  } else {
    res.render("admin/login", { adminLogErr: req.session.adminLogErr });
    req.session.adminLogErr = false;
  }
})
//----------POST-LOGIN----------//
router.post('/login', (req, res) => {
  productHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      res.redirect("/admin");
    } else {
      req.session.adminLogErr = "Invalid Password or Username";
      res.redirect("/admin/login");
    }
  })
})
//----------LOG-OUT----------//
router.get('/logout', (req, res) => {
  req.session.admin = null
  req.session.adminLoggedIn = null;
  res.redirect("/admin/login");
})
//----------ORDERS----------//
router.get('/orders/:id',verifyLogin, (req, res) => {
  console.log(req.params.id)
  productHelpers.getUserOrders(req.params.id).then((orders) => {
    res.render('admin/orders', { orders, admin })
  })
})
//----------CHANGE-TO-SHIPPED----------//
router.get('/change-to-shipping/:id', (req, res) => {
  productHelpers.getShipping(req.params.id).then((orders) => {
    res.json({ status: true })
  })
})
//----------SHIPPED----------//
router.get('/shipped/:id', async (req, res) => {
  let shipped = await productHelpers.getUserShippedOrders(req.params.id)
  res.render('admin/shipped', { admin, shipped })
})

router.get('/add-banners',(req,res)=>{
  res.render('admin/add-banners',{admin})
})

router.post('/add-banners',(req,res)=>{
  console.log(req.body)
  console.log(req.files.image)
  let image = req.files.image
  productHelpers.addBanner(req.body,(id)=>{
    console.log(id)
    image.mv('./public/images/' + id + '.jpg', (err) => {
      if (!err) {
        res.redirect('/admin/add-banners')
      } else {
        console.log(err)
      }
    })
  })
})
module.exports = router;
