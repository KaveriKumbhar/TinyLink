# TinyLink - URL Shortener

A modern URL shortener application built with Next.js, similar to bit.ly. Create short links, track clicks, and manage your URLs with a clean, professional interface.

## Features

- ✅ Create short links with optional custom codes
- ✅ URL validation before saving
- ✅ Global uniqueness for custom codes
- ✅ Click tracking (total clicks and last clicked time)
- ✅ Delete links functionality
- ✅ Dashboard with search and filter
- ✅ Individual link statistics page
- ✅ Health check endpoint
- ✅ Responsive, modern UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB (compatible with MongoDB Atlas)
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or MongoDB Atlas)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd proj2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your database URL:
```
DATABASE_URL=mongodb://localhost:27017/tinylink
# Or for MongoDB Atlas:
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/tinylink
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Initialize the database:
```bash
npm run init-db
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### Links API

- `POST /api/links` - Create a new short link
  - Body: `{ "url": "https://example.com", "code": "optional-custom-code" }`
  - Returns: Created link object
  - Status: 201 (created), 400 (invalid URL), 409 (code exists)

- `GET /api/links` - Get all links
  - Returns: Array of all links

- `GET /api/links/:code` - Get stats for a specific link
  - Returns: Link object with statistics

- `DELETE /api/links/:code` - Delete a link
  - Returns: Success message
  - Status: 200 (success), 404 (not found)

### Health Check

- `GET /healthz` - Health check endpoint
  - Returns: `{ "ok": true, "version": "1.0", ... }`

## Routes

- `/` - Dashboard (list all links, create new links, delete links)
- `/code/:code` - Statistics page for a specific link
- `/:code` - Redirect to target URL (302 redirect)
- `/healthz` - Health check endpoint

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:
   - `DATABASE_URL` - Your MongoDB connection string (MongoDB Atlas recommended)
   - `NEXT_PUBLIC_BASE_URL` - Your Vercel deployment URL
   - `MONGODB_DB` (optional) - Database name (defaults to 'tinylink')
4. Deploy!

The database will be initialized automatically on first connection, or you can run `npm run init-db` manually.

## Project Structure

```
proj2/
├── app/
│   ├── api/
│   │   ├── links/
│   │   │   ├── [code]/
│   │   │   │   └── route.js
│   │   │   └── route.js
│   │   └── healthz/
│   │       └── route.js
│   ├── code/
│   │   └── [code]/
│   │       └── page.js
│   ├── [code]/
│   │   └── route.js
│   ├── layout.js
│   ├── page.js
│   └── globals.css
├── lib/
│   ├── db.js
│   └── utils.js
├── scripts/
│   └── init-db.js
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.js
└── README.md
```

## Environment Variables

- `DATABASE_URL` or `MONGODB_URI` - MongoDB connection string (required)
- `MONGODB_DB` - Database name (optional, defaults to 'tinylink')
- `NEXT_PUBLIC_BASE_URL` - Base URL for generating short links (required)

## License

MIT

