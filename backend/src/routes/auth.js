const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post(
  '/register-manager',
  [body('businessName').isString(), body('name').isString(), body('email').isEmail(), body('password').isLength({ min: 6 })],
  validate,
  ctrl.registerManager
);

router.post('/login', [body('email').isEmail(), body('password').isString()], validate, ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);

router.post('/invite', auth, [body('email').isEmail(), body('name').isString()], validate, ctrl.invite);
router.post('/accept-invite', [body('token').isString(), body('email').isEmail(), body('password').isLength({ min: 6 })], validate, ctrl.acceptInvite);

module.exports = router;

