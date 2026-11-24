# AhorraWatt

AhorraWatt es una aplicación para entender el consumo eléctrico del hogar en México. Permite registrar recibos de luz de CFE (periodo, kWh y monto) y muestra en Inicio el consumo del último recibo, la comparación con el periodo anterior, el promedio diario, el historial y una estimación de CO₂. Funciona en Android, iOS y Web.

## Desarrollo

Requiere Bun y una versión de Node.js compatible con Expo SDK 58, como Node.js 24.3 o posterior de la rama 24.

```sh
bun install --frozen-lockfile
bun run start
```

Escanea el código QR con Expo Go en un dispositivo con soporte para Expo SDK 58. Usa `bun run web` para abrir la app en el navegador, `bun run android` para un emulador Android o `bun run ios` para el simulador de iOS en macOS.

## Comprobaciones

```sh
bun run typecheck
bun run lint
bun run test
bun run format:check
bun run expo install --check --bun
bunx expo-doctor
```

## Estructura

- `app/` define las rutas y la navegación con Expo Router.
- `src/features/dashboard/` contiene la pantalla de Inicio y sus tarjetas.
- `src/features/receipts/` contiene el modelo del recibo, su validación, los cálculos (`billStats.ts`) y el guardado local con AsyncStorage (`billRepository.ts`).
- `tests/` contiene las pruebas de las reglas de negocio; se corren con `bun test`.
- `src/components/` contiene la navegación (barra lateral y barra inferior), el logo, la tarjeta base y el menú desplegable.
- `assets/illustrations/` guarda las ilustraciones en SVG (logo, hojas, foco, árboles y fondo del saludo). Se muestran con `expo-image`.
- `src/design-system/tokens.ts` centraliza colores, espaciado, tipografía y puntos de quiebre.

## Datos

- Los recibos se guardan solo en el dispositivo (AsyncStorage). No hay cuentas ni sincronización.
- Las fechas del periodo se guardan como `AAAA-MM-DD` y los montos en centavos enteros.
- Las comparaciones usan el recibo anterior; si los periodos difieren por más de 7 días, Inicio lo avisa.
- El CO₂ se estima con el factor de emisión del Sistema Eléctrico Nacional 2024 de SEMARNAT: 0.444 kg CO₂e por kWh.
