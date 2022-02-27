const { response, json } = require('express');
var express = require('express');
var { Auth } = require("two-step-auth")
var variable = require('../config/variables')
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();



//----------SET-VARIABLE----------//
var admin = true;
//----------LOGIN-CHECK----------//
const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect(`/${variable.admin_router}/login`);
  }
};





//  --------------------------------------------------------------------------------
// | *************************************HOME************************************* |
//  --------------------------------------------------------------------------------

//----------HOME-PAGE----------//
router.get('/', verifyLogin, function (req, res, next) {
  productHelpers.getAllCategories().then((Categories) => {
    let Admin = req.session.admin
    res.render(`${variable.admin_router}/view-categories`, { admin, Categories, Admin });
  })
});

//  --------------------------------------------------------------------------------
// | *************************************HOME************************************* |
//  --------------------------------------------------------------------------------















//  --------------------------------------------------------------------------------
// | *************************************USERS************************************ |
//  --------------------------------------------------------------------------------
//----------ALL-USERS----------//
router.get('/all-users', verifyLogin, (req, res) => {
  productHelpers.getUserDetails().then((userData) => {
    let Admin = req.session.admin
    res.render(`${variable.admin_router}/all-users`, { admin, userData, Admin })
  })
})
//  --------------------------------------------------------------------------------
// | ************************************DELETE************************************ |
//  --------------------------------------------------------------------------------
//----------DELETE-CATEGORY----------//
router.get('/delete-category/:id', (req, res) => {
  let categoryId = req.params.id
  productHelpers.deleteCategory(categoryId).then((response) => {
    res.redirect(`/${variable.admin_router}/`)
  })
})
//----------DELETE-SUB-CATEGORY----------//
router.get('/delete-subcategory/:id', (req, res) => {
  let subcategoryId = req.params.id
  productHelpers.deleteSubCategory(subcategoryId).then((response) => {
    let id = req.session.RedirectPurposeStoreID__DeleteSubCategory
    res.redirect(`/${variable.admin_router}/subcategoryVIew/${id}`)
  })
})
//  --------------------------------------------------------------------------------
// | *************************************EDIT************************************* |
//  --------------------------------------------------------------------------------
//----------GET-EDIT-CATEGORY----------//
router.get('/edit-category/:id', async (req, res) => {
  let category = await productHelpers.getCategoryDetails(req.params.id)
  let Admin = req.session.admin
  res.render(`${variable.admin_router}/edit-category`, { category, admin, Admin })
})
//----------POST-EDIT-CATEGORY----------//
router.post('/edit-category/:id', (req, res) => {
  productHelpers.updateCategory(req.params.id, req.body).then(() => {
    if (req.files) {
      let id = req.params.id
      let image = req.files.image
      image.mv('./public/category-images/' + id + '.jpg')
      res.redirect(`/${variable.admin_router}`)
      res.end()
    } else {
    res.redirect(`/${variable.admin_router}`)
      res.end()
    }
  })
})
//----------GET-EDIT-SUBCATEGORY----------//
router.get('/edit-subcategory/:id', (req, res) => {
  let id = req.session.RedirectPurposeStoreID__EditSubCategory = req.params.id
  productHelpers.getSubcategory(req.params.id).then((response) => {
    let Admin = req.session.admin
    res.render(`${variable.admin_router}/edit-subcategory`, { admin, response, Admin })
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
    res.redirect(`/${variable.admin_router}/edit-subcategory/${id}`)
  })
})
//----------GET-EDIT-PROFILE----------//
router.get('/edit-profile', verifyLogin, (req, res) => {
  let Admin = req.session.admin
  productHelpers.getAdminData(req.session.admin._id).then((data) => {
    res.render(`${variable.admin_router}/edit-profile`, { admin, data, Admin })
  })
})
//----------POST-EDIT-PROFILE----------//
router.post('/edit-profile', verifyLogin, async (req, res) => {
  let value = req.body
  req.session.value = value
  let email = req.body.email
  try {
    const resForLogin = await Auth(req.body.email, 'AHLBYT');

    console.log('otp', resForLogin.OTP);
    let UserEmail = req.session.userEmail = req.body.email;
    let USER_OTP = req.session.USER_OTP = resForLogin.OTP
    res.render(`${variable.admin_router}/verifyOTPSignup`, { email })

  } catch (err) {
    res.render(`${variable.admin_router}/verifyOTPSignup`, { error:'Please check your internet connection or wifi' })
  }
})
//----------VERIFYING-PROFILE-EDIT----------//
router.post('/verifying', verifyLogin, (req, res) => {
  let USER_OTP = req.session.USER_OTP
  let value = req.session.value
  var NUM = req.body.FirstDigit + req.body.SecondDigit + req.body.ThirdDigit + req.body.FourthDigit + req.body.FifthDigit + req.body.SixthDigit + ''
  parseInt(`${NUM}`)
  if (NUM == USER_OTP) {
    let Admin = req.session.admin._id
    productHelpers.updateProfile(value, Admin).then(() => {
      res.redirect(`/${variable.admin_router}/edit-profile`)
    })
  } else {
    let OTP_ERROR = 'Incorrect verification code provided.'
    req.session.OTP_ERROR = OTP_ERROR
    res.render(`${variable.admin_router}/verify-otp`, { OTP_ERROR: req.session.OTP_ERROR })
  }

})
//  --------------------------------------------------------------------------------
// | ************************************ADDING************************************ |
//  --------------------------------------------------------------------------------
//----------GET-ADD-SUBCATEGORIES----------//
router.get('/add-subcategories/:id', (req, res) => {
  req.session.SubCat = req.params.id
  let Admin = req.session.admin
  res.render(`${variable.admin_router}/add-subcategories`, { admin, Admin })
})
//----------POST-ADD-SUBCATEGORIES----------//
router.post('/add-subcategories', (req, res) => {
  let SubCatID = req.session.SubCat
  productHelpers.addSubcategories(req.body, SubCatID).then((id) => {
    let Admin = req.session.admin
    if (req.files) {
      let image = req.files.image
      image.mv('./public/sub-category-images/' + id + '.jpg', (err) => {
        if (!err) {
          res.render(`${variable.admin_router}/add-subcategories`, { admin, Admin })
        } else {
          console.log(err)
        }
      })
    } else {
      res.render(`${variable.admin_router}/add-subcategories`, { admin, Admin })
    }
  })
})
//----------GET-ADD-CATEGORIES----------//
router.get('/add-categories', (req, res) => {
  let Admin = req.session.admin
  res.render(`${variable.admin_router}/add-categories`, { admin, Admin })
});
//----------POST-ADD-CATEGORIES----------//
router.post('/add-categories', (req, res) => {
  productHelpers.AddCategories(req.body, (id) => {
    if (req.files) {
      let image = req.files.image
      image.mv('./public/category-images/' + id + '.jpg', (err) => {
        if (!err) {
          res.redirect(`/${admin_router}/add-categories`)
        } else {
          console.log(err)
        }
      })
    } else {
      res.redirect(`/${variable.admin_router}/add-categories`)
    }
  })
})
//  --------------------------------------------------------------------------------
// | *************************************VIEW************************************* |
//  --------------------------------------------------------------------------------
//----------GET-VIEW-SUBCATEGORY----------//
router.get('/subcategoryVIew/:id', async (req, res) => {
  req.session.RedirectPurposeStoreID__DeleteSubCategory = req.params.id
  let subCategories = await productHelpers.getSubCategoryDetails(req.params.id)
  let Admin = req.session.admin
  if (subCategories == false) {
    res.render(`${variable.admin_router}/subcategoryVIew`, { admin, Admin })
  } else {
    res.render(`${variable.admin_router}/subcategoryVIew`, { admin, subCategories, Admin })
  }
})
//  --------------------------------------------------------------------------------
// | ******************************** LOGIN SESSION ******************************* |
//  --------------------------------------------------------------------------------
//----------GET-LOGIN----------//
router.get('/login', (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect(`/${variable.admin_router}`, { admin });
  } else {
    res.render(`${variable.admin_router}/login`, { adminLogErr: req.session.adminLogErr });
    req.session.adminLogErr = false;
  }
})
// //----------POST-LOGIN----------//
router.post('/login', (req, res) => {
  productHelpers.doLogin(req.body).then(async(response) => {
    if (response.status) {
      let email = req.body.email 
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      try {
        const resForLogin = await Auth(req.body.email, 'AHLBYT');
        console.log('otp', resForLogin.OTP);
        let USER_OTP = req.session.ADMIN_SIGNUP_OTP = resForLogin.OTP
        res.render(`${variable.admin_router}/verifyOTPSignup`, { email })
      } catch (error) {
        console.log(error)
      }
    } else {
      req.session.adminLogErr = "Invalid Password or Username";
      res.redirect(`/${variable.admin_router}/login`);
    }
  })
})
router.post('/verifyingSignup',(req,res)=>{
  let USER_OTP = req.session.ADMIN_SIGNUP_OTP
  var NUM = req.body.FirstDigit + req.body.SecondDigit + req.body.ThirdDigit + req.body.FourthDigit + req.body.FifthDigit + req.body.SixthDigit + ''
  parseInt(`${NUM}`)

  if (NUM == USER_OTP) {
    productHelpers.getAllCategories().then((Categories) => {
      let Admin = req.session.admin
      res.render(`${variable.admin_router}/view-categories`, { admin, Categories, Admin });
    })

  } else {
    let OTP_ERROR = 'Incorrect verification code provided.'
    req.session.OTP_ERROR = OTP_ERROR
    res.render(`${variable.admin_router}/verify-otp`, { OTP_ERROR: req.session.OTP_ERROR })
  }

})
// //----------LOG-OUT----------//
router.get('/logout', (req, res) => {
  req.session.admin = null
  req.session.adminLoggedIn = null;
  res.redirect(`/${variable.admin_router}/login`);
})
//  --------------------------------------------------------------------------------
// | ************************ IF USER CLICK FORGOT PASSWORD *********************** |
//  --------------------------------------------------------------------------------
//----------GET-FORGOT-PASSWORD----------//
router.get('/forgot-password', (req, res) => {
  res.render(`${variable.admin_router}/forgot-password`)
})
//----------POST-FORGOT-PASSWORD----------//
router.post('/forgot-password', (req, res) => {
  productHelpers.FoundEmail(req.body).then(async (response) => {
    let email = req.body.email
    let ForgetPassEmail = req.session.ForgetPassEmail = email
    if (response.status == true) {
      try {
        const resForLogin = await Auth(req.body.email, 'AHLBYT');
        console.log('otp', resForLogin.OTP);
        let USER_OTP = req.session.ADMIN_FORGOT_PASSWORD_OTP = resForLogin.OTP
        res.render(`${variable.admin_router}/verifyOtp-ForgetPass`, { email })
      } catch (error) {
        console.log(error)
      }
    } else {
      res.render(`${variable.admin_router}/forgot-password`, { EmailErrorForForget: 'Email not found!' })
    }
  })
})
//----------CONFIRM-OTP----------//
router.post('/verifyOtp-ForgetPass', async (req, res) => {
  let USER_OTP = req.session.ADMIN_FORGOT_PASSWORD_OTP
  var NUM = req.body.FirstDigit + req.body.SecondDigit + req.body.ThirdDigit + req.body.FourthDigit + req.body.FifthDigit + req.body.SixthDigit + ''
  parseInt(`${NUM}`)
  if (NUM == USER_OTP) {
    res.render(`${variable.admin_router}/forgotPassword`)
  } else {
    let OTP_ERROR = 'Incorrect verification code provided.'
    req.session.OTP_ERROR = OTP_ERROR
    res.render(`${variable.admin_router}/verify-otp`, { OTP_ERROR: req.session.OTP_ERROR })
  }

})
//----------AFTER-OTP-CONFIRM-UPDATE-PASSWORD----------//
router.post('/forgotPass', (req, res) => {
  let ForgetPassEmail = req.session.ForgetPassEmail
  productHelpers.ForgotPassword(req.body, ForgetPassEmail).then((response) => {
    res.render(`${variable.admin_router}/login`)
  })
})


module.exports = router;
