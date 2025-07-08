struktur proyek Next.js yang memisahkan dengan jelas antara bagian backend (API/logika bisnis) dan frontend (tampilan/UI):
text
```
my-nextjs-app/
├── .next/                   # Folder build otomatis (di-generate oleh Next.js)
├── node_modules/            # Dependencies
├── public/                  # Aset statis (gambar, font, dll)
│   ├── images/
│   ├── favicon.ico
│   └── ...
├── src/
│   ├── app/                 # Router Next.js 13+ (App Router)
│   │   ├── (frontend)/      # Grup route frontend
│   │   │   ├── page.tsx     # Halaman beranda
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   └── ...
│   │   ├── api/             # Route API (backend)
│   │   │   ├── auth/
│   │   │   │   └── route.ts # Endpoint auth
│   │   │   ├── users/
│   │   │   │   └── route.ts # Endpoint users
│   │   │   └── ...
│   ├── backend/             # Logika backend terpisah
│   │   ├── controllers/     # Kontroller untuk route API
│   │   ├── services/        # Layanan bisnis
│   │   ├── repositories/    # Interaksi database
│   │   ├── models/          # Model data
│   │   ├── lib/             # Library/utility backend
│   │   └── middleware/      # Middleware backend
│   ├── frontend/            # Kode frontend
│   │   ├── components/      # Komponen UI
│   │   │   ├── common/      # Komponen umum (Button, Card, dll)
│   │   │   ├── features/    # Komponen fitur spesifik
│   │   │   └── ...
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Library/utility frontend
│   │   ├── styles/          # Global styles, theme
│   │   ├── types/           # TypeScript types
│   │   └── providers/       # Context providers
│   └── shared/              # Kode yang digunakan oleh backend dan frontend
│       ├── lib/             # Shared utilities
│       ├── types/           # Shared types
│       └── constants/       # Shared constants
├── .env                     # Environment variables
├── .env.local               # Local environment variables
├── next.config.js           # Konfigurasi Next.js
├── package.json
└── tsconfig.json            # Konfigurasi TypeScript
```

Penjelasan Struktur:
1. Pemisahan Fisik Backend-Frontend

    Backend: Semua kode terkait logika bisnis, database, dan API berada di src/backend/

    Frontend: Semua kode terkait UI dan tampilan berada di src/frontend/

    Shared: Kode yang digunakan bersama di src/shared/

2. Backend Structure (src/backend/)

    Controllers: Menangani request HTTP, validasi input, mengembalikan response

    Services: Berisi logika bisnis aplikasi

    Repositories: Interaksi langsung dengan database/API eksternal

    Models: Definisi struktur data dan validasi

    Middleware: Autentikasi, logging, error handling global

3. Frontend Structure (src/frontend/)

    Components: Komponen UI yang dapat digunakan kembali

    Hooks: Custom hooks untuk logika yang dapat digunakan kembali

    Providers: Context providers untuk state management

    Styles: Global CSS, theme, atau file styling

4. API Routes (src/app/api/)

    Menggunakan Next.js Route Handlers (App Router)

    Hanya sebagai entry point yang memanggil controller dari src/backend/

5. Pages (src/app/(frontend)/)

    Menggunakan direktori (frontend) sebagai grup route

    Hanya berisi tampilan dan minimal logika presentasi

    Semua logika bisnis dipanggil melalui API routes atau services