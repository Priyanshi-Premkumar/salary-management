const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules', '@lucide', 'angular', 'fesm2022', 'lucide-angular.mjs');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  const oldStr = "track child[1]['key'] ?? $index";
  const newStr = "track $index";

  if (content.includes(oldStr)) {
    content = content.replaceAll(oldStr, newStr);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[patch-lucide] Successfully patched @lucide/angular template track expressions.');
  } else {
    console.log('[patch-lucide] @lucide/angular already patched or track string not found.');
  }
} else {
  console.log('[patch-lucide] @lucide/angular fesm2022 file not found, skipping.');
}
