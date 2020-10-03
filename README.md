# Next With Apollo HOC APP SSR Example

### Refrance issues

- [next#10126 | AppTree is not updated client side
  ](https://github.com/vercel/next.js/issues/10126)
- [next#9336 | \<AppTree /> is incorrect](https://github.com/vercel/next.js/issues/9336)
- [next#9350 | next 9.1.3 withRouter passes router=null on SSR](https://github.com/vercel/next.js/issues/9350#issuecomment-552241283)

### Problem

Apollo client context is [singleton ](https://github.com/apollographql/apollo-client/blob/aa338ff73199bffcc181c21f8c2754473ed49e30/src/react/context/ApolloContext.ts#L22-L29) (single Apollo context is created and tracked in global state).
and when we use more then one `ApolloProvider` we [overide client instance](https://github.com/apollographql/apollo-client/blob/aa338ff73199bffcc181c21f8c2754473ed49e30/src/react/context/ApolloProvider.tsx#L20-L22) with most inner `ApolloProvider` client

So when we create HOC APP to get apollo client initial cache state by using `getDataFromTree` by using server side client and then extract cache like this

```js
function withApollo(WrappedApp) {
  const WithApollo = ({ apolloState, ...props }) => {
    const apolloClient = React.useMemo(() => initApollo(apolloState), []);
    return (
      <ApolloProvider client={apolloClient}>
        <WrappedApp {...props} />
      </ApolloProvider>
    );
  };
  WithApollo.getInitialProps = async () => {
    const apolloClient = initApollo({});
    // ...

    // only on server
    await getDataFromTree(
      <ApolloProvider client={apolloClient}>
        <AppTree {...appProps} />
      </ApolloProvider>
    );
    const apolloState = apolloClient.cache.extract();
    // ...
    return {
      // ...
      apolloState,
    };
  };

  return WithApollo;
}
```

on first render in `getDataFromTree` on server `getInitialProps` the `apolloClient` is not used.. the second client in `WithApollo` Component will overide it so when extract cache ` apolloClient.cache.extract()` we get empty result because we extract overwritten client

### Solution

`AppTree` provided by next js meant to provide right context (router, head manager, amp, ...)

And for HOC we have app that we want to wrap in this contexts, so we should be able to provide app to wrap not use entry point app.

https://github.com/vercel/next.js/compare/canary...mhhegazy:app-tree?diff=split#diff-b05baef443407a6b8c271f0afe838de1R513

So we can have one ApolloContext in first Render

so to fix example in problem we do this in `getInitialProps`:

```js
// ...
await getDataFromTree(
  <ApolloProvider client={apolloClient}>
    <AppTree WrapApp={WrappedApp} {...appProps} />
  </ApolloProvider>
);
// ...
```

then we have only one `ApolloProvider` on first render and there is no inner one that overwrite it
