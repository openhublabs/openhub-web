const fs = require('fs');
const path = require('path');

const cssFile = path.join(__dirname, '../src/App.css');
let cssContent = fs.readFileSync(cssFile, 'utf8');

if (!cssContent.includes('.custom-scrollbar')) {
  const customScrollbarCss = `
/* Custom Scrollbar - Minimalist Liquid Glass iOS 26 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}
`;
  cssContent += customScrollbarCss;
  fs.writeFileSync(cssFile, cssContent, 'utf8');
}
console.log("App.css fixed");
