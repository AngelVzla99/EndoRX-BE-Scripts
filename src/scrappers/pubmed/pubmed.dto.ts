import { z } from "zod";

export const IdSchema = z.union([z.string(), z.number()]);

export const TranslationSchema = z.object({
  From: z.string(),
  To: z.string(),
});

export const TermSetSchema = z.object({
  Term: z.string(),
  Field: z.string(),
  Count: z.union([z.string(), z.number()]),
  Explode: z.string(),
});

export const TranslationStackSchema = z.any().optional();

export const TranslationSetSchema = z.object({
  Translation: TranslationSchema,
});

export const IdListSchema = z.object({
  Id: z.union([z.array(IdSchema), IdSchema]),
});

export const ErrorListSchema = z.object({
  PhraseNotFound: z.string(),
});

export const WarningListSchema = z.object({
  OutputMessage: z.string(),
});

export const ESearchResultSchema = z.object({
  Count: z.union([z.string(), z.number()]),
  RetMax: z.union([z.string(), z.number()]),
  RetStart: z.union([z.string(), z.number()]),
  IdList: z.union([IdListSchema, z.string()]),
  TranslationSet: z.union([TranslationSetSchema, z.string()]).optional(),
  TranslationStack: TranslationStackSchema.optional(),
  QueryTranslation: z.string(),
  ErrorList: ErrorListSchema.optional(),
  WarningList: WarningListSchema.optional(),
});

export const PubMedSearchResponseSchema = z.object({
  eSearchResult: ESearchResultSchema,
});

export type PubMedSearchResponseDto = z.infer<typeof PubMedSearchResponseSchema>;
export type ESearchResultDto = z.infer<typeof ESearchResultSchema>;
export type IdListDto = z.infer<typeof IdListSchema>;

export const GetAuthorPaperIdsResponseSchema = z.array(z.string());

export type GetAuthorPaperIdsResponseDto = z.infer<typeof GetAuthorPaperIdsResponseSchema>;

export const ArticleIdSchema = z.object({
  "@_pub-id-type": z.string(),
  "#text": z.union([z.string(), z.number()]),
});

export const GivenNamesSchema = z.union([
  z.string(),
  z.object({
    "#text": z.string().optional(),
  }).passthrough(),
]);

export const NameSchema = z.object({
  surname: z.string(),
  "given-names": GivenNamesSchema.optional(),
});

export const ContribSchema = z.object({
  "@_contrib-type": z.string(),
  name: NameSchema.optional(),
}).passthrough();

export const ContribGroupSchema = z.object({
  contrib: z.union([z.array(ContribSchema), ContribSchema]),
});

export const PubDateSchema = z.object({
  "@_pub-type": z.string().optional(),
  day: z.union([z.string(), z.number()]).optional(),
  month: z.union([z.string(), z.number()]).optional(),
  year: z.union([z.string(), z.number()]).optional(),
}).passthrough();

export const TitleGroupSchema = z.object({
  "article-title": z.union([z.string(), z.any()]),
});

export const KeywordItemSchema = z.union([
  z.string(),
  z.object({}).passthrough(),
]);

export const KeywordSchema = z.object({
  kwd: z.union([z.array(KeywordItemSchema), KeywordItemSchema]),
});

export const ArticleMetaSchema = z.object({
  "article-id": z.union([z.array(ArticleIdSchema), ArticleIdSchema]),
  "title-group": TitleGroupSchema,
  "contrib-group": z.union([z.array(ContribGroupSchema), ContribGroupSchema]).optional(),
  "pub-date": z.union([z.array(PubDateSchema), PubDateSchema]).optional(),
  "kwd-group": z.union([z.array(KeywordSchema), KeywordSchema]).optional(),
}).passthrough();

export const FrontSchema = z.object({
  "article-meta": ArticleMetaSchema,
});

export const ArticleSchema = z.object({
  front: FrontSchema,
}).passthrough();

export const PmcArticleSetSchema = z.object({
  article: z.union([z.array(ArticleSchema), ArticleSchema]).optional(),
});

export const PubMedFetchResponseSchema = z.object({
  "pmc-articleset": PmcArticleSetSchema,
});

export type PubMedFetchResponseDto = z.infer<typeof PubMedFetchResponseSchema>;
export type ArticleDto = z.infer<typeof ArticleSchema>;
export type ArticleMetaDto = z.infer<typeof ArticleMetaSchema>;
export type ContribDto = z.infer<typeof ContribSchema>;
export type PubDateDto = z.infer<typeof PubDateSchema>;

export const PubMedPaperSchema = z.object({
  pmcid: z.string().optional(),
  pmid: z.string().optional(),
  doi: z.string().optional(),
  title: z.string(),
  authors: z.array(z.object({
    surname: z.string(),
    givenNames: z.string().optional(),
  })),
  publicationDate: z.object({
    year: z.string(),
    month: z.string().optional(),
    day: z.string().optional(),
  }).optional(),
  keywords: z.array(z.string()).optional(),
});

export type PubMedPaperDto = z.infer<typeof PubMedPaperSchema>;

export const GetPapersByIdsResponseSchema = z.array(PubMedPaperSchema);

export type GetPapersByIdsResponseDto = z.infer<typeof GetPapersByIdsResponseSchema>;

// ==========================================================================

export const ELocationIdSchema = z.object({
  "#text": z.union([z.string(), z.number()]),
  "@_EIdType": z.string(),
  "@_ValidYN": z.string().optional(),
});

export const MedlineCitationSchema = z.object({
  ArticleTitle: z.union([z.string(), z.object()]),
  ELocationID: z.union([z.array(ELocationIdSchema), ELocationIdSchema]).optional(),
});

export const PubMedArticleSchema = z.object({
  Article: MedlineCitationSchema.optional(),
});

export const PubMedMedclineArticleSchema = z.object({
  MedlineCitation: PubMedArticleSchema,
});

export const PubMedArticleSetSchema = z.object({
  PubmedArticle: z.array(PubMedMedclineArticleSchema).optional(),
});

export const PubMedDatabaseFetchResponseSchema = z.object({
  PubmedArticleSet: PubMedArticleSetSchema,
});

export type PubMedDatabaseFetchResponseDto = z.infer<typeof PubMedDatabaseFetchResponseSchema>;
export type PubMedArticleDto = z.infer<typeof PubMedArticleSchema>;
export type MedlineCitationDto = z.infer<typeof MedlineCitationSchema>;
export type ELocationIdDto = z.infer<typeof ELocationIdSchema>;

// ==========================================================================

// export const XRefSchema = z.object({
//   "#text": z.any().optional(), // z.union([z.string(), z.number()]),
//   "@_ref-type": z.string(),
//   "@_rid": z.string(),
// });

export const ParagraphSchema = z.object({
  "#text": z.any(),//z.union([z.string(), z.number()]).optional(),
  // xref: z.union([z.array(XRefSchema), XRefSchema]).optional(),
  // "@_id": z.string().optional(),
});

export const SectionSchema = z.object({
  // title: z.union([z.string(), z.any()]).optional(),
  p: z.union([z.array(z.union([ParagraphSchema, z.string()])), ParagraphSchema, z.string()]).optional(),
  sec: z.union([z.array(z.lazy(() => SectionSchema)), z.lazy(() => SectionSchema)]).optional(),
  // "@_id": z.string().optional(),
}) as any;

export const PubMedFetchArticleBodySectionSchema = z.object({
  sec: z.union([z.array(SectionSchema), SectionSchema]).optional(),
});

export const PubMedFetchArticleBodySchema = z.object({
  front: FrontSchema,
  body: PubMedFetchArticleBodySectionSchema.optional(),
});

export const PubMedFetchArticlesBodySchema = z.object({
  article: z.union([z.array(PubMedFetchArticleBodySchema), PubMedFetchArticleBodySchema]).optional(),
});

export const PubMedFetchBodiesResponseSchema = z.object({
  "pmc-articleset": PubMedFetchArticlesBodySchema,
});

export type PubMedFetchBodiesResponseDto = z.infer<typeof PubMedFetchBodiesResponseSchema>;
// export type XRefDto = z.infer<typeof XRefSchema>;
export type ParagraphDto = z.infer<typeof ParagraphSchema>;
export type SectionDto = z.infer<typeof SectionSchema>;
export type PubMedFetchArticleBodyDto = z.infer<typeof PubMedFetchArticleBodySchema>;

export const PaperBodyWithIdsSchema = z.object({
  body: z.string(),
  pmid: z.string().optional(),
  pmcid: z.string().optional(),
  doi: z.string().optional(),
});

export type PaperBodyWithIdsDto = z.infer<typeof PaperBodyWithIdsSchema>;

export const GetPapersBodiesResponseSchema = z.array(PaperBodyWithIdsSchema);

export type GetPapersBodiesResponseDto = z.infer<typeof GetPapersBodiesResponseSchema>;