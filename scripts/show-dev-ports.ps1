$ports = 5173, 5174, 5175
$connections = Get-NetTCPConnection -LocalPort $ports -State Listen -ErrorAction SilentlyContinue

if (-not $connections) {
  Write-Host "Ports 5173, 5174, and 5175 are free."
  exit 0
}

$connections |
  Select-Object LocalAddress, LocalPort, OwningProcess |
  Sort-Object LocalPort |
  Format-Table -AutoSize

$processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
Get-Process -Id $processIds -ErrorAction SilentlyContinue |
  Select-Object Id, ProcessName, Path |
  Sort-Object Id |
  Format-Table -AutoSize
