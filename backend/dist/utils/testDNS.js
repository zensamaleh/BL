"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDNSResolution = void 0;
const dns = __importStar(require("dns"));
const util_1 = require("util");
const resolve = (0, util_1.promisify)(dns.resolve4);
const lookup = (0, util_1.promisify)(dns.lookup);
const testDNSResolution = async () => {
    const hostname = 'db.siicppcypillvxkoycep.supabase.co';
    console.log('🔍 Test de résolution DNS pour:', hostname);
    console.log('='.repeat(60));
    try {
        console.log('\n🔍 Test 1: DNS Lookup général...');
        try {
            const result = await lookup(hostname);
            console.log('✅ Lookup réussi:', result);
        }
        catch (error) {
            console.log('❌ Échec lookup:', error.message);
            console.log('Code d\'erreur:', error.code);
        }
        console.log('\n🔍 Test 2: Test domaine parent supabase.co...');
        try {
            const parentResult = await lookup('supabase.co');
            console.log('✅ Domaine parent accessible:', parentResult);
        }
        catch (error) {
            console.log('❌ Domaine parent inaccessible:', error.message);
        }
        console.log('\n🔍 Test 3: Configuration DNS actuelle...');
        try {
            const dnsServers = dns.getServers();
            console.log('✅ Serveurs DNS configurés:', dnsServers);
        }
        catch (error) {
            console.log('❌ Erreur récupération serveurs DNS:', error.message);
        }
    }
    catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
    console.log('\n' + '='.repeat(60));
    console.log('🏁 Test DNS terminé');
};
exports.testDNSResolution = testDNSResolution;
if (require.main === module) {
    testDNSResolution().catch(console.error);
}
//# sourceMappingURL=testDNS.js.map