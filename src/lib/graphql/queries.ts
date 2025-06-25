import { gql } from '@apollo/client';

export const GET_ALL_CASES = gql`
  query GetAllCases {
    GetAllCases {
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

export const SEARCH_CASES = gql`
  query SearchCases($id: String!) {
    SearchCases(id: $id) {
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
  }
`;

export const GET_CASES_BY_DATE_RANGE = gql`
  query GetCasesByDateRange($startDate: String!, $endDate: String!) {
    GetCasesByDateRange(startDate: $startDate, endDate: $endDate) {
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
  }
`;
