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
    res.render("user/view-products", {admin:false,Products,user,cartCount,});
  });
});
//---------GET-LOGIN-PAGE----------//
router.get("/login", (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { userLogErr: req.session.userLogErr});
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
router.get("/cart",verifyLogin, (req, res) => {
  let user = req.session.user;
  userHelper.getCartProducts(req.session.user._id).then(async (products) => {
    let total = await userHelper.getTotalAmount(req.session.user._id);
    res.render("user/cart", { products, user, total });
  });
});





//----------ADD-TO-CART----------//
router.get("/add-to-cart/:id",(req, res) => {
  // let status = null
  if(req.session.userLoggedIn){
    // res.status=false
    // status = true
    userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
      res.json({ status:true});
    });
    
  }else{
    // status= false
    res.json({ status:false});
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
   
    router.get('/place-order',(req,res,next)=>{
      let user = req.session.user;
      // console.log(res)
      // console.log()
      res.render('user/place-order',{total,user})
    })


    router.post('/place-order',async(req,res)=>{
      console.log(req.body,'myyyyyyyyyyyyyyyyyyyrrrrrrrrrrrrrrr')
      let userId=req.session.user._id
      // console.log(userId)
      let products =await userHelper.getCartProductList(req.body.userId)
      console.log(products)
    
      let total=await userHelper.getTotalAmount(req.session.user._id)
    
      // console.log(total)
      
      userHelper.placeOrder(req.body,products,total,userId)
      res.json({status:true})
    })
    


  // router.get('/s',(req,res)=>{
  //   let total = 0000
  //   res.render('user/s')
  //   console.log('place ordaril kayari')
  //     let user = req.session.user

  //     let total = await userHelper.getTotalAmount(req.session.user._id)
  //     total=total[0].total
  //     console.log('total:',total)
      
  // })
  

 

  router.get('/order-success',(req,res)=>{
    res.render('user/order-success',{user:req.session.user})
  })
  router.get('/orders',async(req,res)=>{
    let user = req.session.user
    console.log(user)
    let userId=req.session.user._id
    let orders= await userHelper.getOrdersList(userId)
    console.log(orders)

    res.render('user/order',{user,orders})
  })
  router.get('/order-products/:id',async(req,res)=>{
    id = req.params.id
    //console.log(id)
    let products=await userHelper.getOrderProducts(id)
    console.log(products)
    res.render('user/order-products',{products,user:req.session.user})
  })



  router.get('/edit-profile',(req,res)=>{
    console.log('edit-profile')
    userHelper.getUserDetails(req.session.user._id).then((userData)=>{
      let user = req.session.user
      console.log(user)
      res.render('user/edit-profile',{userData,user})
    })
    // let product = await productHelpers.getProductDetails(req.params.id)
    // console.log(product)
    // res.render('admin/edit-product',{product})

  })
  router.post('/edit-profile',async(req,res)=>{
    // console.log(req.body,'last')
    // console.log(req.session.user._id,req.body)
    userHelper.updateProfile(req.session.user._id,req.body)
      let updateuser =await userHelper.getUserDetails(req.session.user._id)
      console.log('update data is :',updateuser)
      if(updateuser){
        req.session.user = null;
        req.session.userLoggedIn = null;
        req.session.user = updateuser;
        req.session.userLoggedIn = true;
        res.redirect('/')
      }
    
    // res.json({status:true})
  })
  // router.post('/session-set',(req,res)=>{
  //   console.log('session set')

  // })
  // router.get('/edit',(req,res)=>{
  //   res.render('
  // user/edit',{user:req.session.user})
  // })
  // router.post('/edit',(req,res)=>{
  //   // res.render('user/edit')
  //   // console.log(req.body)
  //   // console.log('available edit option')
  //   userHelper.edit(req.session.user._id,req.body)
  // })

  router.get('/product-details/:id',async(req,res)=>{
    // console.log('produt id :',req.params.id)
    // console.log('produt id :',req.params.id)
    console.log('produt id :',req.params.id)
    // console.log('produt id :',req.params.id)
    // console.log('body log:',req.body)
    let cartCount = null;
   if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
    }
    userHelper.getProduct(req.params.id).then((product)=>{
      // 
      
      res.render('user/product-details',{product,user:req.session.user,cartCount})
    })
    
    // res.render('user/product-details')
  })

module.exports = router;
