"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const testAPIFull_1 = __importDefault(require("./testAPIFull"));
dotenv_1.default.config();
console.log('🧪 Test complet et réaliste de l\'API Aegean BL Management\n');
setTimeout(() => {
    (0, testAPIFull_1.default)().catch(console.error);
}, 2000);
//# sourceMappingURL=runFullAPITests.js.map