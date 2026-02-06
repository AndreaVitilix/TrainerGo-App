# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copia il file di soluzione
COPY MyBackendTemplate.sln ./

# Copia i file di progetto (csproj) per il restore
# NOTA: Ho rimosso la riga "Domain" perché nel nostro setup non esiste quel progetto
COPY src/Api/*.csproj ./src/Api/
COPY src/Application/*.csproj ./src/Application/
COPY src/Infrastructure/*.csproj ./src/Infrastructure/

# Ripristina le dipendenze
RUN dotnet restore

# Copia tutto il resto del codice sorgente e compila
COPY . .
WORKDIR /app/src/Api
RUN dotnet publish -c Release -o /out

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /out .

# Espone la porta dell'applicazione
EXPOSE 8080
ENTRYPOINT ["dotnet", "Api.dll"]