const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('F:\\UNI-VERSO693\\sokify\\panel.html', 'utf8');

const regex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null) {
  count++;
  const attrs = match[1];
  const code = match[2];
  if (!attrs.includes('src=')) {
    try {
      new vm.Script(code);
      console.log(`Script inline #${count} (${code.length} caracteres): Sintaxis JS 100% VÁLIDA ✅`);
    } catch (err) {
      console.error(`❌ Error de sintaxis en script #${count}:`, err.message);
    }
  } else {
    console.log(`Script externo #${count}: ${attrs.trim()}`);
  }
}
