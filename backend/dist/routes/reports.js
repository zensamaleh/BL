"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
const auth_1 = require("../middleware/auth");
const middleware_1 = require("../middleware");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
router.post('/generate', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['agent', 'chef']), (0, middleware_1.validate)(schemas_1.generateReportSchema), reportController_1.ReportController.generateMonthlyReport);
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['agent', 'chef']), reportController_1.ReportController.listReports);
router.get('/:id/download', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['agent', 'chef']), reportController_1.ReportController.downloadReport);
exports.default = router;
//# sourceMappingURL=reports.js.map