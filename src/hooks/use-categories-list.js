// @flow
import { useStaticQuery, graphql } from 'gatsby';

const useCategoriesList = () => {
  const { allMarkdownRemark } = useStaticQuery(
    graphql`
      query CategoriesListQuery {
        allMarkdownRemark(
          filter: {
            frontmatter: { template: { eq: "post" }, draft: { eq: false } }
          }
        ) {
          group(field: frontmatter___category) {
            fieldValue
            totalCount
            edges {
              node {
                frontmatter {
                  image
                  alt
                }
              }
            }
          }
        }
      }
    `
  );
  return allMarkdownRemark.group;
};

export default useCategoriesList;
