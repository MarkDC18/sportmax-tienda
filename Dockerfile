FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY backend/GestionRopa.Api/GestionRopa.Api.csproj ./GestionRopa.Api/
RUN dotnet restore ./GestionRopa.Api/GestionRopa.Api.csproj
COPY backend/GestionRopa.Api/ ./GestionRopa.Api/
RUN dotnet publish ./GestionRopa.Api/GestionRopa.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 10000
ENTRYPOINT ["dotnet", "GestionRopa.Api.dll"]
