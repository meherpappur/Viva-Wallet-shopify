export const ORDERS_QUERY = `
  query GetOrders(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $query: String
  ) {
    orders(
      first: $first
      last: $last
      after: $after
      before: $before
      query: $query
      sortKey: CREATED_AT
      reverse: true
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          name
          createdAt
          displayFinancialStatus
          sourceName

          customAttributes {
            key
            value
          }

          transactions {
            kind
            status
            gateway
           amountSet {
            shopMoney {
              amount        
              currencyCode
            }
          } 
          }

          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }

          customer {
            displayName
          }

          payment_verified: metafield(namespace: "custom", key: "payment_verified") {
            id
            value
          }

          verified_by: metafield(namespace: "custom", key: "payment_verified_by") {
            id
            value
            updatedAt
          }

          shippingAddress{
            company
          }
        }
      }
    }
  }
`;
export const UPDATE_METAFIELD_MUTATION = `
  mutation UpdateOrderMetafield($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        value
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;
export const DELETE_METAFIELD_MUTATION = `
  mutation DeleteOrderMetafield($metafields: [MetafieldIdentifierInput!]!) {
    metafieldsDelete(metafields: $metafields) {
      deletedMetafields {
        namespace
        key
        ownerId
      }
      userErrors {
        field
        message
      }
    }
  }
`;