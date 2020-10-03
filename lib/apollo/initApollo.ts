import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { createHttpLink } from "@apollo/client";
import { concatPagination } from "@apollo/client/utilities";
import fetch from "isomorphic-unfetch";
import { isBrowser } from "./isBrowser";

// store client for browser only
let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

// Polyfill fetch() on the server (used by apollo-client)
if (!isBrowser) {
  (global as any).fetch = fetch;
}

function create(initialState: any) {
  const httpLink = createHttpLink({
    uri: "https://nextjs-graphql-with-prisma-simple.vercel.app/api", // Server URL (must be absolute)
    credentials: "same-origin", // Additional fetch() options like `credentials` or `headers`
  });

  return new ApolloClient({
    connectToDevTools: isBrowser,
    ssrMode: !isBrowser, // Disables forceFetch on the server (so queries are only run once)
    link: httpLink,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            allPosts: concatPagination(),
          },
        },
      },
    }).restore(initialState || {}),
  });
}

export default function initApollo(initialState: any) {
  // create a new client for every server-side request
  if (!isBrowser) {
    return create(initialState);
  }

  // reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState);
  }
  return apolloClient;
}
