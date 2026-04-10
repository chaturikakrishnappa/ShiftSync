const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

router.get('/me', auth, ctrl.me);
router.get('/employees', auth, requireRole('manager'), ctrl.listEmployees);

module.exports = router;

