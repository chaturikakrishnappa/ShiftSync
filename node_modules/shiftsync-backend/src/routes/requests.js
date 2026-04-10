const router = require('express').Router();
const { body } = require('express-validator');
const { auth, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const ctrl = require('../controllers/requestController');

router.use(auth);

router.post('/swap', [body('assignmentId').isString(), body('toUserId').isString()], validate, ctrl.createSwap);
router.post('/swap/respond', [body('requestId').isString(), body('accept').isBoolean()], validate, ctrl.respondSwap);
router.post('/swap/approve', requireRole('manager'), [body('requestId').isString()], validate, ctrl.approveSwap);

router.post('/leave', [body('startDate').isString(), body('endDate').isString(), body('reason').optional().isString()], validate, ctrl.createLeave);
router.post('/leave/approve', requireRole('manager'), [body('requestId').isString(), body('approve').isBoolean()], validate, ctrl.approveLeave);

router.get('/my', ctrl.listMy);

module.exports = router;

