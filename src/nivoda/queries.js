export const DIAMONDS_BY_QUERY = `
  query DiamondsByQuery($query: DiamondQuery!, $offset: Int!, $limit: Int!, $order: DiamondOrder!) {
    diamonds_by_query(query: $query, offset: $offset, limit: $limit, order: $order) {
      total_count
      items {
        id
        price
        markup_price
        diamond {
          id
          image
          video
          v360 {
            url
            frame_count
            top_index
            renumbered
          }
          availability
          certificate {
            carats
            shape
            color
            clarity
            cut
            lab
            labgrown
            certNumber
            labgrown_type
            polish
            symmetry
            floInt
            table
            depthPercentage
            length
            width
            depth
            pdfUrl
          }
        }
      }
    }
  }
`;
