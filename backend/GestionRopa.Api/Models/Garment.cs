using Google.Cloud.Firestore;

namespace GestionRopa.Api.Models;

[FirestoreData]
public sealed class Garment
{
    [FirestoreDocumentId]
    public string Id { get; set; } = "";
    
    [FirestoreProperty]
    public string Name { get; set; } = "";
    
    [FirestoreProperty]
    public string Type { get; set; } = ""; 
    
    [FirestoreProperty]
    public string Brand { get; set; } = ""; 

    [FirestoreProperty]
    public string? Description { get; set; }
    
    [FirestoreProperty]
    public string? Size { get; set; }
    
    [FirestoreProperty]
    public string? Color { get; set; }
    
    [FirestoreProperty]
    public double Price { get; set; }
    
    [FirestoreProperty]
    public int Stock { get; set; }
    
    [FirestoreProperty]
    public int Version { get; set; } = 1;
    
    [FirestoreProperty]
    public bool Deleted { get; set; }
    
    [FirestoreProperty]
    public DateTime UpdatedAtUtc { get; set; }
}

public sealed record GarmentInput(
    string Name, 
    string Type,
    string Brand,
    string? Description, 
    string? Size, 
    string? Color, 
    double Price, 
    int Stock);

public sealed record GarmentUpdate(
    string Name, 
    string Type,
    string Brand,
    string? Description, 
    string? Size, 
    string? Color,
    double Price, 
    int Stock, 
    int BaseVersion);
