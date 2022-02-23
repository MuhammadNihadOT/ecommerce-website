const { response, json } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();



//----------SET-VARIABLE----------//
var admin = true;
//----------LOGIN-CHECK----------//
// const verifyLogin = (req, res, next) => {
//   if (req.session.adminLoggedIn) {
//     next();
//   } else {
//     res.redirect("/admin/login");
//   }
// };





//  --------------------------------------------------------------------------------
// | *************************************HOME************************************* |
//  --------------------------------------------------------------------------------

//----------HOME-PAGE----------//
router.get('/', function (req, res, next) {
  productHelpers.getAllCategories().then((Categories) => {
    res.render('admin/view-categories', { admin, Categories });
  })
});

//  --------------------------------------------------------------------------------
// | *************************************HOME************************************* |
//  --------------------------------------------------------------------------------





//  --------------------------------------------------------------------------------
// | *************************************USERS************************************ |
//  --------------------------------------------------------------------------------

//----------ALL-USERS----------//
router.get('/all-users', (req, res) => {
  productHelpers.getUserDetails().then((userData) => {
    res.render('admin/all-users', { admin, userData })
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
  res.render('admin/edit-category', { category, admin })
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
  res.render('admin/edit-link', { admin, value })
})
//----------POST-EDIT-LINK----------//
router.post('/edit-link/:id', (req, res) => {
  productHelpers.updateLink(req.params.id, req.body).then((response) => {
    res.render('admin/edit-link', { admin, response })
  })
})
//----------GET-EDIT-SUBCATEGORY----------//
router.get('/edit-subcategory/:id', (req, res) => {
  let id = req.session.RedirectPurposeStoreID__EditSubCategory = req.params.id
  productHelpers.getSubcategory(req.params.id).then((response) => {
    res.render('admin/edit-subcategory', { admin, response })
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
  res.render('admin/add-subcategories', { admin })
})
//----------POST-ADD-SUBCATEGORIES----------//
router.post('/add-subcategories', (req, res) => {
  let SubCatID = req.session.SubCat
  productHelpers.addSubcategories(req.body, SubCatID).then((id) => {
    // console.log('ssubb',id)
    if (req.files) {
      let image = req.files.image
      image.mv('./public/sub-category-images/' + id + '.jpg', (err) => {
        if (!err) {
          res.render('admin/add-subcategories', { admin })
        } else {
          console.log(err)
        }
      })
    } else {
      res.render('admin/add-subcategories', { admin })
    }
  })
})
//----------GET-ADD-CATEGORIES----------//
router.get('/add-categories', (req, res) => {
  res.render('admin/add-categories', { admin })
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
  res.render('admin/add-link', { admin })
})
//----------POST-ADD-LINK----------//
router.post('/add-link', (req, res) => {
  let IDforCat_AtatchLink = req.session.RedirectPurposeStoreID__DeleteSubCategory
  productHelpers.checkHasLink(req.session.AddLinkPurposeID, req.body, IDforCat_AtatchLink).then((response) => {
    if (response === false) {
      let LinkError = req.session.LinkError = 'Link ia already available'
      res.render('admin/add-link', { admin, LinkError })
      LinkError = req.session.LinkError = null
    } else {
      res.render('admin/add-link', { admin })
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
  if (subCategories == false) {
    res.render('admin/subcategoryVIew', { admin })
  } else {
    res.render('admin/subcategoryVIew', { admin, subCategories })
  }
})
//----------POST-VIEW-SUBCATEGORY----------//
router.get('/view-link/:id', async (req, res) => {
  req.session.RedirectPurposeStoreID__DeleteLink = req.params.id
  req.session.ViewLinkPurposeID = req.params.id
  let result = await productHelpers.ViewLinks(req.session.ViewLinkPurposeID)
  if (result == false) {
    res.render('admin/view-link', { admin })
  } else {
    res.render('admin/view-link', { admin, result })
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
      res.redirect("/admin");
    } else {
      req.session.adminLogErr = "Invalid Password or Username";
      res.redirect("/admin/login");
    }
  })
})
// //----------LOG-OUT----------//
// router.get('/logout', (req, res) => {
//   req.session.admin = null
//   req.session.adminLoggedIn = null;
//   res.redirect("/admin/login");
// })
// //----------ORDERS----------//
// router.get('/orders/:id',verifyLogin, (req, res) => {
//   console.log(req.params.id)
//   productHelpers.getUserOrders(req.params.id).then((orders) => {
//     res.render('admin/orders', { orders, admin })
//   })
// })
// //----------CHANGE-TO-SHIPPED----------//
// router.get('/change-to-shipping/:id', (req, res) => {
//   productHelpers.getShipping(req.params.id).then((orders) => {
//     res.json({ status: true })
//   })
// })
// //----------SHIPPED----------//
// router.get('/shipped/:id', async (req, res) => {
//   let shipped = await productHelpers.getUserShippedOrders(req.params.id)
//   res.render('admin/shipped', { admin, shipped })
// })

// router.get('/add-banners',(req,res)=>{
//   res.render('admin/add-banners',{admin})
// })

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
