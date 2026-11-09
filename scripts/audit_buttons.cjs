const fs = require('fs');
const html = fs.readFileSync('F:/UNI-VERSO693/sokify/panel.html', 'utf8');

const btnRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
let match;
const buttons = [];

while ((match = btnRegex.exec(html)) !== null) {
  const attrs = match[1];
  const inner = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const onclickMatch = attrs.match(/onclick\s*=\s*["']([^"']+)["']/i);
  const onclick = onclickMatch ? onclickMatch[1] : null;
  const idMatch = attrs.match(/id\s*=\s*["']([^"']+)["']/i);
  const id = idMatch ? idMatch[1] : null;
  const typeMatch = attrs.match(/type\s*=\s*["']([^"']+)["']/i);
  const type = typeMatch ? typeMatch[1] : null;

  buttons.push({ id, type, onclick, text: inner.substring(0, 60) });
}

console.log('=== AUDITORÍA DE BOTONES SOKIFY PANEL ===');
console.log('Total botones encontrados:', buttons.length);

const noOnclick = buttons.filter(b => !b.onclick && b.type !== 'submit');
console.log('\n--- Botones SIN onclick (y no son submit) (' + noOnclick.length + ') ---');
noOnclick.forEach((b, idx) => console.log(`${idx + 1}. [${b.id || 'sin-id'}] "${b.text}"`));

const placeholderOnclick = buttons.filter(b => b.onclick && b.onclick.includes('mostrarNotificacion'));
console.log('\n--- Botones con placeholder mostrarNotificacion (' + placeholderOnclick.length + ') ---');
placeholderOnclick.forEach((b, idx) => console.log(`${idx + 1}. "${b.text}" --> ${b.onclick}`));

// Extraer todas las funciones llamadas en onclick
const fnCalls = [];
buttons.forEach(b => {
  if (b.onclick) {
    const fnMatch = b.onclick.match(/^([a-zA-Z0-9_$]+)\s*\(/);
    if (fnMatch) fnCalls.push({ name: fnMatch[1], btn: b });
  }
});

// Comprobar cuáles funciones no existen en el script
const scriptContent = html.substring(html.indexOf('<script>'));
const missingFns = [];
fnCalls.forEach(item => {
  const hasFn = new RegExp(`function\\s+${item.name}\\b|const\\s+${item.name}\\s*=|let\\s+${item.name}\\s*=|window\\.${item.name}\\b`).test(scriptContent);
  if (!hasFn && !['switchTab', 'firebase', 'toggleSidebar', 'alert', 'confirm', 'prompt', 'open', 'print'].some(std => item.name.startsWith(std))) {
    missingFns.push(item);
  }
});

console.log('\n--- Botones que llaman a funciones INEXISTENTES (' + missingFns.length + ') ---');
missingFns.forEach((m, idx) => console.log(`${idx + 1}. "${m.btn.text}" llama a "${m.name}"`));
