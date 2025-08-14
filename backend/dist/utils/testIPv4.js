"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
const testIPv4 = async () => {
    console.log('🔍 Test DNS et IPv4...');
    const domain = 'db.siicppcypillvxkoycep.supabase.co';
    try {
        dns_1.default.setDefaultResultOrder('ipv4first');
        const addresses = await new Promise((resolve, reject) => {
            dns_1.default.resolve4(domain, (err, addresses) => {
                if (err)
                    reject(err);
                else
                    resolve(addresses);
            });
        });
        console.log(`✅ Adresses IPv4 pour ${domain}:`, addresses);
        const lookup = await new Promise((resolve, reject) => {
            dns_1.default.lookup(domain, { family: 4 }, (err, address, family) => {
                if (err)
                    reject(err);
                else
                    resolve({ address, family });
            });
        });
        console.log(`✅ Lookup IPv4: ${lookup.address} (family: ${lookup.family})`);
    }
    catch (error) {
        console.error(`❌ Erreur DNS IPv4:`, error);
    }
};
exports.default = testIPv4;
//# sourceMappingURL=testIPv4.js.map