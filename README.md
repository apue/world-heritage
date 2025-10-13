# 🌍 World Heritage Explorer

An interactive web application for exploring and discovering UNESCO World Heritage Sites around the world.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)

## ✨ Features

### Current Features (v0.1.0)

- 📍 **Interactive Map View** - Explore 1,248 UNESCO World Heritage Sites on an interactive map
- 🗂️ **Browse & Filter** - Search and filter sites by category, region, and country
- 🎮 **Educational Games** - Fun and engaging games to test your knowledge:
  - 🗺️ Geo-Location Challenge - Pin heritage sites on the map
  - 🖼️ Image Matching Game - Match photos with heritage sites
  - ⏰ Timeline Challenge - Order sites by inscription date
- 📱 **Responsive Design** - Fully responsive across all devices
- 🌐 **Multi-language Support** - Content available in 6 languages (Chinese, English, French, Spanish, Russian, Arabic)

### Planned Features

- 👤 **User Accounts** - Register and login to track your journey
- ✅ **Personal Collection** - Mark sites you've visited or want to visit
- ⭐ **Rating System** - Rate sites on multiple dimensions:
  - Historical Value
  - Tourist Appeal
  - Accessibility
  - Value for Money
- 📊 **Statistics Dashboard** - View your exploration progress and stats
- 🔔 **Notifications** - Get updates on new heritage sites

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation

1. Clone the repository:
```bash
git clone git@github.com:apue/world-heritage.git
cd world-heritage
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.local.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
world-heritage/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── heritage/          # Heritage sites pages
│   └── games/             # Game pages
├── components/            # React components
│   ├── maps/             # Map-related components
│   └── ui/               # Reusable UI components
├── lib/                   # Core libraries
│   ├── maps/             # Map abstraction layer
│   │   ├── types.ts      # Map interface definitions
│   │   ├── adapters/     # Map provider adapters (Leaflet, Mapbox, etc.)
│   │   └── hooks/        # Map-related hooks
│   └── utils/            # Utility functions
├── types/                 # TypeScript type definitions
├── config/                # Configuration files
│   └── map.config.ts     # Map provider configuration
├── data/                  # Static data files
│   └── whc-zh.xml        # UNESCO heritage sites data (Chinese)
├── scripts/               # Build and utility scripts
│   └── prepare-data.ts   # Convert XML to JSON
├── public/                # Static assets
└── docs/                  # Documentation

```

## 🗺️ Map Architecture

This project uses a flexible map abstraction layer that allows easy switching between different map providers:

- **Current Provider**: Leaflet + OpenStreetMap (Free, unlimited usage)
- **Supported Providers**: Leaflet, Mapbox, Google Maps, MapLibre
- **Switch Providers**: Simply change `NEXT_PUBLIC_MAP_PROVIDER` in `.env.local`

See [docs/map-architecture.md](./docs/map-architecture.md) for details.

## 📊 Data Source

All heritage site data is sourced from [UNESCO World Heritage Centre](https://whc.unesco.org/):
- **Total Sites**: 1,248 sites across 168 countries
- **Categories**: Cultural, Natural, and Mixed sites
- **Updates**: Data is periodically updated from UNESCO's official sources

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Maps**: [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Database** (Planned): [Supabase](https://supabase.com/)

## 📝 Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run prepare:data # Convert XML data to JSON
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- UNESCO World Heritage Centre for providing the heritage sites data
- OpenStreetMap contributors for map data
- The Next.js and React communities

## 📞 Contact

- GitHub: [@apue](https://github.com/apue)
- Project Link: [https://github.com/apue/world-heritage](https://github.com/apue/world-heritage)

## 🗺️ Roadmap

- [x] Project initialization and setup
- [x] Map abstraction layer architecture
- [ ] XML to JSON data conversion
- [ ] Heritage sites browsing interface
- [ ] Interactive map with all sites
- [ ] Geo-location game implementation
- [ ] Image matching game
- [ ] Supabase integration
- [ ] User authentication
- [ ] Personal collection features
- [ ] Rating system
- [ ] Statistics dashboard

---

Made with ❤️ for world heritage exploration
