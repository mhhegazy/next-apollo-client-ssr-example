import * as React from "react";
import { ApolloProvider } from "@apollo/client";
import { getDataFromTree } from "@apollo/client/react/ssr";
import Head from "next/head";
import initApollo from "./initApollo";
import { isBrowser } from "./isBrowser";

export const withApollo = (WrappedApp) => {
  const WithApollo = (props) => {
    const apolloClient = React.useMemo(() => initApollo(props.apolloState), []);
    return (
      <ApolloProvider client={apolloClient}>
        <WrappedApp {...props} />
      </ApolloProvider>
    );
  };

  WithApollo.getInitialProps = async (appContext: any) => {
    const {
      AppTree,
      ctx: { res },
    } = appContext;
    const apolloClient = initApollo({});
    appContext.ctx.apolloClient = apolloClient;

    let appProps = {};
    if (WrappedApp.getInitialProps) {
      appProps = await WrappedApp.getInitialProps(appContext);
    }

    if (res && res.finished) {
      return {};
    }

    if (!isBrowser) {
      // Run all graphql queries in the component tree
      // and extract the resulting data
      try {
        // In get data from tree we want to preserve our client in context
        // so we don't want render <ApolloProvider> with new client it will
        // replace client with new one
        await getDataFromTree(<AppTree WrapApp={WrappedApp} {...appProps} />, {
          client: apolloClient,
        });
      } catch (error) {
        console.error("Error while running `getDataFromTree`", error);
      }
      // getDataFromTree does not call componentWillUnmount
      // head side effect therefore need to be cleared manually
      Head.rewind();
    }

    // Extract query data from the Apollo's store
    const apolloState = apolloClient.cache.extract();

    return {
      ...appProps,
      apolloState,
    };
  };

  WithApollo.displayName = `withApollo(${WrappedApp.displayName})`;

  return WithApollo;
};
