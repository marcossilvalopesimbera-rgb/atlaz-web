export type KnowledgeConceptKind = 'concept' | 'framework' | 'component' | 'domain' | 'investigation' | 'evidence' | 'hypothesis' | 'decision';

export interface KnowledgeConcept {
  id: string;
  slug: string;
  title: string;
  kind: KnowledgeConceptKind;
  summary: string;
  description: string;
  relatedConceptIds: string[];
  frameworkIds: string[];
  domainIds: string[];
  references: string[];
}

export interface GlossaryTerm {
  id: string;
  slug: string;
  term: string;
  definition: string;
  shortDescription: string;
  fullDescription: string;
  usageContext: string;
  relatedTerms: string[];
  synonyms: string[];
  deprecatedTerms: string[];
}

export interface KnowledgeCenterCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  featuredConceptIds: string[];
}
