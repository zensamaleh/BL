"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const testSupabaseRest_1 = __importDefault(require("./utils/testSupabaseRest"));
dotenv_1.default.config();
const runTests = async () => {
    console.log('🚀 Début des tests backend...\n');
    console.log('📋 Variables d\'environnement:');
    console.log(`- SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Définie' : '❌ Manquante'}`);
    console.log(`- SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? '✅ Définie' : '❌ Manquante'}`);
    console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Définie' : '❌ Manquante'}\n`);
    await (0, testSupabaseRest_1.default)();
    console.log('\n🏁 Tests terminés!');
};
runTests().catch(console.error);
//# sourceMappingURL=test.js.map