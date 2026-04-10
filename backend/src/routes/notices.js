const router = require('express').Router();
const { body } = require('express-validator');
const { auth, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const ctrl = require('../controllers/noticeController');

router.use(auth);
router.get('/', ctrl.list);
router.post('/', requireRole('manager'), [body('title').isString(), body('message').isString()], validate, ctrl.create);

module.exports = router;

