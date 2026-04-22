## Porra Mundial 2026

App web de porra del Mundial 2026 con **Next.js 14 (App Router)**, **Tailwind CSS** y **Supabase**.

## Getting Started

### 1) Variables de entorno

El repo ya incluye `.env.local` con:

- `NEXT_PUBLIC_SUPERBASE_URL`
- `NEXT_PUBLIC_SUPERBASE_ANON_KEY`

Recomendado para links de confirmación de email (registro):

- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

### 2) Base de datos (Supabase)

- **Migración**: `supabase/migrations/0001_init.sql`
- **Seed** (datos mínimos de grupos/equipos de ejemplo): `supabase/seed.sql`

Aplica ambos en el SQL Editor de tu proyecto Supabase (o con Supabase CLI si la usas).

### 3) Ejecutar en local

Instala dependencias y levanta el servidor:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Rutas principales

- **Auth**: `/login`, `/register`
- **Fase 1 (Top 3 por grupo)**: `/fase-1`
- **Fase 2 (cuadro eliminatorio)**: `/fase-2` (estructura base creada; falta completar lógica/bracket)
- **Partido del día**: `/partido-del-dia`
- **Gran final**: `/gran-final`
- **Clasificación**: `/clasificacion`

### Notas

- La app usa `middleware.ts` para proteger rutas (redirige a `/login` si no hay sesión).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
