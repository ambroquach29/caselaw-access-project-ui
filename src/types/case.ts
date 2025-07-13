export interface Citation {
  type: string;
  cite: string;
}

export interface Court {
  id: string;
  name_abbreviation: string;
  name: string;
}

export interface Jurisdiction {
  id: string;
  name_long: string;
  name: string;
}

export interface PinCites {
  page: string;
}

export interface CitesTo {
  cite: string;
  category: string;
  reporter: string;
  case_ids?: string[];
  opinion_index: number;
  case_paths?: string[];
  weight?: number;
  pin_cites?: PinCites[];
  year?: number;
}

export interface PageRank {
  raw: number;
  percentile: number;
}

export interface Analysis {
  cardinality: number;
  char_count: number;
  ocr_confidence: number;
  pagerank: PageRank;
  sha256: string;
  simhash: string;
  word_count: number;
}

export interface Provenance {
  date_added: string;
  source: string;
  batch: string;
}

export interface Opinion {
  text: string;
  type: string;
  author: string;
}

export interface CaseBody {
  judges: string[];
  parties: string[];
  opinions: Opinion[];
  attorneys: string[];
  corrections: string;
  head_matter: string;
}

export interface Case {
  id: string;
  name: string;
  name_abbreviation: string;
  decision_date: string;
  docket_number: string;
  first_page: string;
  last_page: string;
  citations: Citation[];
  court: Court;
  jurisdiction: Jurisdiction;
  cites_to: CitesTo[];
  analysis: Analysis;
  last_updated: string;
  provenance: Provenance;
  casebody: CaseBody;
  file_name: string;
  first_page_order: number;
  last_page_order: number;
}

export interface CaseSearchResult {
  id: string;
  name: string;
  name_abbreviation: string;
  decision_date: string;
  docket_number: string;
  court: Court;
  jurisdiction: Jurisdiction;
}

// Pagination types
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface CaseEdge {
  node: Case;
  cursor: string;
}

export interface CaseConnection {
  edges: CaseEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface PaginationArgs {
  first?: number;
  after?: string;
}
