"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const middleware_1 = require("../middleware");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
router.post('/register', authController_1.AuthController.register);
router.post('/login', (0, middleware_1.validate)(schemas_1.loginSchema), authController_1.AuthController.login);
router.post('/logout', auth_1.authenticateToken, authController_1.AuthController.logout);
router.get('/profile', auth_1.authenticateToken, authController_1.AuthController.getProfile);
router.put('/profile', auth_1.authenticateToken, (0, middleware_1.validate)(schemas_1.updateUserSchema), authController_1.AuthController.updateProfile);
router.get('/verify', auth_1.authenticateToken, authController_1.AuthController.verifyToken);
exports.default = router;
//# sourceMappingURL=auth.js.map