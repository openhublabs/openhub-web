const fs = require('fs');
const path = require('path');

// --- 1. Fix DashboardPage.jsx ---
const dashboardFile = path.join(__dirname, '../src/pages/DashboardPage.jsx');
let dashContent = fs.readFileSync(dashboardFile, 'utf8');

// Inject the ESC listener hook inside DashboardPage component
if (!dashContent.includes('e.key === \'Escape\'')) {
  dashContent = dashContent.replace(
    /const calcularEstadisticas = \(\) => \{/,
    `// ESC global listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const calcularEstadisticas = () => {`
  );
}

// Ensure the search bar div has the custom scrollbar
dashContent = dashContent.replace(
  /className="p-3 max-h-\[400px\] overflow-y-auto"/g,
  'className="p-3 max-h-[400px] overflow-y-auto custom-scrollbar"'
);

// Fix Logout button hover effect
// Original: className="liquid-glass rounded-full px-4 py-2 flex items-center gap-2 hover:bg-white/80/20 hover:text-white/90 transition-colors cursor-pointer text-white/90"
dashContent = dashContent.replace(
  /hover:bg-white\/80\/20/g,
  'hover:bg-white/20'
);

// To be absolutely certain Escape works inside input as well:
dashContent = dashContent.replace(
  /onChange=\{\(e\) => setSearchQuery\(e\.target\.value\)\}/g,
  'onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => { if(e.key === \'Escape\') setIsSearchOpen(false); }}'
);

fs.writeFileSync(dashboardFile, dashContent, 'utf8');

// --- 2. Fix usuariosService.js ---
const userSvcFile = path.join(__dirname, '../src/services/usuariosService.js');
let userSvc = fs.readFileSync(userSvcFile, 'utf8');
// remove the console.error line
userSvc = userSvc.replace(
  /console\.error\("Error al obtener usuarios de Auth:", error\);/g,
  '// console.error suppressed to avoid noise when backend is not running'
);
fs.writeFileSync(userSvcFile, userSvc, 'utf8');

// --- 3. Fix index.css for custom scrollbar ---
const cssFile = path.join(__dirname, '../src/index.css');
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

console.log("Fixes applied successfully");
