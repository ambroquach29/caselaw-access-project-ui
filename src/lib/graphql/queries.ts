import { gql } from '@apollo/client';

// Case Queries with Pagination
export const GET_ALL_CASES = gql`
  query GetAllCases($first: Int, $after: String) {
    GetAllCases(first: $first, after: $after) {
      edges {
        node {
          id
          name
          name_abbreviation
          decision_date
          docket_number
          court {
            id
            name_abbreviation
            name
          }
          jurisdiction {
            id
            name_long
            name
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_CASES_BY_COURT = gql`
  query GetCasesByCourt($court: String!, $first: Int, $after: String) {
    GetCasesByCourt(court: $court, first: $first, after: $after) {
      edges {
        node {
          id
          name
          name_abbreviation
          decision_date
          docket_number
          court {
            id
            name_abbreviation
            name
          }
          jurisdiction {
            id
            name_long
            name
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_CASES_BY_JURISDICTION = gql`
  query GetCasesByJurisdiction(
    $jurisdiction: String!
    $year: Int
    $first: Int
    $after: String
  ) {
    GetCasesByJurisdiction(
      jurisdiction: $jurisdiction
      year: $year
      first: $first
      after: $after
    ) {
      edges {
        node {
          id
          name
          name_abbreviation
          decision_date
          docket_number
          court {
            id
            name_abbreviation
            name
          }
          jurisdiction {
            id
            name_long
            name
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_CASE_BY_ID = gql`
  query GetCaseById($id: ID!) {
    GetCaseById(id: $id) {
      id
      name
      name_abbreviation
      decision_date
      docket_number
      first_page
      last_page
      citations {
        type
        cite
      }
      court {
        id
        name_abbreviation
        name
      }
      jurisdiction {
        id
        name_long
        name
      }
      cites_to {
        cite
        category
        reporter
        case_ids
        opinion_index
        case_paths
        weight
        pin_cites {
          page
        }
        year
      }
      analysis {
        cardinality
        char_count
        ocr_confidence
        pagerank {
          raw
          percentile
        }
        sha256
        simhash
        word_count
      }
      last_updated
      provenance {
        date_added
        source
        batch
      }
      casebody {
        judges
        parties
        opinions {
          text
          type
          author
        }
        attorneys
        corrections
        head_matter
      }
      file_name
      first_page_order
      last_page_order
    }
  }
`;

export const GET_CASES_BY_DATE_RANGE = gql`
  query GetCasesByDateRange(
    $startDate: String!
    $endDate: String!
    $first: Int
    $after: String
  ) {
    GetCasesByDateRange(
      startDate: $startDate
      endDate: $endDate
      first: $first
      after: $after
    ) {
      edges {
        node {
          id
          name
          name_abbreviation
          decision_date
          docket_number
          court {
            name
            name_abbreviation
          }
          jurisdiction {
            name
            name_long
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const SEARCH_CASES = gql`
  query SearchCases(
    $searchText: String!
    $jurisdiction: String
    $year: Int
    $first: Int
    $after: String
  ) {
    SearchCases(
      searchText: $searchText
      jurisdiction: $jurisdiction
      year: $year
      first: $first
      after: $after
    ) {
      edges {
        node {
          id
          name
          name_abbreviation
          decision_date
          docket_number
          court {
            id
            name
            name_abbreviation
          }
          jurisdiction {
            id
            name
            name_long
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const SEMANTIC_SEARCH_CASES = gql`
  query SemanticSearchCases($searchText: String!, $jurisdiction: String) {
    SemanticSearchCases(searchText: $searchText, jurisdiction: $jurisdiction) {
      id
      name
      name_abbreviation
      decision_date
      docket_number
      court {
        id
        name
        name_abbreviation
      }
      jurisdiction {
        id
        name
        name_long
      }
    }
  }
`;

// Court Queries
export const GET_ALL_COURTS = gql`
  query GetAllCourts {
    GetAllCourts {
      id
      name
      name_abbreviation
    }
  }
`;

// Jurisdiction Queries
export const GET_ALL_JURISDICTIONS = gql`
  query GetAllJurisdictions {
    GetAllJurisdictions {
      id
      name
      name_long
    }
  }
`;
