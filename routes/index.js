const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../handlers/errorHandlers');
// Do work here
router.get('/' , homeController.homePage);
router.get('/stores' , catchErrors(homeController.getStores));
router.get('/stores/page/:page' , catchErrors(homeController.getStores));
router.get('/store/:slug', catchErrors(homeController.getStoreBySlug));
router.get('/tags', catchErrors(homeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(homeController.getStoresByTag));
router.get('/top', homeController.getTopStores);
router.get('/add', 
  authController.isLoggedIn,
  homeController.addStore);
router.post('/add',
    authController.isLoggedIn,
    homeController.upload,
    homeController.resize,
    catchErrors(homeController.createStore)
  );
router.post('/add/:id',
    homeController.upload,
    homeController.resize,
    catchErrors(homeController.updateStore)
  );
router.get('/stores/:id/edit', catchErrors(homeController.editStore));
router.get('/hearts', authController.isLoggedIn,homeController.heartsPage);

//User controller
router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/logout', authController.logout)
router.get('/register', userController.registerForm);
router.post('/register', 
  userController.validateRegister,
  userController.register,
  authController.login
  );
router.get('/account', userController.account);
router.post('/account', userController.updateAccount);
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', authController.reset);
router.post('/account/reset/:token', authController.confirmedPasswords, authController.update)
router.get('/map', homeController.mapPage);

//Review controller
router.post('/reviews/:id', authController.isLoggedIn, reviewController.addReview);

//API

router.get('/api/search', catchErrors(homeController.searchStores));
router.get('/api/stores/near', homeController.mapStores);
router.post('/api/stores/:id/heart', homeController.heartStore);

module.exports = router;
