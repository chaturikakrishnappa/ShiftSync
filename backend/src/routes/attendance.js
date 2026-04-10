const router = require('express').Router();
const { body, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const ctrl = require('../controllers/attendanceController');

router.use(auth);
router.post('/clock-in', [body('assignmentId').isString()], validate, ctrl.clockIn);
router.post('/clock-out', [body('assignmentId').isString()], validate, ctrl.clockOut);
router.get('/report', [query('startDate').isString(), query('endDate').isString()], validate, ctrl.weeklyReport);
router.get('/export', ctrl.exportCsv);

module.exports = router;

