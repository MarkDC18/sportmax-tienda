param(
    [string]$ApiBaseUrl = "https://apellidosynombres.onrender.com"
)

$ErrorActionPreference = "Stop"

$items = @(
    @{ name="Balón de Fútbol Pro"; type="Pelota"; brand="Mikasa"; description="Balón oficial para fútbol"; size="5"; color="Blanco/Negro"; price=89.90; stock=15 },
    @{ name="Camiseta Deportiva"; type="Camisa"; brand="Nike"; description="Camiseta transpirable"; size="M"; color="Azul"; price=79.90; stock=30 },
    @{ name="Zapatillas Running"; type="Calzado"; brand="Adidas"; description="Zapatillas para correr"; size="42"; color="Rojo"; price=249.90; stock=10 },
    @{ name="Gorra Deportiva"; type="Accesorio"; brand="Puma"; description="Gorra ajustable"; size="Única"; color="Negro"; price=45.00; stock=25 },
    @{ name="Balón de Básquet"; type="Pelota"; brand="Spalding"; description="Balón para interiores"; size="7"; color="Naranja"; price=120.00; stock=8 },
    @{ name="Short Deportivo"; type="Camisa"; brand="Under Armour"; description="Short de entrenamiento"; size="L"; color="Gris"; price=59.90; stock=20 }
)

$uri = "$($ApiBaseUrl.TrimEnd('/'))/api/garments/"
Write-Host "Enviando datos deportivos a $uri" -ForegroundColor Cyan

foreach ($item in $items) {
    $json = $item | ConvertTo-Json -Depth 5
    $result = Invoke-RestMethod -Method Post -Uri $uri -ContentType "application/json" -Body $json
    Write-Host "Creado: $($result.name) | ID: $($result.id)"
}

Write-Host "Carga de datos deportivos finalizada." -ForegroundColor Green