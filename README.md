# Flora Accessories

A modern e-commerce platform for jewelry built with Next.js, featuring rings, necklaces, earrings, bracelets, and curated packs.

## Features

- **Product Catalog** - Browse rings, necklaces, earrings, bracelets, and special packs
- **User Authentication** - Sign up, sign in, password reset, and profile management
- **Shopping Cart** - Add items, manage quantities, and proceed to checkout
- **Favorites** - Save items for later
- **Search** - Find products quickly
- **Management Dashboard** - Manage products, inventory, orders, and view profit analytics
- **Responsive Design** - Works seamlessly on mobile and desktop
- **Internationalization** - Multi-language support
- **AI Integration** - AI-powered features for enhanced user experience

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Database**: [Prisma](https://prisma.io) with [Neon PostgreSQL](https://neon.tech)
- **Authentication**: [Better Auth](https://better-auth.com)
- **File Uploads**: [UploadThing](https://uploadthing.com)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **UI Components**: [Radix UI](https://radix-ui.com)
- **Forms**: [React Hook Form](https://react-hook-form.com) with Zod validation
- **AI**: [AI SDK](https://sdk.vercel.ai) with OpenAI
- **Email**: [Nodemailer](https://nodemailer.com)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon recommended)
- UploadThing account
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd flora
```

1. Install dependencies:

```bash
npm install
```

1. Configure environment variables:

```bash
cp .env.example .env
```

Fill in the required environment variables:

- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `UPLOADTHING_TOKEN` - Your UploadThing token
- `BETTER_AUTH_SECRET` - Secret for authentication (generate with `npx better-auth secret`)
- `NEXT_PUBLIC_APP_URL` - The base URL of your application (e.g., <http://localhost:3000>)
- `OPENROUTER_API_KEY` - For AI product description enhancement
- `SMTP_USER` & `GMAIL_APP_PASSWORD` - For email notifications via Gmail
- `EMAIL_FROM` - The sender email address

1. Set up the database:

```bash
npx prisma migrate dev
npx prisma generate
```

1. Run the development server:

```bash
npm run dev
```

Open <http://localhost:3000> with your browser.

## Deployment

### 1. Database Setup (Neon)

- Create a new project on [Neon](https://neon.tech)
- Enable "Pooling" in the Neon console
- Copy the connection string to your environment variables

### 2. UploadThing Setup

- Create an account on [Uploadthing](https://uploadthing.com)
- Copy your `UPLOADTHING_TOKEN` to environment variables

### 3. Deploy to Vercel

- Push your code to GitHub
- Import the repository in [Vercel](https://vercel.com)
- Add all required environment variables
- The build will automatically run `prisma generate` via the `postinstall` script
- After the first deployment, run migrations:

```bash
npx prisma migrate deploy
```

## Project Structure

```text
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Management dashboard routes
│   ├── api/               # API routes
│   ├── shop/              # Product pages
│   └── ...
├── components/            # React components
│   ├── management/        # Dashboard-specific components
│   └── ui/               # UI components
├── lib/                   # Utility functions and configurations
│   ├── auth.ts           # Authentication config
│   ├── db.ts             # Database client
│   └── ...
├── prisma/               # Database schema
├── public/               # Static assets
└── i18n/                 # Internationalization
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable              | Description                            |
| --------------------- | -------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string           |
| `UPLOADTHING_TOKEN`   | UploadThing API token                  |
| `BETTER_AUTH_SECRET`  | Secret for Better Auth                 |
| `NEXT_PUBLIC_APP_URL` | Base URL of the application            |
| `OPENROUTER_API_KEY`  | OpenRouter API key for AI features     |
| `SMTP_USER`           | SMTP username (Gmail address)          |
| `GMAIL_APP_PASSWORD`  | App-specific password for Gmail        |
| `EMAIL_FROM`          | Sender email address for notifications |
| `CRON_SECRET`         | Security key for cron jobs             |

## Contributing

This is a private project. Contributions are not accepted at this time.

## License

© 2026 Flora Accessories. All Rights Reserved.

This source code is provided for viewing purposes only. Unauthorized use, modification, or distribution is prohibited.
