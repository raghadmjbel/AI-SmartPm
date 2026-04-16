FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY SmartPm.Api.csproj ./
RUN dotnet restore "SmartPm.Api.csproj"

COPY . ./
RUN dotnet publish "SmartPm.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY wait-for-db.sh ./
RUN chmod +x ./wait-for-db.sh

ENTRYPOINT ["./wait-for-db.sh", "db", "1433", "dotnet", "SmartPm.Api.dll"]
