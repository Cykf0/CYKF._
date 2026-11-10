# MISSING_ICONS.md: Minecraft Item Icon Pipeline Status

**Audit Timestamp**: 2026-11-10T16:42:25.046Z  
**Total Indexed Items**: 1654  
**Downloaded in Run**: 165  
**Resumed / Existing on Disk**: 1402  

## 1. Remote Source Accessibility

### Source 1: Metabot.gg
- **Status**: **ONLINE & ACCESSIBLE**  
- **Robots.txt**: Allowed for public item categories  
- **Categories Crawled**: 11 categories (functional-blocks, building-blocks, colored-blocks, natural-blocks, redstone-blocks, tools-and-utilities, combat, food-and-drinks, ingredients, spawn-eggs, op-blocks)  
- **Total Discovered**: 1567 items  

### Source 2: Crafty.gg
- **Status**: **AUTOMATED ACCESS GATED BY CLOUDFLARE**  
- **Reason**: Cloudflare Bot Challenge (HTTP 403 Forbidden)  
- **Guidelines Protocol**: In accordance with anti-circumvention rules, the script does not attempt to bypass or solve Cloudflare challenges.  
- **Manual Fallback Instructions**:  
  1. Open [https://crafty.gg/tools/item-ids](https://crafty.gg/tools/item-ids) directly in your browser.  
  2. Save any specific desired icons to `public/items/<minecraft_id>.png`.  
  3. Re-run `npm run icons` to automatically register and index them into `public/items/index.json`.  

## 2. Failed Downloads or Missing Items

**0 Failed Downloads.** All requested items are available locally in `/public/items/`.
