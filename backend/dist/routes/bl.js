"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blController_1 = require("../controllers/blController");
const auth_1 = require("../middleware/auth");
const middleware_1 = require("../middleware");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['chauffeur']), (0, middleware_1.validate)(schemas_1.createBLSchema), blController_1.BLController.createBL);
router.get('/', auth_1.authenticateToken, blController_1.BLController.getAllBL);
router.get('/stats', auth_1.authenticateToken, blController_1.BLController.getDashboardStats);
router.get('/:id', auth_1.authenticateToken, blController_1.BLController.getBLById);
router.put('/:id/validate', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['agent', 'chef']), (0, middleware_1.validate)(schemas_1.validateBLSchema), blController_1.BLController.updateBL);
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['chef']), blController_1.BLController.deleteBL);
exports.default = router;
//# sourceMappingURL=bl.js.map