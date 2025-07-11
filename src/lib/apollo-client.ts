import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:5001/graphql',
  headers: {
    Authorization: 'apollo-caselaw-api', // API authorization token (static)
    'Content-Type': 'application/json',
  },
});

// Auth link to add user authentication token (dynamic)
const authLink = setContext((_, { headers }) => {
  // Get the user authentication token from localStorage if it exists
  const userToken =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      // Add user token as a separate header if it exists
      ...(userToken && { 'User-Authorization': `Bearer ${userToken}` }),
    },
  };
});

export const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// Helper function to set user auth token
export const setAuthToken = (token: string | null) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
    // Reset the Apollo Client store to refetch queries with new auth
    client.resetStore();
  }
};

// Helper function to get user auth token
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Helper function to clear user auth token
export const clearAuthToken = () => {
  setAuthToken(null);
};

// Helper function to get all auth headers for manual requests
export const getAuthHeaders = (): Record<string, string> => {
  const userToken = getAuthToken();
  return {
    'Content-Type': 'application/json',
    Authorization: 'apollo-starter-kit', // API authorization token
    ...(userToken && { 'User-Authorization': `Bearer ${userToken}` }), // User auth token
  };
};
