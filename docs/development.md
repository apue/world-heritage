# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Setup
```bash
git clone git@github.com:apue/world-heritage.git
cd world-heritage
npm install
cp .env.local.example .env.local
npm run dev
```

## Project Structure

```
world-heritage/
├── app/                    # Next.js 15 App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page
│   ├── heritage/          # Heritage browsing pages
│   │   ├── page.tsx       # List view
│   │   ├── [id]/          # Detail pages
│   │   └── map/           # Map view
│   └── games/             # Game pages
│       ├── page.tsx       # Game selection
│       ├── geo-challenge/ # Geo location game
│       └── image-match/   # Image matching game
├── components/            # React components
│   ├── maps/             # Map components
│   ├── games/            # Game components
│   └── ui/               # Reusable UI components
├── lib/                   # Core libraries
│   ├── maps/             # Map abstraction layer
│   └── utils/            # Utility functions
├── types/                 # TypeScript definitions
├── config/                # App configuration
├── data/                  # Static data (XML)
└── scripts/               # Build scripts
```

## Development Workflow

### 1. Data Processing

Convert UNESCO XML to JSON:
```bash
npm run prepare:data
```

This will:
- Parse `data/whc-zh.xml`
- Generate `data/sites.json`
- Validate data integrity

### 2. Running Development Server

```bash
npm run dev
```

Features:
- Hot reload with Turbopack
- Fast refresh
- TypeScript checking
- ESLint warnings

### 3. Type Checking

```bash
npm run type-check
```

### 4. Linting

```bash
npm run lint
npm run lint --fix  # Auto-fix issues
```

### 5. Formatting

```bash
npm run format
```

## Code Style

### TypeScript
- Use strict mode
- Define interfaces for all data structures
- Avoid `any` types
- Use meaningful variable names

### React
- Functional components with hooks
- Use TypeScript for props
- Keep components small and focused
- Extract reusable logic to hooks

### Naming Conventions
- Components: PascalCase (`HeritageCard.tsx`)
- Hooks: camelCase with `use` prefix (`useMapState.ts`)
- Utils: camelCase (`calculateDistance.ts`)
- Constants: UPPER_SNAKE_CASE

## Testing (TODO)

```bash
npm run test          # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Building for Production

```bash
npm run build
npm run start
```

## Deployment

The project is configured for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables

Set in Vercel dashboard:
- `NEXT_PUBLIC_MAP_PROVIDER`
- `NEXT_PUBLIC_MAPBOX_TOKEN` (if using Mapbox)
- `NEXT_PUBLIC_SUPABASE_URL` (future)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (future)

## Common Tasks

### Adding a New Heritage Site Page
1. Create route in `app/heritage/[id]/page.tsx`
2. Fetch site data
3. Display with `HeritageDetail` component

### Adding a New Game Mode
1. Create route in `app/games/[mode]/page.tsx`
2. Implement game logic
3. Add to game selection page

### Switching Map Provider
Update `.env.local`:
```bash
NEXT_PUBLIC_MAP_PROVIDER=mapbox  # or leaflet, google
```

### Adding Map Features
1. Update `IMapAdapter` interface
2. Implement in all adapters
3. Use in components

## Troubleshooting

### Map not displaying
- Check if Leaflet CSS is imported
- Verify coordinates are valid
- Check browser console for errors

### Build errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Type errors
```bash
npm run type-check
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
