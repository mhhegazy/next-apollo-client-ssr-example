import * as React from "react";
import App from "../components/App";
import InfoBox from "../components/InfoBox";
import Header from "../components/Header";
import Submit from "../components/Submit";
import PostList from "../components/PostList";

const IndexPage = () => (
  <App>
    <Header />
    <InfoBox>
      ℹ️ This App shows how to use SSR with Apollo Client HOC APP.
    </InfoBox>
    <Submit />
    <PostList />
  </App>
);

export default IndexPage;
