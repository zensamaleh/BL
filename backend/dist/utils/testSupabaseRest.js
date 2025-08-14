"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabaseRest_1 = __importDefault(require("../config/supabaseRest"));
const testSupabaseRest = async () => {
    console.log('🧪 Test de la connexion Supabase REST...');
    const supabase = new supabaseRest_1.default({
        url: process.env.SUPABASE_URL || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_KEY || ''
    });
    try {
        const connectionTest = await supabase.testConnection();
        console.log(`📊 Test de connexion:`, connectionTest);
        if (connectionTest.success) {
            console.log('🔍 Test SELECT sur table users...');
            const usersResult = await supabase.select('users', 'id,username,email,role');
            if (usersResult.error) {
                console.error('❌ Erreur SELECT users:', usersResult.error);
            }
            else {
                console.log(`✅ SELECT users réussi. Nombre d'utilisateurs: ${usersResult.data?.length}`);
                console.log('👥 Utilisateurs:', usersResult.data);
            }
            console.log('🔍 Test SELECT sur table bons_livraison...');
            const blResult = await supabase.select('bons_livraison', 'numero_bl,montant_total,statut');
            if (blResult.error) {
                console.error('❌ Erreur SELECT bons_livraison:', blResult.error);
            }
            else {
                console.log(`✅ SELECT bons_livraison réussi. Nombre de BL: ${blResult.data?.length}`);
                console.log('📦 Bons de livraison:', blResult.data);
            }
        }
    }
    catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
};
exports.default = testSupabaseRest;
//# sourceMappingURL=testSupabaseRest.js.map