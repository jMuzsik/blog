// @flow
import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import Page from '../components/Page';
import { useSiteMetadata } from '../hooks';
import type { MarkdownRemark } from '../types';

type Props = {
  data: {
    markdownRemark: MarkdownRemark
  }
};

const PageTemplate = ({ data }: Props) => {
  const { title: siteTitle, subtitle: siteSubtitle } = useSiteMetadata();
  const { html: pageBody } = data.markdownRemark;
  const {
    title: pageTitle,
    description: pageDescription
  } = data.markdownRemark.frontmatter;
  const metaDescription =
    pageDescription !== null ? pageDescription : siteSubtitle;

  return (
    <React.Fragment>
      <Layout
        title={`${pageTitle} - ${siteTitle}`}
        description={metaDescription}
      >
        <Navbar />
        <Page title={pageTitle}>
          <div dangerouslySetInnerHTML={{ __html: pageBody }} />
        </Page>
      </Layout>
    </React.Fragment>
  );
};

export const query = graphql`
  query PageBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      frontmatter {
        title
        date
        description
      }
    }
  }
`;

export default PageTemplate;
