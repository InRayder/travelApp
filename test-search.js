import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.VITE_AI_API_KEY || 'your-key'; // I need to pass key somehow
// Let's just create a script to compile and check typing or run

import fs from 'fs';
const raw = fs.readFileSync('node_modules/@google/generative-ai/dist/index.d.ts', 'utf8');
console.log(raw.split('\n').filter(line => line.toLowerCase().includes('search')).join('\n'));
