# scripts/extract-assets.ps1
param(
  [string]$JarPath = "scripts\cache\client.jar",
  [string]$DestBase = "public\texturepack\assets\minecraft"
)

$resolvedJar = (Resolve-Path $JarPath).Path
$resolvedDest = (Resolve-Path $DestBase).Path

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($resolvedJar)

$extracted = 0
foreach ($entry in $zip.Entries) {
  if ($entry.FullName.StartsWith("assets/minecraft/")) {
    $relPath = $entry.FullName.Substring("assets/minecraft/".Length)
    if (-not [string]::IsNullOrEmpty($relPath) -and -not $relPath.EndsWith("/")) {
      $destFile = [System.IO.Path]::Combine($resolvedDest, $relPath)
      $destDir = [System.IO.Path]::GetDirectoryName($destFile)
      if (-not [System.IO.Directory]::Exists($destDir)) {
        [System.IO.Directory]::CreateDirectory($destDir) | Out-Null
      }
      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $destFile, $true)
      $extracted++
    }
  }
}
$zip.Dispose()
Write-Host "Successfully extracted $extracted files into $resolvedDest"
