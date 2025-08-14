"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const testAPI_1 = __importDefault(require("./testAPI"));
dotenv_1.default.config();
console.log('🧪 Test complet de l\'API Aegean BL Management\n');
setTimeout(() => {
    (0, testAPI_1.default)().catch(console.error);
}, 2000);
//# sourceMappingURL=runAPITests.js.map