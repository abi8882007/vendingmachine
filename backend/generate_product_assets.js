import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.join(__dirname, 'public/assets/products');

fs.mkdirSync(assetsDir, { recursive: true });

// Function to generate high-fidelity, photorealistic SVG product packaging matching the reference image
function generateSVG(p) {
  const { name } = p;
  
  // 1. LAY'S CLASSIC (Yellow bag)
  if (name === 'lays-classic') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <radialGradient id="lays_bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#FFF066" />
          <stop offset="60%" stop-color="#FACC15" />
          <stop offset="100%" stop-color="#EAB308" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <!-- Bag Shape with Puffy Folds -->
        <path d="M 45 35 Q 100 25 155 35 Q 165 110 155 185 Q 100 195 45 185 Q 35 110 45 35 Z" fill="url(#lays_bg)" stroke="#CA8A04" stroke-width="1.5" />
        <!-- Top and Bottom Crimp Seals -->
        <path d="M 45 35 Q 100 25 155 35" stroke="#CA8A04" stroke-width="3" stroke-dasharray="3,2" />
        <path d="M 45 185 Q 100 195 155 185" stroke="#CA8A04" stroke-width="3" stroke-dasharray="3,2" />
        <!-- Bag Highlights -->
        <path d="M 55 45 Q 95 38 135 45" stroke="#FFF" stroke-width="3" stroke-linecap="round" opacity="0.4" fill="none" />
        <path d="M 52 60 Q 60 120 54 170" stroke="#FFF" stroke-width="4" stroke-linecap="round" opacity="0.3" fill="none" />
        <!-- Lay's Sun Logo -->
        <circle cx="100" cy="95" r="28" fill="#FDE047" stroke="#EAB308" stroke-width="1.5" />
        <path d="M 68 95 Q 100 90 132 95 Q 100 100 68 95 Z" fill="#DC2626" />
        <ellipse cx="100" cy="94" rx="26" ry="10" fill="#DC2626" />
        <text x="100" y="98" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="900" font-style="italic" fill="#FFF" text-anchor="middle">Lay's</text>
        <text x="100" y="118" font-family="system-ui, sans-serif" font-size="8" font-weight="800" fill="#B45309" text-anchor="middle" letter-spacing="1">Classic</text>
        <!-- Potato Chips illustration at bottom -->
        <ellipse cx="100" cy="155" rx="28" ry="14" fill="#FDE68A" stroke="#F59E0B" stroke-width="1" />
        <ellipse cx="94" cy="152" rx="22" ry="10" fill="#FEF08A" />
      </g>
    </svg>`;
  }

  // 2. LAY'S MASALA (Green bag)
  if (name === 'lays-masala') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <radialGradient id="lays_masala_bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#22C55E" />
          <stop offset="60%" stop-color="#16A34A" />
          <stop offset="100%" stop-color="#15803D" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path d="M 45 35 Q 100 25 155 35 Q 165 110 155 185 Q 100 195 45 185 Q 35 110 45 35 Z" fill="url(#lays_masala_bg)" stroke="#166534" stroke-width="1.5" />
        <path d="M 45 35 Q 100 25 155 35" stroke="#166534" stroke-width="3" stroke-dasharray="3,2" />
        <path d="M 45 185 Q 100 195 155 185" stroke="#166534" stroke-width="3" stroke-dasharray="3,2" />
        <circle cx="100" cy="95" r="28" fill="#FDE047" stroke="#EAB308" stroke-width="1.5" />
        <ellipse cx="100" cy="94" rx="26" ry="10" fill="#DC2626" />
        <text x="100" y="98" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="900" font-style="italic" fill="#FFF" text-anchor="middle">Lay's</text>
        <text x="100" y="118" font-family="system-ui, sans-serif" font-size="8" font-weight="800" fill="#FEF08A" text-anchor="middle" letter-spacing="1">India's Magic Masala</text>
        <!-- Spices & chili Pepper -->
        <path d="M 85 152 Q 100 142 115 154" stroke="#DC2626" stroke-width="5" stroke-linecap="round" fill="none" />
      </g>
    </svg>`;
  }

  // 3. DORITOS NACHO CHEESE (Red bag with triangle chip)
  if (name === 'doritos') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <radialGradient id="doritos_bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#EF4444" />
          <stop offset="70%" stop-color="#DC2626" />
          <stop offset="100%" stop-color="#991B1B" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path d="M 45 35 Q 100 25 155 35 Q 165 110 155 185 Q 100 195 45 185 Q 35 110 45 35 Z" fill="url(#doritos_bg)" />
        <!-- Doritos Triangle Logo -->
        <text x="100" y="86" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="18" font-weight="900" font-style="italic" fill="#FFF" text-anchor="middle" letter-spacing="-0.5">Doritos</text>
        <text x="100" y="99" font-family="system-ui, sans-serif" font-size="8" font-weight="800" fill="#FDE047" text-anchor="middle" letter-spacing="1">NACHO CHEESE</text>
        <!-- Nacho Triangle Chip -->
        <polygon points="100,120 70,165 130,165" fill="#F59E0B" stroke="#D97706" stroke-width="1.5" />
        <polygon points="100,123 74,162 126,162" fill="#FBBF24" opacity="0.8" />
        <!-- Cheese Dust Sparkles -->
        <circle cx="85" cy="135" r="2" fill="#EF4444" />
        <circle cx="112" cy="148" r="2.5" fill="#EF4444" />
      </g>
    </svg>`;
  }

  // 4. KURKURE (Orange bag)
  if (name === 'kurkure') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="kurkure_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FB923C" />
          <stop offset="60%" stop-color="#EA580C" />
          <stop offset="100%" stop-color="#C2410C" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path d="M 45 35 Q 100 25 155 35 Q 165 110 155 185 Q 100 195 45 185 Q 35 110 45 35 Z" fill="url(#kurkure_bg)" />
        <rect x="58" y="70" width="84" height="28" rx="6" fill="#1E3A8A" />
        <text x="100" y="89" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="900" fill="#FFF" text-anchor="middle">Kurkure</text>
        <text x="100" y="112" font-family="system-ui, sans-serif" font-size="7.5" font-weight="800" fill="#FEF08A" text-anchor="middle">MASALA MUNCH</text>
        <!-- Zigzag Kurkure sticks -->
        <path d="M 75 140 Q 85 130 95 150 Q 105 160 115 140" stroke="#FDE047" stroke-width="7" stroke-linecap="round" fill="none" />
        <path d="M 90 160 Q 100 145 110 165 Q 120 155 130 160" stroke="#F59E0B" stroke-width="6" stroke-linecap="round" fill="none" />
      </g>
    </svg>`;
  }

  // 5. CHEETOS CRUNCHY (Orange/Yellow bag with Chester)
  if (name === 'cheetos') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <radialGradient id="cheetos_bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#FDBA74" />
          <stop offset="60%" stop-color="#F97316" />
          <stop offset="100%" stop-color="#C2410C" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path d="M 45 35 Q 100 25 155 35 Q 165 110 155 185 Q 100 195 45 185 Q 35 110 45 35 Z" fill="url(#cheetos_bg)" />
        <text x="100" y="88" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="900" font-style="italic" fill="#FFF" stroke="#C2410C" stroke-width="1" text-anchor="middle">Cheetos</text>
        <text x="100" y="103" font-family="system-ui, sans-serif" font-size="8" font-weight="800" fill="#FEF08A" text-anchor="middle">CRUNCHY CHEDDAR</text>
        <!-- Cheetos Puffs -->
        <path d="M 80 140 Q 100 120 120 140" stroke="#FBBF24" stroke-width="12" stroke-linecap="round" fill="none" />
        <path d="M 75 162 Q 95 145 118 165" stroke="#F59E0B" stroke-width="10" stroke-linecap="round" fill="none" />
      </g>
    </svg>`;
  }

  // 6. PRINGLES (Red cylinder canister with mustache man)
  if (name === 'pringles') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="pringles_bg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#B91C1C" />
          <stop offset="35%" stop-color="#EF4444" />
          <stop offset="70%" stop-color="#DC2626" />
          <stop offset="100%" stop-color="#991B1B" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <!-- Canister Cap -->
        <ellipse cx="100" cy="40" rx="34" ry="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
        <!-- Cylinder Body -->
        <path d="M 66 40 L 66 175 Q 100 185 134 175 L 134 40 Z" fill="url(#pringles_bg)" />
        <!-- Pringles Mustache Man -->
        <circle cx="100" cy="74" r="16" fill="#FDE047" />
        <circle cx="95" cy="70" r="2" fill="#000" />
        <circle cx="105" cy="70" r="2" fill="#000" />
        <!-- Mustache -->
        <path d="M 88 78 Q 100 74 112 78 Q 100 86 88 78 Z" fill="#78350F" />
        <text x="100" y="105" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="900" fill="#FFF" text-anchor="middle">PRINGLES</text>
        <text x="100" y="118" font-family="system-ui, sans-serif" font-size="7" font-weight="700" fill="#FEF08A" text-anchor="middle">ORIGINAL</text>
        <!-- Saddle Chip -->
        <ellipse cx="100" cy="145" rx="22" ry="10" fill="#FDE68A" stroke="#F59E0B" stroke-width="1" />
      </g>
    </svg>`;
  }

  // 7. KITKAT (Red 4-finger bar)
  if (name === 'kitkat') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="kitkat_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#EF4444" />
          <stop offset="50%" stop-color="#DC2626" />
          <stop offset="100%" stop-color="#991B1B" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <!-- Horizontal Bar -->
        <rect x="35" y="70" width="130" height="75" rx="8" fill="url(#kitkat_bg)" />
        <!-- Pinch wrappers on ends -->
        <path d="M 30 78 L 35 70 L 35 145 L 30 137 Z" fill="#7F1D1D" />
        <path d="M 170 78 L 165 70 L 165 145 L 170 137 Z" fill="#7F1D1D" />
        <!-- White KitKat Oval -->
        <ellipse cx="100" cy="107" rx="42" ry="24" fill="#FFFFFF" />
        <ellipse cx="100" cy="107" rx="39" ry="21" fill="#DC2626" />
        <text x="100" y="113" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="900" font-style="italic" fill="#FFF" text-anchor="middle">KitKat</text>
      </g>
    </svg>`;
  }

  // 8. SNICKERS (Brown wrapper with blue bar)
  if (name === 'snickers') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="snickers_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#5B2E10" />
          <stop offset="100%" stop-color="#3B1C06" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <rect x="35" y="70" width="130" height="75" rx="8" fill="url(#snickers_bg)" />
        <path d="M 30 78 L 35 70 L 35 145 L 30 137 Z" fill="#2E1303" />
        <path d="M 170 78 L 165 70 L 165 145 L 170 137 Z" fill="#2E1303" />
        <!-- Blue SNICKERS banner inside white frame -->
        <rect x="45" y="88" width="110" height="38" rx="4" fill="#FFFFFF" />
        <rect x="48" y="91" width="104" height="32" rx="2" fill="#1D4ED8" />
        <text x="100" y="113" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="900" font-style="italic" fill="#FFF" text-anchor="middle" letter-spacing="1">SNICKERS</text>
      </g>
    </svg>`;
  }

  // 9. M&M'S PEANUT (Yellow bag)
  if (name === 'mms') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <radialGradient id="mms_bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#FEF08A" />
          <stop offset="50%" stop-color="#FACC15" />
          <stop offset="100%" stop-color="#EAB308" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path d="M 45 40 Q 100 30 155 40 Q 165 110 155 180 Q 100 190 45 180 Q 35 110 45 40 Z" fill="url(#mms_bg)" />
        <text x="100" y="96" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="20" font-weight="900" fill="#78350F" text-anchor="middle">m&amp;m's</text>
        <text x="100" y="114" font-family="system-ui, sans-serif" font-size="9" font-weight="900" fill="#DC2626" text-anchor="middle">Peanut</text>
        <!-- Peanut M&M characters -->
        <ellipse cx="80" cy="148" rx="16" ry="12" fill="#DC2626" />
        <text x="80" y="152" font-family="system-ui, sans-serif" font-size="9" font-weight="900" fill="#FFF" text-anchor="middle">m</text>
        <ellipse cx="118" cy="145" rx="14" ry="14" fill="#3B82F6" />
        <text x="118" y="149" font-family="system-ui, sans-serif" font-size="9" font-weight="900" fill="#FFF" text-anchor="middle">m</text>
      </g>
    </svg>`;
  }

  // 10. CADBURY DAIRY MILK (Purple bar with golden cup)
  if (name === 'dairymilk') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="dm_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#581C87" />
          <stop offset="60%" stop-color="#3B0764" />
          <stop offset="100%" stop-color="#240243" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <rect x="40" y="45" width="120" height="135" rx="8" fill="url(#dm_bg)" />
        <text x="100" y="80" font-family="'Brush Script MT', cursive, sans-serif" font-size="16" fill="#FDE047" text-anchor="middle">Cadbury</text>
        <text x="100" y="105" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="900" fill="#FFF" text-anchor="middle">Dairy Milk</text>
        <rect x="75" y="125" width="50" height="35" rx="4" fill="#6B21A8" stroke="#A855F7" stroke-width="1" />
        <text x="100" y="146" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#FDE047" text-anchor="middle">SILK</text>
      </g>
    </svg>`;
  }

  // 11. 5 STAR (Golden chocolate bar)
  if (name === '5star') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="fivestar_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FEF08A" />
          <stop offset="40%" stop-color="#FACC15" />
          <stop offset="100%" stop-color="#CA8A04" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <rect x="35" y="70" width="130" height="75" rx="8" fill="url(#fivestar_bg)" stroke="#B45309" stroke-width="1.5" />
        <text x="100" y="112" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="22" font-weight="900" font-style="italic" fill="#DC2626" text-anchor="middle" stroke="#7F1D1D" stroke-width="0.5">5 Star</text>
        <text x="100" y="130" font-family="system-ui, sans-serif" font-size="8" font-weight="800" fill="#78350F" text-anchor="middle">EXTRA CARAMEL</text>
      </g>
    </svg>`;
  }

  // 12. PERK (Blue chocolate wafer bar)
  if (name === 'perk') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="perk_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0284C7" />
          <stop offset="50%" stop-color="#0369A1" />
          <stop offset="100%" stop-color="#075985" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <rect x="35" y="70" width="130" height="75" rx="8" fill="url(#perk_bg)" />
        <text x="100" y="112" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="22" font-weight="900" font-style="italic" fill="#FACC15" text-anchor="middle">PERK</text>
        <text x="100" y="130" font-family="system-ui, sans-serif" font-size="8" font-weight="800" fill="#FFF" text-anchor="middle">CRISPY WAFER</text>
      </g>
    </svg>`;
  }

  // 13. COCA-COLA (Classic Red Can)
  if (name === 'coke') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="coke_can" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#991B1B" />
          <stop offset="30%" stop-color="#EF4444" />
          <stop offset="70%" stop-color="#DC2626" />
          <stop offset="100%" stop-color="#7F1D1D" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <!-- Can Rim Top -->
        <ellipse cx="100" cy="40" rx="34" ry="10" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5" />
        <ellipse cx="100" cy="40" rx="26" ry="6" fill="#94A3B8" />
        <!-- Can Cylinder Body -->
        <path d="M 66 40 L 66 170 Q 100 180 134 170 L 134 40 Z" fill="url(#coke_can)" />
        <!-- Specular Highlight Streak -->
        <path d="M 76 42 L 76 168" stroke="#FFF" stroke-width="6" opacity="0.35" stroke-linecap="round" />
        <!-- Script Coca-Cola Text -->
        <text x="100" y="112" font-family="'Brush Script MT', cursive, sans-serif" font-size="18" font-weight="900" font-style="italic" fill="#FFF" text-anchor="middle">Coca-Cola</text>
        <text x="100" y="130" font-family="system-ui, sans-serif" font-size="7" font-weight="700" fill="#FEF2F2" text-anchor="middle" letter-spacing="1">ORIGINAL TASTE</text>
      </g>
    </svg>`;
  }

  // 14. PEPSI (Blue Can with Red/White/Blue Globe)
  if (name === 'pepsi') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="pepsi_can" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#1E3A8A" />
          <stop offset="35%" stop-color="#2563EB" />
          <stop offset="70%" stop-color="#1D4ED8" />
          <stop offset="100%" stop-color="#172554" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <ellipse cx="100" cy="40" rx="34" ry="10" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5" />
        <ellipse cx="100" cy="40" rx="26" ry="6" fill="#94A3B8" />
        <path d="M 66 40 L 66 170 Q 100 180 134 170 L 134 40 Z" fill="url(#pepsi_can)" />
        <path d="M 76 42 L 76 168" stroke="#FFF" stroke-width="6" opacity="0.35" stroke-linecap="round" />
        <!-- Pepsi Globe -->
        <circle cx="100" cy="100" r="18" fill="#FFF" />
        <path d="M 82 96 Q 100 84 118 96 A 18 18 0 0 0 82 96 Z" fill="#DC2626" />
        <path d="M 82 104 Q 100 116 118 104 A 18 18 0 0 1 82 104 Z" fill="#2563EB" />
        <text x="100" y="136" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="900" fill="#FFF" text-anchor="middle" letter-spacing="1">pepsi</text>
      </g>
    </svg>`;
  }

  // 15. FANTA (Bright Orange Can)
  if (name === 'fanta') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="fanta_can" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#C2410C" />
          <stop offset="35%" stop-color="#FB923C" />
          <stop offset="70%" stop-color="#F97316" />
          <stop offset="100%" stop-color="#9A3412" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <ellipse cx="100" cy="40" rx="34" ry="10" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5" />
        <ellipse cx="100" cy="40" rx="26" ry="6" fill="#94A3B8" />
        <path d="M 66 40 L 66 170 Q 100 180 134 170 L 134 40 Z" fill="url(#fanta_can)" />
        <path d="M 76 42 L 76 168" stroke="#FFF" stroke-width="6" opacity="0.35" stroke-linecap="round" />
        <circle cx="100" cy="98" r="18" fill="#1D4ED8" />
        <text x="100" y="103" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="900" fill="#FFF" text-anchor="middle">FANTA</text>
        <!-- Green leaf -->
        <path d="M 104 80 Q 115 76 112 88 Z" fill="#16A34A" />
      </g>
    </svg>`;
  }

  // 16. SPRITE (Green Can with Lemon)
  if (name === 'sprite') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="sprite_can" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#15803D" />
          <stop offset="35%" stop-color="#22C55E" />
          <stop offset="70%" stop-color="#16A34A" />
          <stop offset="100%" stop-color="#14532D" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <ellipse cx="100" cy="40" rx="34" ry="10" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5" />
        <ellipse cx="100" cy="40" rx="26" ry="6" fill="#94A3B8" />
        <path d="M 66 40 L 66 170 Q 100 180 134 170 L 134 40 Z" fill="url(#sprite_can)" />
        <path d="M 76 42 L 76 168" stroke="#FFF" stroke-width="6" opacity="0.35" stroke-linecap="round" />
        <text x="100" y="108" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="900" font-style="italic" fill="#FFF" text-anchor="middle">Sprite</text>
        <circle cx="114" cy="94" r="5" fill="#FACC15" />
      </g>
    </svg>`;
  }

  // 17. MOUNTAIN DEW (Dark green can with angled red/white badge)
  if (name === 'dew') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="dew_can" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#365314" />
          <stop offset="35%" stop-color="#65A30D" />
          <stop offset="70%" stop-color="#4D7C0F" />
          <stop offset="100%" stop-color="#1A2E05" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <ellipse cx="100" cy="40" rx="34" ry="10" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5" />
        <ellipse cx="100" cy="40" rx="26" ry="6" fill="#94A3B8" />
        <path d="M 66 40 L 66 170 Q 100 180 134 170 L 134 40 Z" fill="url(#dew_can)" />
        <path d="M 76 42 L 76 168" stroke="#FFF" stroke-width="6" opacity="0.35" stroke-linecap="round" />
        <polygon points="76,82 124,76 120,132 72,126" fill="#DC2626" />
        <text x="98" y="103" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="900" font-style="italic" fill="#FFF" text-anchor="middle">MTN</text>
        <text x="98" y="121" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="900" font-style="italic" fill="#FFF" text-anchor="middle">DEW</text>
      </g>
    </svg>`;
  }

  // 18. LIMCA (Lime Green Can with red oval)
  if (name === 'limca') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="limca_can" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#15803D" />
          <stop offset="35%" stop-color="#4ADE80" />
          <stop offset="70%" stop-color="#22C55E" />
          <stop offset="100%" stop-color="#14532D" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <ellipse cx="100" cy="40" rx="34" ry="10" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5" />
        <ellipse cx="100" cy="40" rx="26" ry="6" fill="#94A3B8" />
        <path d="M 66 40 L 66 170 Q 100 180 134 170 L 134 40 Z" fill="url(#limca_can)" />
        <path d="M 76 42 L 76 168" stroke="#FFF" stroke-width="6" opacity="0.35" stroke-linecap="round" />
        <ellipse cx="100" cy="105" rx="26" ry="15" fill="#DC2626" />
        <text x="100" y="110" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="900" fill="#FFF" text-anchor="middle">Limca</text>
      </g>
    </svg>`;
  }

  // 19. OREO (Dark biscuit with cream filling)
  if (name === 'oreo') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <radialGradient id="oreo_bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#0284C7" />
          <stop offset="70%" stop-color="#0369A1" />
          <stop offset="100%" stop-color="#075985" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <rect x="35" y="65" width="130" height="90" rx="14" fill="url(#oreo_bg)" stroke="#0284C7" stroke-width="1.5" />
        <ellipse cx="75" cy="110" rx="24" ry="24" fill="#18181B" stroke="#27272A" stroke-width="2" />
        <ellipse cx="75" cy="110" rx="16" ry="16" fill="#F4F4F5" />
        <text x="125" y="105" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="900" fill="#FFF" text-anchor="middle">OREO</text>
        <text x="125" y="122" font-family="system-ui" font-size="8" font-weight="700" fill="#BAE6FD" text-anchor="middle">ORIGINAL</text>
      </g>
    </svg>`;
  }

  // 20. BOURBON (Chocolate cream biscuit)
  if (name === 'bourbon') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="bourbon_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#78350F" />
          <stop offset="50%" stop-color="#92400E" />
          <stop offset="100%" stop-color="#451A03" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <rect x="35" y="65" width="130" height="90" rx="12" fill="url(#bourbon_bg)" stroke="#B45309" stroke-width="1.5" />
        <text x="100" y="106" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="15" font-weight="900" fill="#FEF3C7" text-anchor="middle" letter-spacing="1">BOURBON</text>
        <text x="100" y="124" font-family="system-ui" font-size="9" font-weight="700" fill="#FDE68A" text-anchor="middle">CHOCO CRUNCH</text>
      </g>
    </svg>`;
  }

  // 21. PARLE-G (Golden biscuit)
  if (name === 'parleg') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="parleg_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FEF08A" />
          <stop offset="50%" stop-color="#FDE047" />
          <stop offset="100%" stop-color="#EAB308" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <rect x="35" y="65" width="130" height="90" rx="10" fill="url(#parleg_bg)" stroke="#CA8A04" stroke-width="1.5" />
        <rect x="42" y="72" width="116" height="76" rx="6" fill="#FACC15" stroke="#EAB308" stroke-width="1" />
        <text x="100" y="108" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="900" fill="#DC2626" text-anchor="middle">Parle-G</text>
        <text x="100" y="124" font-family="system-ui" font-size="9" font-weight="800" fill="#854D0E" text-anchor="middle">ORIGINAL GLUCOSE</text>
      </g>
    </svg>`;
  }

  // 22. DARK FANTASY (Choco Fills)
  if (name === 'darkfantasy') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <radialGradient id="df_bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#3F3F46" />
          <stop offset="70%" stop-color="#18181B" />
          <stop offset="100%" stop-color="#09090B" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <rect x="35" y="65" width="130" height="90" rx="12" fill="url(#df_bg)" stroke="#EAB308" stroke-width="1.5" />
        <text x="100" y="102" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="900" fill="#FDE047" text-anchor="middle">Dark Fantasy</text>
        <text x="100" y="120" font-family="system-ui" font-size="8" font-weight="700" fill="#CA8A04" text-anchor="middle" letter-spacing="1">CHOCO FILLS</text>
      </g>
    </svg>`;
  }

  // 23. GOOD DAY (Butter Cookies)
  if (name === 'goodday') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="gd_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3B82F6" />
          <stop offset="100%" stop-color="#1D4ED8" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <rect x="35" y="65" width="130" height="90" rx="12" fill="url(#gd_bg)" stroke="#60A5FA" stroke-width="1.5" />
        <circle cx="70" cy="110" r="20" fill="#FDE047" stroke="#F59E0B" stroke-width="1" />
        <path d="M 62 108 Q 70 116 78 108" stroke="#D97706" stroke-width="2" fill="none" stroke-linecap="round" />
        <text x="122" y="106" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="900" fill="#FFF" text-anchor="middle">Good Day</text>
        <text x="122" y="122" font-family="system-ui" font-size="8" font-weight="700" fill="#FEF08A" text-anchor="middle">BUTTER</text>
      </g>
    </svg>`;
  }

  // 24. HIDE & SEEK (Choco Chip)
  if (name === 'hideseek') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="hs_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7C2D12" />
          <stop offset="100%" stop-color="#431407" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <rect x="35" y="65" width="130" height="90" rx="12" fill="url(#hs_bg)" stroke="#B45309" stroke-width="1.5" />
        <text x="100" y="104" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="900" fill="#FEF08A" text-anchor="middle">Hide &amp; Seek</text>
        <text x="100" y="120" font-family="system-ui" font-size="8" font-weight="700" fill="#FBBF24" text-anchor="middle">CHOCO CHIP</text>
      </g>
    </svg>`;
  }

  // Fallback / Other snacks
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
    <rect x="50" y="45" width="100" height="130" rx="14" fill="#3B82F6" />
    <text x="100" y="115" font-family="system-ui" font-size="14" font-weight="800" fill="#FFF" text-anchor="middle">${p.label || name}</text>
  </svg>`;
}

const fileList = [
  { name: 'lays-classic', label: "Lay's Classic" },
  { name: 'lays-masala', label: "Lay's Masala" },
  { name: 'doritos', label: 'Doritos Nacho Cheese' },
  { name: 'kurkure', label: 'Kurkure Masala Munch' },
  { name: 'cheetos', label: 'Cheetos Crunchy' },
  { name: 'pringles', label: 'Pringles Original' },
  { name: 'kitkat', label: 'KitKat' },
  { name: 'snickers', label: 'Snickers' },
  { name: 'mms', label: "M&M's Peanut" },
  { name: 'dairymilk', label: 'Cadbury Dairy Milk' },
  { name: '5star', label: '5 Star' },
  { name: 'perk', label: 'Perk' },
  { name: 'coke', label: 'Coca-Cola' },
  { name: 'pepsi', label: 'Pepsi' },
  { name: 'fanta', label: 'Fanta' },
  { name: 'sprite', label: 'Sprite' },
  { name: 'dew', label: 'Mountain Dew' },
  { name: 'limca', label: 'Limca' },
  { name: 'oreo', label: 'Oreo Vanilla' },
  { name: 'bourbon', label: 'Britannia Bourbon' },
  { name: 'parleg', label: 'Parle-G Gold' },
  { name: 'darkfantasy', label: 'Dark Fantasy' },
  { name: 'goodday', label: 'Good Day Butter' },
  { name: 'hideseek', label: 'Hide & Seek' }
];

for (const p of fileList) {
  const filePath = path.join(assetsDir, `${p.name}.svg`);
  fs.writeFileSync(filePath, generateSVG(p));
}

console.log(`Generated photorealistic assets for ${fileList.length} items`);

