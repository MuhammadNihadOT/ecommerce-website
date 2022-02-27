const { response } = require("express");
var express = require("express");
const userHelpers = require("../helpers/user-helpers");
var router = express.Router();


//----------SET-VARIABLE----------//
var user_header = true;
//----------CHECK-USER-LOGIN----------//
// const verifyLogin = (req, res, next) => {
//   if (req.session.userLoggedIn) {
//     next();
//   } else {
//     res.redirect("/login");
//   }
// };
//----------HOME-PAGE----------//
router.get("/", async function (req, res, next) {
  userHelpers.AllCatagories().then((response) => {
    res.render("user/home", { user_header, user: req.session.user, response });
  })
});
//----------CLOSE-PAGE----------//
router.get('/close', (req, res) => {
  res.redirect('/')
})
//----------GET-SIGN-UP----------//
router.get("/signup", (req, res) => {
  res.render("user/signup");
});
//----------POST-SIGN-UP----------//
router.post("/signup", (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    if (response.login) {
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    } else {
      res.render("user/signup", { EmailError: 'Email is already registered' });
    }
  })
});
//----------GET-LOGIN----------//
router.get('/login', (req, res) => {
  res.render('user/login', { LoginError: req.session.LoginError, EmailError: req.session.EmailError })
  LoginError = req.session.LoginError = null
  EmailError = req.session.EmailError = null
})
//----------POST-LOGIN----------//
router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.userLoggedIn = true;
      res.redirect("/");
    } else {
      if (response.LoginError) {
        req.session.LoginError = 'Password wrong'
        res.redirect('/login')
      }
      if (response.EmailError) {
        req.session.EmailError = 'Email not found'
        res.redirect('/login')
      }
    }
  });
});
//----------LOG-OUT----------//
router.get("/logout", (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = null;
  res.redirect("/login");
});
//----------GET-SUBCATEGORIES----------//
router.get('/subcategories/:id/:name', (req, res) => {
  let name = req.params.name
  req.session.name = name
  userHelpers.getSubCategory(req.params.id).then((SubCat) => {
    res.render('user/subcategories', { user_header, SubCat, name: req.session.name })
  })
})

module.exports = router;
