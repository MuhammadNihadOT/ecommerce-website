const { response, json } = require('express');
var express = require('express');
var {Auth} = require("two-step-auth")
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();



//----------SET-VARIABLE----------//
var admin = true;
const admin_router = 'admin';
//----------LOGIN-CHECK----------//
const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};





//  --------------------------------------------------------------------------------
// | *************************************HOME************************************* |
//  --------------------------------------------------------------------------------

//----------HOME-PAGE----------//
router.get('/',verifyLogin, function (req, res, next) {
  productHelpers.getAllCategories().then((Categories) => {
    let Admin = req.session.admin
    res.render('admin/view-categories', { admin, Categories,Admin });
  })
});

//  --------------------------------------------------------------------------------
// | *************************************HOME************************************* |
//  --------------------------------------------------------------------------------





//  --------------------------------------------------------------------------------
// | *************************************USERS************************************ |
//  --------------------------------------------------------------------------------

//----------ALL-USERS----------//
router.get('/all-users',verifyLogin, (req, res) => {
  productHelpers.getUserDetails().then((userData) => {
    let Admin = req.session.admin
    res.render('admin/all-users', { admin, userData,Admin })
  })
})


//  --------------------------------------------------------------------------------
// | *************************************USERS************************************ |
//  --------------------------------------------------------------------------------





//  --------------------------------------------------------------------------------
// | ************************************DELETE************************************ |
//  --------------------------------------------------------------------------------

//----------DELETE-CATEGORY----------//
router.get('/delete-category/:id', (req, res) => {
  let categoryId = req.params.id
  productHelpers.deleteCategory(categoryId).then((response) => {
    res.redirect('/admin/')
  })
})
//----------DELETE-SUB-CATEGORY----------//
router.get('/delete-subcategory/:id', (req, res) => {
  let subcategoryId = req.params.id
  productHelpers.deleteSubCategory(subcategoryId).then((response) => {
    let id = req.session.RedirectPurposeStoreID__DeleteSubCategory
    res.redirect(`/admin/subcategoryVIew/${id}`)
  })
})
//----------DELETE-LINK----------//
router.get('/delete-link/:id', (req, res) => {
  let LinkId = req.params.id
  productHelpers.deleteLink(LinkId).then((response) => {
    let id = req.session.RedirectPurposeStoreID__DeleteSubCategory
    res.redirect(`/admin/subcategoryVIew/${id}`)
  })
})

//  --------------------------------------------------------------------------------
// | ************************************DELETE************************************ |
//  --------------------------------------------------------------------------------





//  --------------------------------------------------------------------------------
// | *************************************EDIT************************************* |
//  --------------------------------------------------------------------------------

//----------GET-EDIT-CATEGORY----------//
router.get('/edit-category/:id', async (req, res) => {
  let category = await productHelpers.getCategoryDetails(req.params.id)
  let Admin = req.session.admin
  res.render('admin/edit-category', { category, admin ,Admin})
})
//----------POST-EDIT-CATEGORY----------//
router.post('/edit-category/:id', (req, res) => {
  productHelpers.updateCategory(req.params.id, req.body).then(() => {
    if (req.files) {
      let id = req.params.id
      let image = req.files.image
      image.mv('./public/category-images/' + id + '.jpg')
      res.redirect('/admin')
      res.end()
    } else {
      res.redirect('/admin')
      res.end()
    }
  })
})
//----------GET-EDIT-LINK----------//
router.get('/edit-link/:id', async (req, res) => {
  let value = await productHelpers.getLink(req.params)
  value = value[0]
  let Admin = req.session.admin
  res.render('admin/edit-link', { admin, value,Admin })
})
//----------POST-EDIT-LINK----------//
router.post('/edit-link/:id', (req, res) => {
  productHelpers.updateLink(req.params.id, req.body).then((response) => {
    let Admin = req.session.admin
    res.render('admin/edit-link', { admin, response,Admin })
  })
})
//----------GET-EDIT-SUBCATEGORY----------//
router.get('/edit-subcategory/:id', (req, res) => {
  let id = req.session.RedirectPurposeStoreID__EditSubCategory = req.params.id
  productHelpers.getSubcategory(req.params.id).then((response) => {
    let Admin = req.session.admin
    res.render('admin/edit-subcategory', { admin, response,Admin })
  })
})
//----------POST-EDIT-SUBCATEGORY----------//
router.post('/edit-subcategory/:id', (req, res) => {
  productHelpers.updateSubcategory(req.params.id, req.body).then((response) => {
    if (req.files) {
      let id = req.params.id
      let image = req.files.image
      image.mv('./public/sub-category-images/' + id + '.jpg')
    }
    let id = req.session.RedirectPurposeStoreID__EditSubCategory
    res.redirect(`/admin/edit-subcategory/${id}`)
  })
})

//  --------------------------------------------------------------------------------
// | *************************************EDIT************************************* |
//  --------------------------------------------------------------------------------





//  --------------------------------------------------------------------------------
// | ************************************ADDING************************************ |
//  --------------------------------------------------------------------------------

//----------GET-ADD-SUBCATEGORIES----------//
router.get('/add-subcategories/:id', (req, res) => {
  req.session.SubCat = req.params.id
  let Admin = req.session.admin
  res.render('admin/add-subcategories', { admin,Admin })
})
//----------POST-ADD-SUBCATEGORIES----------//
router.post('/add-subcategories', (req, res) => {
  let SubCatID = req.session.SubCat
  productHelpers.addSubcategories(req.body, SubCatID).then((id) => {
    // console.log('ssubb',id)
    let Admin = req.session.admin
    if (req.files) {
      let image = req.files.image
      image.mv('./public/sub-category-images/' + id + '.jpg', (err) => {
        if (!err) {
          res.render('admin/add-subcategories', { admin, Admin })
        } else {
          console.log(err)
        }
      })
    } else {
      res.render('admin/add-subcategories', { admin ,Admin})
    }
  })
})
//----------GET-ADD-CATEGORIES----------//
router.get('/add-categories', (req, res) => {
  let Admin = req.session.admin
  res.render('admin/add-categories', { admin,Admin })
});
//----------POST-ADD-CATEGORIES----------//
router.post('/add-categories', (req, res) => {
  // console.log(req.files.image)
  productHelpers.AddCategories(req.body, (id) => {
    console.log(id)
    if (req.files) {
      let image = req.files.image
      image.mv('./public/category-images/' + id + '.jpg', (err) => {
        if (!err) {
          res.redirect('/admin/add-categories')
          console.log('success')
        } else {
          console.log(err)
          console.log('fail',err)
        }
      })
    } else {
      console.log('not file')
      res.redirect('/admin/add-categories')
    }
  })
})

//----------GET-ADD-LINK----------//
router.get('/add-link/:id', (req, res) => {
  req.session.AddLinkPurposeID = req.params.id
  let Admin = req.session.admin
  res.render('admin/add-link', { admin,Admin })
})
//----------POST-ADD-LINK----------//
router.post('/add-link', (req, res) => {
  let IDforCat_AtatchLink = req.session.RedirectPurposeStoreID__DeleteSubCategory
  productHelpers.checkHasLink(req.session.AddLinkPurposeID, req.body, IDforCat_AtatchLink).then((response) => {
    let Admin = req.session.admin
    if (response === false) {
      let LinkError = req.session.LinkError = 'Link ia already available'
      res.render('admin/add-link', { admin, LinkError,Admin })
      LinkError = req.session.LinkError = null
    } else {
      res.render('admin/add-link', { admin,Admin })
    }
  })
})

//  --------------------------------------------------------------------------------
// | ************************************ADDING************************************ |
//  --------------------------------------------------------------------------------





//  --------------------------------------------------------------------------------
// | *************************************VIEW************************************* |
//  --------------------------------------------------------------------------------

//----------GET-VIEW-SUBCATEGORY----------//
router.get('/subcategoryVIew/:id', async (req, res) => {
  req.session.RedirectPurposeStoreID__DeleteSubCategory = req.params.id
  let subCategories = await productHelpers.getSubCategoryDetails(req.params.id)
  let Admin = req.session.admin
  if (subCategories == false) {
    res.render('admin/subcategoryVIew', { admin,Admin })
  } else {
    res.render('admin/subcategoryVIew', { admin, subCategories,Admin })
  }
})
//----------POST-VIEW-SUBCATEGORY----------//
router.get('/view-link/:id', async (req, res) => {
  req.session.RedirectPurposeStoreID__DeleteLink = req.params.id
  req.session.ViewLinkPurposeID = req.params.id
  let result = await productHelpers.ViewLinks(req.session.ViewLinkPurposeID)
  let Admin = req.session.admin
  if (result == false) {
    res.render('admin/view-link', { admin,Admin })
  } else {
    res.render('admin/view-link', { admin, result,Admin })
  }
})

//  --------------------------------------------------------------------------------
// | *************************************VIEW************************************* |
//  --------------------------------------------------------------------------------





//----------GET-LOGIN----------//
router.get('/login', (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect("/admin", { admin });
  } else {
    res.render("admin/login", { adminLogErr: req.session.adminLogErr });
    req.session.adminLogErr = false;
  }
})
// //----------POST-LOGIN----------//
router.post('/login', (req, res) => {
  productHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      // let Admin = req.session.admin
      res.redirect("/admin");
    } else {
      req.session.adminLogErr = "Invalid Password or Username";
      res.redirect("/admin/login");
    }
  })
})
// //----------LOG-OUT----------//
router.get('/logout', (req, res) => {
  req.session.admin = null
  req.session.adminLoggedIn = null;
  res.redirect("/admin/login");
})



router.get('/edit-profile',verifyLogin,(req,res)=>{
  console.log('admin:',req.session.admin)
  let Admin = req.session.admin
  productHelpers.getAdminData(req.session.admin._id).then((data)=>{

    res.render('admin/edit-profile',{admin,data,Admin})
  })
})
router.post('/edit-profile',verifyLogin,async(req,res)=>{
  
  // productHelpers.updateProfile(req.body,Admin).then(()=>{
    // res.redirect('/admin/edit-profile')
    let value = req.body
    let email = req.body.email
console.log(value)
let v = req.session.value = value
  console.log('emaillllllll',v)
  // req.session.EditProfile = req.body


      
  try {
    const resForLogin = await Auth(req.body.email,'for otp testing purpose !!');
    
    // console.log(resForLogin);
    // console.log('mail',resForLogin.mail);
    console.log('otp',resForLogin.OTP);
    // console.log('status',resForLogin.success);
    let UserEmail = req.session.userEmail = req.body.email;
    let USER_OTP = req.session.USER_OTP = resForLogin.OTP
    // console.log('NEW OTP US :',USER_OTP)
    // console.log('email',UserEmail)
    // let email = 
    res.render(`${admin_router}/verify-otp`,{email})
} catch (error) {
    console.log(error)
}



  // })
})





router.post('/verifying',verifyLogin,(req,res)=>{
  // console.log(req.body.FirstDigit)
  let USER_OTP = req.session.USER_OTP
  // let EDIT_PRO = req.session.EditProfile
  let v = req.session.value
  console.log('emaill:',v)
  console.log('emaill:',v.email)
  var NUM = req.body.FirstDigit+req.body.SecondDigit+req.body.ThirdDigit+req.body.FourthDigit+req.body.FifthDigit +req.body.SixthDigit+''
  console.log(''+NUM)
  parseInt(`${NUM}`)
  console.log('new number is',NUM)

  console.log('verifying',USER_OTP)
  console.log(req.body)
//  && req.body.SecondDigit  && req.body.ThirdDigit &&req.body.FourthDigit && req.body.FifthDigit &&req.body.SixthDigit 
  if(NUM == USER_OTP){
    // console.log('login success')
     
    // res.redirect("/admin/");
    let Admin = req.session.admin._id
     productHelpers.updateProfile(v,Admin).then(()=>{
    res.redirect('/admin/edit-profile')
     })

  }else{
    console.log('login error')
    let OTP_ERROR = 'Incorrect verification code provided.'
    req.session.OTP_ERROR = OTP_ERROR
    res.render('admin/verify-otp',{OTP_ERROR:req.session.OTP_ERROR})
  }

})
// //----------ORDERS----------//
router.get('/forgot-password', (req, res) => {
  // console.log(req.params.id)
  // productHelpers.getUserOrders(req.params.id).then((orders) => {
    res.render('admin/forgot-password')
  // })
})
// //----------CHANGE-TO-SHIPPED----------//
router.post('/forgot-password', (req, res) => {
  productHelpers.FoundEmail(req.body).then(async(response) => {
    // res.json({ status: true })
    let email = req.body.email
    let ForgetPassEmail = req.session.ForgetPassEmail = email
    if(response.status == true){

      try {
        const resForLogin = await Auth(req.body.email,'AHLBYT !!');
        
        // console.log(resForLogin);
        // console.log('mail',resForLogin.mail);
        console.log('otp',resForLogin.OTP);
        // console.log('status',resForLogin.success);
        // let UserEmail = req.session.userEmail = req.body.email;
        let USER_OTP = req.session.ADMIN_FORGOT_PASSWORD_OTP = resForLogin.OTP
        // console.log('NEW OTP US :',USER_OTP)
        // console.log('email',UserEmail)
        // let email = 
        res.render(`${admin_router}/verifyOtp-ForgetPass`,{email})
    } catch (error) {
        console.log(error)
    }
    
    }else{
      res.render('admin/forgot-password',{EmailErrorForForget:'Email not found!'})
    }
  })
})
// //----------SHIPPED----------//
router.post('/verifyOtp-ForgetPass', async (req, res) => {
  let USER_OTP = req.session.ADMIN_FORGOT_PASSWORD_OTP
  // let shipped = await productHelpers.getUserShippedOrders(req.params.id)
  // res.render('admin/shipped', { admin, shipped })
  // let v = req.session.value
  console.log('emaill:')
  // console.log('emaill:',v.email)
  var NUM = req.body.FirstDigit+req.body.SecondDigit+req.body.ThirdDigit+req.body.FourthDigit+req.body.FifthDigit +req.body.SixthDigit+''
  console.log(''+NUM)
  parseInt(`${NUM}`)
  // console.log('new number is',NUM)

  console.log('verifying',USER_OTP)
  // console.log(req.body)
//  && req.body.SecondDigit  && req.body.ThirdDigit &&req.body.FourthDigit && req.body.FifthDigit &&req.body.SixthDigit 
  if(NUM == USER_OTP){
    console.log('login success')
     
    // res.redirect("/admin/");
    // let Admin = req.session.admin._id
    //  productHelpers.updateProfile(v,Admin).then(()=>{
    res.render('admin/forgotPassword')
    //  })

  }else{
    // console.log('login error')
    let OTP_ERROR = 'Incorrect verification code provided.'
    req.session.OTP_ERROR = OTP_ERROR
    res.render('admin/verify-otp',{OTP_ERROR:req.session.OTP_ERROR})
  }

})

router.post('/forgotPass',(req,res)=>{
  let ForgetPassEmail = req.session.ForgetPassEmail
  productHelpers.ForgotPassword(req.body,ForgetPassEmail).then((response)=>{
    
    res.render('admin/login')
  })
  // res.render('admin/add-banners',{admin})
})

// router.post('/add-banners',(req,res)=>{
//   console.log(req.body)
//   console.log(req.files.image)
//   let image = req.files.image
//   productHelpers.addBanner(req.body,(id)=>{
//     console.log(id)
//     image.mv('./public/images/' + id + '.jpg', (err) => {
//       if (!err) {
//         res.redirect('/admin/add-banners')
//       } else {
//         console.log(err)
//       }
//     })
//   })
// })
module.exports = router;
