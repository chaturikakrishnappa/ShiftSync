const router = require('express').Router();
const { body, query } = require('express-validator');
const { auth, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const ctrl = require('../controllers/shiftController');

router.use(auth);

router.post(
  '/',
  requireRole('manager'),
  [body('title').optional().isString(), body('shiftDate').isString(), body('startTime').isString(), body('endTime').isString()],
  validate,
  ctrl.createShift
);

router.get('/week', [query('weekId').isString()], validate, ctrl.listWeek);

router.post('/publish', requireRole('manager'), [body('weekId').isString()], validate, ctrl.publishWeek);
router.post('/assign', requireRole('manager'), [body('shiftId').isString(), body('userId').isString()], validate, ctrl.assignShift);
router.post('/auto', requireRole('manager'), [body('weekId').isString()], validate, ctrl.autoSchedule);

module.exports = router;

