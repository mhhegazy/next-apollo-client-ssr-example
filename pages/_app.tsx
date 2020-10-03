import { withApollo } from "../lib/apollo";

const App = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default withApollo(App);
