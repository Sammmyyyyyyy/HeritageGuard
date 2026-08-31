
import { queryHeritageRAG } from './sites';

export interface RAGQueryRequest {
  site_id: string;
  question: string;
  language?: string;
}

export async function queryHeritage(
  data: RAGQueryRequest
) {
  return queryHeritageRAG(data);
}