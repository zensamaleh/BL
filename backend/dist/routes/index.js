"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const bl_1 = __importDefault(require("./bl"));
const reports_1 = __importDefault(require("./reports"));
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API BL Management - Service en ligne',
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || 'v1'
    });
});
router.use('/auth', auth_1.default);
router.use('/bl', bl_1.default);
router.use('/reports', reports_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map