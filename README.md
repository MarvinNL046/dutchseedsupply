# Dutch Seed Supply

A modern e-commerce platform for cannabis seeds built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- Responsive design for all devices
- Multi-language support (EN, NL, DE, FR)
- Product catalog with categories
- User authentication and profiles
- Loyalty points system
- Detailed product information
- Customer testimonials
- Educational content about cannabis seeds

## Tech Stack

- **Frontend**: Next.js 14.2.23, TypeScript, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **Payment Processing**: Viva.com (planned)
- **Deployment**: Vercel

## Deployment

The project is deployed on Vercel. To ensure proper functionality:

1. Set up environment variables in the Vercel dashboard:
   - Go to your project settings in Vercel
   - Add the following environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_SITE_URL` (your Vercel deployment URL)

2. Redeploy the application after setting the environment variables

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Marvin046/dutchseedsupply.git
   cd dutchseedsupply
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase URL and anon key

4. Set up the database
   - Follow the instructions in [docs/new-database-setup.md](docs/new-database-setup.md)
   - This will create all the necessary tables and set up Row Level Security

5. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/components` - React components
  - `/layout` - Layout components (Header, Footer, etc.)
  - `/sections` - Page sections
  - `/ui` - Reusable UI components
- `/lib` - Utility functions and hooks
- `/pages` - Next.js pages
- `/public` - Static assets
  - `/locales` - Translation files
- `/styles` - Global styles
- `/supabase` - Supabase configuration and schema

## License

This project is licensed under the MIT License.
#   s e n s e b y c b d 
 
