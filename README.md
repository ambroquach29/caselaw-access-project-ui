# Case Law Access Project - Frontend

A modern, responsive web application for browsing and searching case law data, built with Next.js, Apollo Client, and Tailwind CSS.

## Features

- **📚 Comprehensive Case Display**: View detailed case information including opinions, citations, parties, and metadata
- **🔍 Advanced Search**: Search cases by name, abbreviation, or docket number
- **🔐 Dual Authorization**: API authorization token + user authentication with automatic header injection
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **⚡ Real-time Data**: Connected to GraphQL API for live data updates
- **🎨 Modern UI**: Clean, professional interface with intuitive navigation

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **GraphQL Client**: Apollo Client with auth link
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **Date Handling**: date-fns
- **Authentication**: JWT tokens with localStorage + API authorization

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend GraphQL API running on `http://localhost:5001`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── case/[id]/         # Dynamic case detail pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with Apollo Provider
│   └── page.tsx           # Home page with case list and auth
├── components/            # React components
│   ├── ApolloProvider.tsx # Apollo Client provider
│   ├── AuthStatus.tsx     # Authorization status display
│   ├── CaseList.tsx       # Case list with search
│   ├── CaseDetail.tsx     # Detailed case view
│   └── LoginForm.tsx      # Authentication form
├── lib/                   # Utilities and configurations
│   ├── apollo-client.ts   # Apollo Client setup with dual auth
│   ├── auth.ts            # Authentication utilities
│   ├── graphql/           # GraphQL queries
│   │   └── queries.ts     # All GraphQL queries
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript type definitions
    └── case.ts            # Case-related types
```

## Components

### CaseList

- Displays a grid of cases with search functionality
- Shows case metadata (date, court, jurisdiction)
- Responsive design with loading states
- Search by name, abbreviation, or docket number

### CaseDetail

- Comprehensive case information display
- Opinions with proper formatting
- Citations and references
- Analysis metadata
- Parties and attorneys
- Responsive sidebar layout

### LoginForm

- JWT token-based user authentication
- Mock login for testing (replace with real auth endpoint)
- Automatic token storage in localStorage
- Logout functionality

### AuthStatus

- Real-time display of both authorization types
- API authorization token status
- User authentication token status
- User information display

## Authentication & Authorization

The application uses a dual-token system:

### 1. API Authorization Token (Static)

- **Purpose**: Authenticates the frontend application to the API
- **Token**: `apollo-caselaw-api`
- **Header**: `Authorization: apollo-caselaw-api`
- **Scope**: Application-level access to the GraphQL API

### 2. User Authentication Token (Dynamic)

- **Purpose**: Identifies and authorizes individual users
- **Token**: JWT token from user login
- **Header**: `User-Authorization: Bearer <jwt-token>`
- **Scope**: User-specific permissions and data access

### Features

- **Dual Token Management**: Both API and user tokens handled automatically
- **Automatic Header Injection**: All GraphQL requests include both tokens
- **Persistent Sessions**: User tokens stored in localStorage
- **Auth State Management**: React hooks for auth state
- **Token Validation**: Automatic token validation on app start

### Usage

```typescript
import { useAuth } from '@/lib/auth';

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();

  // Check authentication status
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <div>Welcome, {user?.name}!</div>;
}
```

### API Integration

The frontend automatically includes both authorization headers in all GraphQL requests:

```typescript
// Headers automatically added to all requests:
{
  'Content-Type': 'application/json',
  'Authorization': 'apollo-starter-kit',           // API auth token
  'User-Authorization': 'Bearer your-jwt-token'    // User auth token
}
```

## GraphQL Integration

The frontend connects to the backend GraphQL API at `http://localhost:4000/graphql` and includes:

- **Queries**:

  - `GetAllCases`: Fetch all cases
  - `GetCaseById`: Get detailed case information
  - `SearchCases`: Search cases by query
  - `GetCasesByDateRange`: Filter by date range

- **Features**:
  - Real-time data fetching
  - Error handling
  - Loading states
  - Optimistic updates
  - **Dual authorization headers** on all requests

## Styling

The application uses Tailwind CSS v4 with:

- **Custom Utilities**: Line clamping, prose styling
- **Responsive Design**: Mobile-first approach
- **Component Classes**: Reusable styling patterns
- **Dark Mode Support**: Automatic theme switching

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Component-based architecture

## API Integration

The frontend expects the backend GraphQL API to provide:

- Case data with all metadata
- Search functionality
- Pagination support
- Error handling
- **Dual token validation** (API + User)

### Environment Variables

No environment variables are required for local development as the GraphQL endpoint is hardcoded to `http://localhost:4000/graphql`.

## Testing Authentication

1. **Start the application**: `npm run dev`
2. **Check API auth**: AuthStatus shows API authorization token
3. **Login user**: Use the login form with any email and password
4. **Verify both tokens**: AuthStatus shows both API and user tokens
5. **Check headers**: All GraphQL requests include both authorization headers
6. **Test logout**: Click logout to clear the user token

## Deployment

The application can be deployed to:

- **Vercel**: Optimized for Next.js
- **Netlify**: Static site hosting
- **Docker**: Containerized deployment

### Build Output

The build process generates:

- Static HTML/CSS/JS files
- Optimized images and assets
- Service worker for caching

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
