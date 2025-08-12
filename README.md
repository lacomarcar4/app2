# La Comarca — PWA Demo
Repositorio listo para deploy en Netlify, Vercel o GitHub Pages.

## Estructura
- index.html · SPA con router hash
- styles.css · Tema oscuro con variables (ajustá colores para igualar IG)
- app.js · Páginas: Inicio, Menú, Juegos, Puntos, Eventos, Contacto y Tienda
- manifest.json + sw.js · Soporte PWA offline
- data/*.json · Datos editables
- assets/icon-*.png · Íconos

## Menú (Kyte)
Opción rápida: usar deeplinks al catálogo `https://lacomarcar4.kyte.site` (ya configurado).
Opción pro: programar script que lea el feed de Kyte o mantener un Google Sheet que publique JSON y reemplazar `data/menu.json` en build.

## Lealtad (demo)
Genera un QR local (ID = teléfono). En producción:
- Backend (Firebase/Cloud Run) con colecciones: users, transactions, rewards
- Cálculo de puntos: 1 ARS = 1 punto (o lo que definas)
- POS: escaneo QR en caja -> suma puntos por total del ticket
- Canje: redimir y generar código único de premio

## Eventos
Puedes reemplazar data/eventos.json por iCal público de Google Calendar.

## Deploy
1) Subir la carpeta a un hosting estático
2) Activar HTTPS (requerido para PWA)
3) Listo: “Agregar a pantalla de inicio” en Android/iOS
