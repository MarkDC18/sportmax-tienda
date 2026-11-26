using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using GestionRopa.Api.Models;
using GestionRopa.Api.Services;

var builder = WebApplication.CreateBuilder(args);
var renderPort = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(renderPort))
    builder.WebHost.UseUrls($"http://0.0.0.0:{renderPort}");

var projectId = Environment.GetEnvironmentVariable("FIREBASE_PROJECT_ID")
    ?? builder.Configuration["Firebase:ProjectId"]
    ?? "yancasaycoc";

builder.Services.AddSingleton(_ =>
{
    var serviceAccountJson = Environment.GetEnvironmentVariable("FIREBASE_SERVICE_ACCOUNT_JSON");
    if (!string.IsNullOrWhiteSpace(serviceAccountJson))
    {
        var credential = GoogleCredential.FromJson(serviceAccountJson);
        return new FirestoreDbBuilder
        {
            ProjectId = projectId,
            Credential = credential
        }.Build();
    }

    var credentialPath = Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS");
    if (!string.IsNullOrWhiteSpace(credentialPath))
    {
        var credential = GoogleCredential.FromFile(credentialPath);
        return new FirestoreDbBuilder
        {
            ProjectId = projectId,
            Credential = credential
        }.Build();
    }

    throw new InvalidOperationException(
        "Falta FIREBASE_SERVICE_ACCOUNT_JSON (Render) o GOOGLE_APPLICATION_CREDENTIALS (local).");
});

builder.Services.AddScoped<GarmentRepository>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var defaultOrigins = string.Join(',', new[] {
    "http://localhost:5500", "http://127.0.0.1:5500",
    "https://yancasaycoc.web.app", "https://yancasaycoc.firebaseapp.com"
});
var allowedOrigins = (Environment.GetEnvironmentVariable("ALLOWED_ORIGINS") ?? defaultOrigins)
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options => options.AddPolicy("frontend", policy =>
    policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors("frontend");

if (app.Environment.IsDevelopment() || Environment.GetEnvironmentVariable("ENABLE_SWAGGER") == "true")
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CAMBIO 1: Mensajes de inicio adaptados a tu tienda
app.MapGet("/", () => Results.Text("API Tienda Deportiva SportMax funcionando"));
app.MapGet("/health", () => Results.Ok(new { status = "ok", api = "gestion-deportiva", firebaseProject = projectId }));

var api = app.MapGroup("/api/garments"); // Puedes dejarlo como garments o cambiarlo a /api/productos si quieres

api.MapGet("/", async (GarmentRepository repo, CancellationToken ct) =>
    Results.Ok(await repo.GetAllAsync(ct)));

api.MapGet("/{id}", async (string id, GarmentRepository repo, CancellationToken ct) =>
{
    var item = await repo.GetAsync(id, ct);
    return item is null ? Results.NotFound() : Results.Ok(item);
});

api.MapPost("/", async (GarmentInput input, GarmentRepository repo, CancellationToken ct) =>
{
    // CAMBIO 2: Validaciones para tu tienda deportiva
    if (string.IsNullOrWhiteSpace(input.Name) || string.IsNullOrWhiteSpace(input.Type))
        return Results.BadRequest(new { message = "El nombre y el tipo de artículo (Camisa, Pelota, etc.) son obligatorios." });
    if (input.Price < 0 || input.Stock < 0)
        return Results.BadRequest(new { message = "Precio y stock no pueden ser negativos." });

    var created = await repo.CreateAsync(input, ct);
    return Results.Created($"/api/garments/{created.Id}", created);
});

api.MapPut("/{id}", async (string id, GarmentUpdate input, GarmentRepository repo, CancellationToken ct) =>
{
    // CAMBIO 3: Validación también en la actualización
    if (string.IsNullOrWhiteSpace(input.Name) || string.IsNullOrWhiteSpace(input.Type) || input.Price < 0 || input.Stock < 0)
        return Results.BadRequest(new { message = "Verifica nombre, tipo, precio y stock." });
    try
    {
        var updated = await repo.UpdateAsync(id, input, ct);
        return updated is null ? Results.NotFound() : Results.Ok(updated);
    }
    catch (InvalidOperationException ex)
    {
        return Results.Conflict(new { message = ex.Message, code = "VERSION_CONFLICT" });
    }
});

api.MapDelete("/{id}", async (string id, int? baseVersion, GarmentRepository repo, CancellationToken ct) =>
{
    try
    {
        var deleted = await repo.DeleteAsync(id, baseVersion ?? 1, ct);
        return deleted ? Results.NoContent() : Results.NotFound();
    }
    catch (InvalidOperationException ex)
    {
        return Results.Conflict(new { message = ex.Message, code = "VERSION_CONFLICT" });
    }
});

app.Run();