using Google.Cloud.Firestore;
using GestionRopa.Api.Models;

namespace GestionRopa.Api.Services;

public sealed class GarmentRepository(FirestoreDb db)
{
    private CollectionReference Collection => db.Collection("garments");

    public async Task<IReadOnlyList<Garment>> GetAllAsync(CancellationToken ct)
    {
        var snapshot = await Collection.GetSnapshotAsync(ct);
        return snapshot.Documents
            .Select(d =>
            {
                var item = d.ConvertTo<Garment>();
                item.Id = d.Id;
                return item;
            })
            .Where(x => !x.Deleted)
            .OrderBy(x => x.Name)
            .ToList();
    }

    public async Task<Garment?> GetAsync(string id, CancellationToken ct)
    {
        var snap = await Collection.Document(id).GetSnapshotAsync(ct);
        if (!snap.Exists) return null;
        var item = snap.ConvertTo<Garment>();
        item.Id = snap.Id;
        return item.Deleted ? null : item;
    }

    public async Task<Garment> CreateAsync(GarmentInput input, CancellationToken ct)
    {
        var doc = Collection.Document();
        var item = new Garment
        {
            Id = doc.Id,
            Name = input.Name.Trim(),
            Type = input.Type,       // <-- NUEVO: Guardamos el tipo (Pelota, Camisa, etc.)
            Brand = input.Brand,     // <-- NUEVO: Guardamos la marca
            Description = input.Description,
            Size = input.Size,
            Color = input.Color,
            Price = input.Price,
            Stock = input.Stock,
            Version = 1,
            UpdatedAtUtc = DateTime.UtcNow
        };
        await doc.SetAsync(item, cancellationToken: ct);
        return item;
    }

    public async Task<Garment?> UpdateAsync(string id, GarmentUpdate input, CancellationToken ct)
    {
        var doc = Collection.Document(id);
        return await db.RunTransactionAsync(async transaction =>
        {
            var snap = await transaction.GetSnapshotAsync(doc);
            if (!snap.Exists) return null;
            var current = snap.ConvertTo<Garment>();
            current.Id = snap.Id;
            if (current.Deleted) return null;
            
            // Control de versiones para evitar conflictos (¡Muy bien implementado!)
            if (current.Version != input.BaseVersion)
                throw new InvalidOperationException($"El registro {id} cambió en otro dispositivo. Versión actual: {current.Version}.");

            var updated = new Garment
            {
                Id = current.Id,
                Name = input.Name.Trim(),
                Type = input.Type,      // <-- NUEVO: Actualizamos el tipo
                Brand = input.Brand,    // <-- NUEVO: Actualizamos la marca
                Description = input.Description,
                Size = input.Size,
                Color = input.Color,
                Price = input.Price,
                Stock = input.Stock,
                Version = current.Version + 1,
                Deleted = false,
                UpdatedAtUtc = DateTime.UtcNow
            };
            transaction.Set(doc, updated);
            return updated;
        }, cancellationToken: ct);
    }

    public async Task<bool> DeleteAsync(string id, int baseVersion, CancellationToken ct)
    {
        var doc = Collection.Document(id);
        return await db.RunTransactionAsync(async transaction =>
        {
            var snap = await transaction.GetSnapshotAsync(doc);
            if (!snap.Exists) return false;
            var current = snap.ConvertTo<Garment>();
            if (current.Deleted) return false;
            if (current.Version != baseVersion)
                throw new InvalidOperationException($"El registro cambió en otro dispositivo. Versión actual: {current.Version}.");

            current.Id = snap.Id;
            current.Deleted = true;
            current.Version++;
            current.UpdatedAtUtc = DateTime.UtcNow;
            transaction.Set(doc, current);
            return true;
        }, cancellationToken: ct);
    }
}