const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();



//----------SET-VARIABLE----------//
var admin=true;
//----------LOGIN-CHECK----------//
const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};



/* GET users listing. */
router.get('/',verifyLogin, function(req, res, next) {
  if(req.session.adminLoggedIn){
    let Admin=req.session.admin
    // console.log(admin)
    productHelpers.getAllProducts().then((Products)=>{
      res.render('admin/view-products',{admin,Products,Admin});
    })
  }else{
    res.redirect('/admin/login')
  }
  
 
});
// router.get('/login',(req,res)=>{
//   res.render('admin/login',{admin})
// })

router.get('/add-product',(req,res)=>{
  res.render('admin/add-product',{admin})
})
// // router.post('/login',(req,res)=>{
//   console.log(req.body,'login chaythu')
// })


router.post('/add-product',(req,res)=>{

  productHelpers.addProduct(req.body,(id)=>{
    let image = req.files.image
    image.mv('./public/product-images/'+id+'.jpg',(err)=>{
      if(!err){
        res.redirect('/admin/add-product')
      }else{
        console.log(err)
      }
    })
    
  })
})

router.get('/delete-product/:id',(req,res)=>{
  let proId = req.params.id
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })
  // console.log(DeleteId)
})
router.get('/edit-product/:id',async(req,res)=>{
  let product = await productHelpers.getProductDetails(req.params.id)
  // console.log(product)
  res.render('admin/edit-product',{product,admin,Admin:req.session.admin})
})
router.post('/edit-product/:id',(req,res)=>{
  let id = req.params.id
  
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    let image = req.files
    if(image){
      let image = req.files.image
      image.mv('./public/product-images/'+id+'.jpg')
    }
    res.redirect('/admin')
  })
})
router.get('/all-users',verifyLogin,(req,res)=>{
  let Admin=req.session.admin
  productHelpers.getUserDetails().then((userData)=>{
    res.render('admin/all-users',{admin,userData,Admin})
  })
  
})
router.get('/all-orders',verifyLogin,(req,res)=>{
  let Admin=req.session.admin
  productHelpers.getUserDetails().then((userData)=>{
    console.log(userData)
    res.render('admin/all-orders',{admin,userData,Admin})
  })
  // productHelpers.getUserDetailsAndOrders().then((allOrders)=>{
  //   console.log(allOrders)
  //   res.render('admin/all-orders',{allOrders,admin,Admin})
  // })
})
router.get('/login',(req,res)=>{

  if (req.session.adminLoggedIn) {
    res.redirect("/admin",{admin});
  } else {
    res.render("admin/login", { adminLogErr: req.session.adminLogErr,admin });
    req.session.adminLogErr = false;
  }

  // res.render('admin/login',{admin})
})
router.post('/login',(req,res)=>{
  console.log(req.body)
  productHelpers.doLogin(req.body).then((response)=>{
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
router.get('/logout',(req,res)=>{
  req.session.admin = null
  req.session.adminLoggedIn = null;
  res.redirect("/admin/login");
})
router.get('/orders/:id',(req,res)=>{
console.log(req.params.id)
productHelpers.getUserOrders(req.params.id).then((orders)=>{
  console.log(orders)
  res.render('admin/orders',{orders,admin})
})
})
router.get('/change-to-shipping/:id',(req,res)=>{
  // console.log(req.params.id)
  productHelpers.getShipping(req.params.id).then((orders)=>{
    console.log(' pre updated shpipped:',orders)
    res.json({status:true})
  })
})
router.get('/shipped/:id',async(req,res)=>{
  console.log('shipped id : ',req.params.id)
  let shipped = await productHelpers.getUserShippedOrders(req.params.id)
  
  res.render('admin/shipped',{admin,shipped})
})
// })



module.exports = router;
