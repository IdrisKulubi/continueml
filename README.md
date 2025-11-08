# continueml MVP

An AI memory system that enables creators to build consistent worlds across multiple AI-generated content pieces.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL (Neon DB) with Drizzle ORM
- **Authentication**: Better Auth
- **Vector Storage**: Pinecone
- **Object Storage**: Cloudflare R2
- **AI APIs**: OpenAI, Replicate (CLIP)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (Neon DB recommended)
- API keys for OpenAI, Pinecone, Replicate, and Cloudflare R2

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Copy `.env.example` to `.env.local` and fill in your environment variables:

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Project Structure

```
src/
â”œâ”€â”€ app/              # Next.js App Router pages
â”œâ”€â”€ components/       # React components
â”‚   â”œâ”€â”€ ui/          # shadcn/ui components
â”‚   â””â”€â”€ themes/      # Theme components
â”œâ”€â”€ lib/             # Utility functions and services
â”œâ”€â”€ hooks/           # Custom React hooks
â””â”€â”€ types/           # TypeScript type definitions
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
