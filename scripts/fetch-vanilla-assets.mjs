// scripts/fetch-vanilla-assets.mjs
// Fetches the official Minecraft client jar from Mojang piston-meta and extracts assets/minecraft/**
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TARGET_DIR = path.resolve('public/texturepack/assets/minecraft');
const CACHE_DIR = path.resolve('scripts/cache');

async function main() {
  console.log('[Vanilla Asset Pipeline] Initializing...');
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const jarPath = path.join(CACHE_DIR, 'client.jar');

  if (!fs.existsSync(jarPath) || fs.statSync(jarPath).size < 10000000) {
    console.log('[Vanilla Asset Pipeline] Fetching Mojang version manifest...');
    const manifestRes = await fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json');
    const manifest = await manifestRes.json();
    const latestRelease = manifest.latest.release;
    console.log(`[Vanilla Asset Pipeline] Latest release: ${latestRelease}`);

    const versionMeta = manifest.versions.find(v => v.id === latestRelease);
    if (!versionMeta) throw new Error(`Version ${latestRelease} not found in manifest`);

    const versionRes = await fetch(versionMeta.url);
    const versionJson = await versionRes.json();
    const clientJarUrl = versionJson.downloads.client.url;
    console.log(`[Vanilla Asset Pipeline] Client jar URL: ${clientJarUrl} (${(versionJson.downloads.client.size / (1024 * 1024)).toFixed(1)} MB)`);

    console.log('[Vanilla Asset Pipeline] Downloading client.jar...');
    const jarRes = await fetch(clientJarUrl);
    if (!jarRes.ok) throw new Error(`Download failed: ${jarRes.statusText}`);
    const arrayBuffer = await jarRes.arrayBuffer();
    fs.writeFileSync(jarPath, Buffer.from(arrayBuffer));
    console.log(`[Vanilla Asset Pipeline] client.jar saved (${(fs.statSync(jarPath).size / (1024*1024)).toFixed(1)} MB)`);
  } else {
    console.log(`[Vanilla Asset Pipeline] Using cached client.jar (${(fs.statSync(jarPath).size / (1024*1024)).toFixed(1)} MB)`);
  }

  console.log('[Vanilla Asset Pipeline] Extracting assets/minecraft/** from client.jar...');
  
  // Use PowerShell to extract assets/minecraft/* into public/texturepack/assets/minecraft/
  const psScript = `
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead("${jarPath.replace(/\\/g, '\\\\')}")
    $targetBase = "${path.resolve('public/texturepack/assets/minecraft').replace(/\\/g, '\\\\')}"
    
    $extracted = 0
    foreach ($entry in $zip.Entries) {
      if ($entry.FullName.StartsWith("assets/minecraft/")) {
        $relPath = $entry.FullName.Substring("assets/minecraft/".Length)
        if (-not [string]::IsNullOrEmpty($relPath) -and -not $relPath.EndsWith("/")) {
          $destPath = [System.IO.Path]::Combine($targetBase, $relPath)
          $destDir = [System.IO.Path]::GetDirectoryName($destPath)
          if (-not [System.IO.Directory]::Exists($destDir)) {
            [System.IO.Directory]::CreateDirectory($destDir) | Out-Null
          }
          [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $destPath, $true)
          $extracted++
        }
      }
    }
    $zip.Dispose()
    Write-Host "Extracted $extracted files from client.jar into assets/minecraft"
  `;

  execSync(`powershell -NoProfile -Command "${psScript.replace(/\n/g, ' ')}"`, { stdio: 'inherit' });
  console.log('[Vanilla Asset Pipeline] Done!');
}

main().catch(err => {
  console.error('[Vanilla Asset Pipeline] Error:', err);
  process.exit(1);
});
