import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import fs from 'fs';
import path from 'path';

const keypair = Keypair.generate();
const privateKey = bs58.encode(keypair.secretKey);
const publicKey = keypair.publicKey.toBase58();

console.log(`\n🌟 NEW AGENT WALLET GENERATED!`);
console.log(`Address: ${publicKey}`);
console.log(`-----------------------------------`);

// Update .env file
const envPath = path.resolve('../.env');
let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

if (envContent.includes('SOLANA_PRIVATE_KEY=')) {
    envContent = envContent.replace(/SOLANA_PRIVATE_KEY=.*/, `SOLANA_PRIVATE_KEY=${privateKey}`);
} else {
    envContent += `\nSOLANA_PRIVATE_KEY=${privateKey}\n`;
}

fs.writeFileSync(envPath, envContent);
console.log(`✅ Private Key saved to packages/agents/.env`);
console.log(`🚀 Ready to receive funds.`);
