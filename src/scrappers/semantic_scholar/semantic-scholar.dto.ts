import { z } from "zod";

// Author search DTOs
export const AuthorSchema = z.object({
  authorId: z.string(),
  name: z.string(),
});

export type AuthorDto = z.infer<typeof AuthorSchema>;

export const FindAuthorsResponseSchema = z.object({
  total: z.number(),
  offset: z.number(),
  data: z.array(AuthorSchema),
});

export type FindAuthorsResponseDto = z.infer<typeof FindAuthorsResponseSchema>;

// Paper DTOs
export const ExternalIdsSchema = z.object({
  DOI: z.string().optional().nullable(),
  CorpusId: z.number().optional().nullable(),
  PubMed: z.string().optional().nullable(),
  ArXiv: z.string().optional().nullable(),
}).passthrough(); // Allow additional fields

export type ExternalIdsDto = z.infer<typeof ExternalIdsSchema>;

export const OpenAccessPdfSchema = z.object({
  url: z.string(),
  status: z.string().nullable(),
  license: z.string().nullable(),
  disclaimer: z.string().nullable().optional(),
}).nullable();

export type OpenAccessPdfDto = z.infer<typeof OpenAccessPdfSchema>;

export const PaperAuthorSchema = z.object({
  authorId: z.string().nullish(),
  name: z.string(),
});

export type PaperAuthorDto = z.infer<typeof PaperAuthorSchema>;

export const SemanticScholarFullDataSchema = z.object({
  paperId: z.string(),
  externalIds: ExternalIdsSchema,
  title: z.string(),
  openAccessPdf: OpenAccessPdfSchema,
  fieldsOfStudy: z.array(z.string()).nullable(),
  authors: z.array(PaperAuthorSchema),
  abstract: z.string().nullable(),
});

export type SemanticScholarFullDataPaperDto = z.infer<typeof SemanticScholarFullDataSchema>;

export const FindPapersByAuthorIdResponseSchema = z.object({
  offset: z.number(),
  next: z.number().optional(),
  data: z.array(SemanticScholarFullDataSchema),
});

export type FindPapersByAuthorIdResponseDto = z.infer<typeof FindPapersByAuthorIdResponseSchema>;

// Combined response DTO for getPapersFromAuthor
export const GetPapersFromAuthorResponseSchema = z.object({
  author: AuthorSchema,
  papers: z.array(SemanticScholarFullDataSchema),
  totalPapers: z.number(),
});

export type GetPapersFromAuthorResponseDto = z.infer<typeof GetPapersFromAuthorResponseSchema>;

