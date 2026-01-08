# Alfredo MapCN

A proof-of-concept implementation of an **open-source map solution** using [mapcn](https://mapcn.vercel.app) — a free, copy-paste map component library built on **MapLibre GL**, styled with **Tailwind CSS**, and designed to work seamlessly with **shadcn/ui**.

## Why MapCN?

This project explores replacing proprietary map solutions (like Mapbox GL JS) with open-source alternatives to reduce costs while maintaining functionality.

| Feature           | Mapbox GL JS     | MapLibre GL (via mapcn) |
| ----------------- | ---------------- | ----------------------- |
| Rendering Library | Proprietary      | Open Source (BSD-3)     |
| Map Tiles         | Paid per load    | Free (CARTO basemap)    |
| Setup Complexity  | API key required | Zero config             |
| Cost              | $$$$ at scale    | Free                    |

## Features

### 🗺️ Map Visualization

- **Clusters**: Aggregated property points with customizable colors and thresholds
- **Geometry Layer**: Display search area polygons with fill and outline styling
- **Auto FitBounds**: Automatically adjusts viewport to show all data

### ✏️ Drawing Tools

- **Polygon Drawing**: Draw custom search areas directly on the map
- **Real-time Updates**: Drawing a polygon triggers a new API request for that area
- **Clear/Reset**: Easy controls to clear drawings or reset to default location

### 📍 Property Details

- **Interactive Popups**: Click on a property point to view details
- **API Integration**: Fetches property information (images, price, features)
- **External Links**: Quick access to property listings

### 🎛️ Controls

- **Navigation Controls**: Zoom in/out, compass
- **Control Board**: Quick reset to default location after custom searches

## Tech Stack

- **[Next.js](https://nextjs.org)** - React framework (Pages Router)
- **[mapcn](https://mapcn.vercel.app)** - Map components built on MapLibre GL
- **[MapLibre GL](https://maplibre.org)** - Open-source map rendering
- **[maplibre-gl-draw](https://github.com/maplibre/maplibre-gl-draw)** - Drawing tools
- **[Tailwind CSS](https://tailwindcss.com)** - Styling
- **[shadcn/ui](https://ui.shadcn.com)** - UI components
- **[React Query](https://tanstack.com/query)** - Data fetching & caching
- **[@turf/turf](https://turfjs.org)** - Geospatial analysis (bounding boxes)

## Project Structure

```
components/
├── home.tsx           # Main page with data fetching logic
├── my-map.tsx         # Map container component
├── map/
│   ├── index.ts       # Barrel exports
│   ├── geometry-layer.tsx    # Polygon area display
│   ├── fit-bounds.tsx        # Auto viewport adjustment
│   ├── property-popup.tsx    # Property details popup
│   ├── control-board.tsx     # Navigation controls
│   └── draw-control.tsx      # Drawing functionality
├── ui/
│   └── map.tsx        # mapcn components
helpers/
└── build-geojson.ts   # Data transformation utilities
pages/
├── api/
│   ├── prospect/
│   │   └── density.ts        # Proxy to Alfredo Engine
│   └── metasearch-property.ts # Property details endpoint
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
ENGINE_ENDPOINT=your_api_endpoint
ENGINE_API_KEY=your_api_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Usage

1. **View Default Area**: The map loads with a default search (Entroncamento)
2. **Draw Custom Area**: Click "Draw" → click points on map → double-click to finish
3. **View Properties**: Click on a cluster to zoom in, click on a point to see details
4. **Reset**: Click "Entroncamento" button to return to default search

## Deployment

Deploy easily on [Vercel](https://vercel.com):

```bash
npm run build
```

Don't forget to add environment variables in your Vercel project settings.

## Related Projects

- [mapcn](https://mapcn.vercel.app) - The map component library
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [maplibre-gl-draw](https://github.com/maplibre/maplibre-gl-draw)

## License

MIT
