import * as THREE from 'three';

// Procedural 16x16 pixel art block texture generator
class TextureAtlasGenerator {
  private cache = new Map<string, THREE.CanvasTexture>();

  private createTexture(name: string, drawFn: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
    if (this.cache.has(name)) return this.cache.get(name)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    drawFn(ctx);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    this.cache.set(name, texture);
    return texture;
  }

  // 1. Grass Top
  get grassTop() {
    return this.createTexture('grassTop', (ctx) => {
      const palette = ['#5b8e34', '#649b39', '#52822e', '#6faa3f', '#4b7529'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const color = palette[(x * 7 + y * 13) % palette.length];
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 2. Dirt
  get dirt() {
    return this.createTexture('dirt', (ctx) => {
      const palette = ['#866043', '#725138', '#5c402c', '#946c4d'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[(x * 11 + y * 17) % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 3. Grass Side (with hanging grass fringe)
  get grassSide() {
    return this.createTexture('grassSide', (ctx) => {
      // Fill dirt
      const dirtPalette = ['#866043', '#725138', '#5c402c', '#946c4d'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = dirtPalette[(x * 11 + y * 17) % dirtPalette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      // Top grass fringe
      const fringeDepths = [3, 4, 3, 5, 4, 3, 4, 5, 3, 4, 3, 5, 4, 3, 4, 3];
      const grassColors = ['#5b8e34', '#649b39', '#52822e', '#6faa3f'];
      for (let x = 0; x < 16; x++) {
        const depth = fringeDepths[x];
        for (let y = 0; y < depth; y++) {
          ctx.fillStyle = grassColors[(x * 3 + y * 5) % grassColors.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 4. Oak Planks
  get oakPlanks() {
    return this.createTexture('oakPlanks', (ctx) => {
      const colors = ['#b88748', '#a7783d', '#966a33', '#865c29'];
      for (let y = 0; y < 16; y++) {
        const rowColor = colors[Math.floor(y / 4) % colors.length];
        ctx.fillStyle = rowColor;
        ctx.fillRect(0, y, 16, 1);
        // Add wood grain variation
        for (let x = 0; x < 16; x++) {
          if ((x + y * 3) % 5 === 0) {
            ctx.fillStyle = colors[(y + x) % colors.length];
            ctx.fillRect(x, y, 1, 1);
          }
        }
        // Plank horizontal seams
        if (y % 4 === 0) {
          ctx.fillStyle = '#553b1b';
          ctx.fillRect(0, y, 16, 1);
        }
      }
    });
  }

  // 5. Stone Bricks
  get stoneBricks() {
    return this.createTexture('stoneBricks', (ctx) => {
      const stone = ['#737373', '#666666', '#595959', '#7f7f7f'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = stone[(x * 9 + y * 13) % stone.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      // Brick borders
      ctx.fillStyle = '#3f3f3f';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 8, 16, 1);
      ctx.fillRect(7, 0, 1, 8);
      ctx.fillRect(15, 8, 1, 8);
    });
  }

  // 6. Cherry Blossom Leaves
  get cherryLeaves() {
    return this.createTexture('cherryLeaves', (ctx) => {
      const pinks = ['#f4a6b8', '#e88ba2', '#d7728d', '#f9c5d2', '#c45a76'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = pinks[(x * 7 + y * 11) % pinks.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 7. Bookshelf
  get bookshelf() {
    return this.createTexture('bookshelf', (ctx) => {
      // Wood frame
      ctx.fillStyle = '#8f6436';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#3a2312';
      ctx.fillRect(1, 1, 14, 6);
      ctx.fillRect(1, 9, 14, 6);

      // Books colors
      const bookColors = ['#9e2a2b', '#335c67', '#e09f3e', '#540b0e', '#3f37c9', '#588157'];
      let bx = 2;
      while (bx < 14) {
        const color = bookColors[bx % bookColors.length];
        ctx.fillStyle = color;
        ctx.fillRect(bx, 2, 2, 5);
        ctx.fillRect(bx, 10, 2, 5);
        bx += 2;
      }
    });
  }

  // 8. Deepslate Sculk (Deep Dark)
  get sculk() {
    return this.createTexture('sculk', (ctx) => {
      const darks = ['#08161d', '#050f14', '#0c222c', '#04090d'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = darks[(x * 13 + y * 7) % darks.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      // Glowing cyan sculk specks
      const cyans = ['#00e5ff', '#00b4d8', '#38b000', '#0077b6'];
      const specks = [
        [3, 3], [4, 3], [3, 4],
        [10, 5], [11, 5],
        [6, 11], [7, 11], [6, 12],
        [12, 12], [13, 12]
      ];
      specks.forEach(([sx, sy], idx) => {
        ctx.fillStyle = cyans[idx % cyans.length];
        ctx.fillRect(sx, sy, 1, 1);
      });
    });
  }

  // 9. End Stone
  get endStone() {
    return this.createTexture('endStone', (ctx) => {
      const yellows = ['#dbd89c', '#d3d08e', '#e5e3b2', '#c5c179'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = yellows[(x * 17 + y * 23) % yellows.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // 10. Obsidian
  get obsidian() {
    return this.createTexture('obsidian', (ctx) => {
      const obs = ['#151020', '#1c152d', '#110c1c', '#271d3f'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = obs[(x * 19 + y * 13) % obs.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      // Purple crystal specks
      const purples = ['#6a359c', '#8a4bba', '#52277d'];
      const specks = [[2, 2], [5, 9], [11, 4], [13, 11], [8, 14]];
      specks.forEach(([sx, sy], idx) => {
        ctx.fillStyle = purples[idx % purples.length];
        ctx.fillRect(sx, sy, 1, 1);
      });
    });
  }

  // 11. Ore Texture Generator (Diamond, Gold, Redstone, Emerald)
  getOreTexture(oreColor: string, oreGlow: string) {
    return this.createTexture(`ore_${oreColor}`, (ctx) => {
      // Stone background
      const stone = ['#737373', '#666666', '#595959', '#7f7f7f'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = stone[(x * 9 + y * 13) % stone.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      // Gem clusters
      const gems = [
        [3, 4], [4, 4], [4, 5],
        [9, 2], [10, 2], [10, 3],
        [7, 9], [8, 9], [8, 10], [9, 10],
        [12, 11], [13, 11]
      ];
      gems.forEach(([gx, gy], i) => {
        ctx.fillStyle = i % 2 === 0 ? oreColor : oreGlow;
        ctx.fillRect(gx, gy, 1, 1);
      });
    });
  }
}

export const blockTextures = new TextureAtlasGenerator();
