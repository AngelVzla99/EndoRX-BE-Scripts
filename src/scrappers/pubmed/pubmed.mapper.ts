import { CreateResearchPaperDto } from "../../research_paper/research_paper.dto.js";
import {
  ArticleDto,
  PubMedPaperDto,
  ContribDto,
  PubDateDto,
  ArticleIdSchema,
  MedlineCitationDto,
  GetPapersByIdsResponseDto,
  ELocationIdDto,
  PubMedFetchArticleBodyDto,
  SectionDto,
  ParagraphDto,
  PaperBodyWithIdsDto,
} from "./pubmed.dto.js";

export function mapArticleToPubMedPaper(article: ArticleDto): PubMedPaperDto {
  const articleMeta = article.front["article-meta"];
  
  const articleIds = Array.isArray(articleMeta["article-id"]) 
    ? articleMeta["article-id"] 
    : [articleMeta["article-id"]];

  const pmcidObj = articleIds.find(id => id["@_pub-id-type"] === "pmcid");
  const pmcid = pmcidObj ? pmcidObj["#text"]?.toString() : undefined;
  
  const pmidObj = articleIds.find(id => id["@_pub-id-type"] === "pmid");
  const pmid = pmidObj ? pmidObj["#text"]?.toString() : undefined;
  
  const doiObj = articleIds.find(id => id["@_pub-id-type"] === "doi");
  const doi = doiObj ? doiObj["#text"]?.toString() : undefined;

  const articleTitle = articleMeta["title-group"]["article-title"];
  const title = typeof articleTitle === "string" 
    ? articleTitle 
    : typeof articleTitle === "object" && articleTitle !== null
      ? (articleTitle as any)["#text"] || JSON.stringify(articleTitle)
      : "Untitled";

  const contribGroup = articleMeta["contrib-group"];
  const contribGroupArray = contribGroup
    ? Array.isArray(contribGroup)
      ? contribGroup
      : [contribGroup]
    : [];

  const allContribs = contribGroupArray.flatMap(group => {
    return Array.isArray(group.contrib) ? group.contrib : [group.contrib];
  });

  const authors = allContribs
    .filter((contrib: ContribDto) => 
      contrib["@_contrib-type"] === "author" && contrib.name !== undefined
    )
    .map((contrib: ContribDto) => {
      const name = contrib.name!;
      const givenNamesField = name["given-names"];
      const givenNames = typeof givenNamesField === "string" 
        ? givenNamesField 
        : typeof givenNamesField === "object" && givenNamesField !== null
          ? (givenNamesField as any)["#text"]
          : undefined;
      
      return {
        surname: name.surname,
        givenNames,
      };
    });

  const pubDateArray = articleMeta["pub-date"]
    ? Array.isArray(articleMeta["pub-date"])
      ? articleMeta["pub-date"]
      : [articleMeta["pub-date"]]
    : [];

  const pubDate = pubDateArray.find((date: PubDateDto) => 
    date["@_pub-type"] === "epub" || date["@_pub-type"] === "collection"
  ) || pubDateArray.find((date: PubDateDto) => date.year !== undefined);

  const publicationDate = pubDate && pubDate.year
    ? {
        year: pubDate.year.toString(),
        month: pubDate.month?.toString(),
        day: pubDate.day?.toString(),
      }
    : undefined;

  const kwdGroup = articleMeta["kwd-group"];
  const kwdGroupArray = kwdGroup
    ? Array.isArray(kwdGroup)
      ? kwdGroup
      : [kwdGroup]
    : [];

  const allKeywords = kwdGroupArray.flatMap(group => {
    const kwdItems = Array.isArray(group.kwd) ? group.kwd : [group.kwd];
    return kwdItems
      .map(kwd => {
        if (typeof kwd === "string") {
          return kwd;
        } else if (typeof kwd === "object" && kwd !== null) {
          return (kwd as any)["#text"] || undefined;
        }
        return undefined;
      })
      .filter((kwd): kwd is string => kwd !== undefined && kwd !== "");
  });

  return {
    pmcid,
    pmid,
    doi,
    title,
    authors,
    publicationDate,
    keywords: allKeywords.length > 0 ? allKeywords : undefined,
  };
}

export function mapArticlesToPubMedPapers(articles: ArticleDto | ArticleDto[]): PubMedPaperDto[] {
  const articleArray = Array.isArray(articles) ? articles : [articles];
  return articleArray.map(mapArticleToPubMedPaper);
}

export function mapMedlineCitationDtoGetPapersByIdsResponseDto(medlineCitation: MedlineCitationDto): PubMedPaperDto {
  const title = typeof medlineCitation.ArticleTitle === "string" ? medlineCitation.ArticleTitle : (medlineCitation.ArticleTitle as any)["#text"] || JSON.stringify(medlineCitation.ArticleTitle);
  if(!medlineCitation.ELocationID) {
    return {
      title,
      doi: undefined,
      authors: [],
      publicationDate: undefined,
      keywords: undefined,
    }
  }

  let doiObj : ELocationIdDto | undefined

  if(Array.isArray(medlineCitation.ELocationID)) {
    doiObj = medlineCitation.ELocationID.find((id: ELocationIdDto) => id["@_EIdType"].toLowerCase() === "doi");
  } else {
    doiObj = medlineCitation.ELocationID;
  }

  return {
    title,
    doi: doiObj ? doiObj["#text"]?.toString() : undefined,
    authors: [],
    publicationDate: undefined,
    keywords: undefined,
  };
}

function extractTextFromParagraph(paragraph: ParagraphDto | string): string {
  if (typeof paragraph === "string") {
    return paragraph;
  }
  
  if (typeof paragraph === "object" && paragraph !== null) {
    const text = (paragraph as any)["#text"];
    if (typeof text === "string") {
      return text;
    }
    if (typeof text === "number") {
      return text.toString();
    }
    if (typeof text === "object" && text !== null) {
      return JSON.stringify(text);
    }
  }
  
  return "";
}

function parseSection(section: SectionDto): string {
  const textParts: string[] = [];
  
  if (section.p) {
    if (Array.isArray(section.p)) {
      for (const paragraph of section.p) {
        const text = extractTextFromParagraph(paragraph);
        if (text) {
          textParts.push(text);
        }
      }
    } else {
      const text = extractTextFromParagraph(section.p);
      if (text) {
        textParts.push(text);
      }
    }
  }
  
  if (section.sec) {
    if (Array.isArray(section.sec)) {
      for (const subSection of section.sec) {
        const subText = parseSection(subSection);
        if (subText) {
          textParts.push(subText);
        }
      }
    } else {
      const subText = parseSection(section.sec);
      if (subText) {
        textParts.push(subText);
      }
    }
  }
  
  return textParts.join("\n\n");
}

export function mapArticleBodyToText(article: PubMedFetchArticleBodyDto): string {
  if (!article.body?.sec) {
    return "";
  }
  
  const sections = Array.isArray(article.body.sec) 
    ? article.body.sec 
    : [article.body.sec];
  
  const textParts: string[] = [];
  
  for (const section of sections) {
    const text = parseSection(section);
    if (text) {
      textParts.push(text);
    }
  }
  
  return textParts.join("\n\n");
}

function cleanTextFromEntities(apiText: string): string {
  // 1. Replace the thin space entity (&#8201;) with a standard space
  let cleanText = apiText.replace(/&#8201;/g, ' ');

  // 2. Replace common range/dash entities with a standard hyphen/dash
  // &#8211; is an En Dash (used for ranges like 6–10%)
  cleanText = cleanText.replace(/&#8211;/g, '–');

  // 3. Replace space characters used for unit separation
  // &#160; is a Non-Breaking Space (often used before units like mg, years)
  cleanText = cleanText.replace(/&#160;/g, ' ');

  // 4. Replace inequality symbols and other mathematical characters
  // &#8805; is Greater Than or Equal To (≥)
  cleanText = cleanText.replace(/&#8805;/g, '≥');
  // &#8722; is Minus Sign
  cleanText = cleanText.replace(/&#8722;/g, '-');
  // &#967; is Greek letter Chi (often used for chi-squared test $\chi^2$)
  cleanText = cleanText.replace(/&#967;/g, 'χ');

  // 5. Replace other common entities (like smart quotes)
  // &#8220; is Left Double Quotation Mark (“)
  cleanText = cleanText.replace(/&#8220;/g, '"');
  // &#8221; is Right Double Quotation Mark (”)
  cleanText = cleanText.replace(/&#8221;/g, '"');
  // &#8217; is Right Single Quotation Mark or Apostrophe (’)
  cleanText = cleanText.replace(/&#8217;/g, "'");
  // &#8594; is Right Arrow
  cleanText = cleanText.replace(/&#8594;/g, '→');
  // &#8804; is Less Than or Equal To (≤)
  cleanText = cleanText.replace(/&#8804;/g, '≤');
  // &#8805; is Greater Than or Equal To (≥)
  cleanText = cleanText.replace(/&#8805;/g, '≥');
  // &#8806; is Not Less Than (≮)
  cleanText = cleanText.replace(/&#8806;/g, '≮');
  // &#8807; is Not Greater Than (≯)
  cleanText = cleanText.replace(/&#8807;/g, '≯');  
  // &#8594; is Right Arrow
  cleanText = cleanText.replace(/&#8594;/g, '→');

  // 6. Replace the newline/line feed character (\n)
  cleanText = cleanText.replace(/\n/g, ' ');

  cleanText = cleanText.replace('[]', ' ');
  cleanText = cleanText.replace('[,]', ' ');
  cleanText = cleanText.replace('[,,]', ' ');

  // 7. For completeness, you could optionally use a small helper function
  // or a more complete library if you encounter many more entities.
  // The entities above cover the vast majority of the issues in your sample text.

  return cleanText.trim();
}

export function mapArticleBodyWithIds(article: any): PaperBodyWithIdsDto {
  const body = mapArticleBodyToText(article);
  
  let pmid: string | undefined;
  let pmcid: string | undefined;
  let doi: string | undefined;
  
  if (article.front?.["article-meta"]?.["article-id"]) {
    const articleIds = Array.isArray(article.front["article-meta"]["article-id"]) 
      ? article.front["article-meta"]["article-id"] 
      : [article.front["article-meta"]["article-id"]];
    
    const pmcidObj = articleIds.find(id => id["@_pub-id-type"] === "pmcid");
    pmcid = pmcidObj ? pmcidObj["#text"]?.toString() : undefined;
    
    const pmidObj = articleIds.find(id => id["@_pub-id-type"] === "pmid");
    pmid = pmidObj ? pmidObj["#text"]?.toString() : undefined;
    
    const doiObj = articleIds.find(id => id["@_pub-id-type"] === "doi");
    doi = doiObj ? doiObj["#text"]?.toString() : undefined;
  }
  
  return {
    body: cleanTextFromEntities(body),
    pmid,
    pmcid,
    doi,
  };
}

export function mapArticlesBodiesToText(articles: PubMedFetchArticleBodyDto | PubMedFetchArticleBodyDto[]): string[] {
  const articleArray = Array.isArray(articles) ? articles : [articles];
  return articleArray.map(mapArticleBodyToText);
}

export function mapArticlesBodiesWithIds(articles: any | any[]): PaperBodyWithIdsDto[] {
  const articleArray = Array.isArray(articles) ? articles : [articles];
  return articleArray.map(mapArticleBodyWithIds);
}

export function mapPubMedPaperToCreateResearchPaper(paper: PaperBodyWithIdsDto): CreateResearchPaperDto {
  const externalIds = {
    semanticSchollarId: null,
    DOI: paper.doi || null,
    pubmedId: paper.pmid || null,
  };

  let publicLink = "";
  if (paper.doi) {
    publicLink = `https://doi.org/${paper.doi}`;
  } else if (paper.pmcid) {
    publicLink = `https://www.ncbi.nlm.nih.gov/pmc/articles/${paper.pmcid}`;
  } else if (paper.pmid) {
    publicLink = `https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}`;
  }

  return {
    externalIds,
    title: 'Body',
    publicLink,
  };
}

export function mapPubMedPapersToCreateResearchPapers(papers: PaperBodyWithIdsDto[]): CreateResearchPaperDto[] {
  return papers.map(mapPubMedPaperToCreateResearchPaper);
}

export function mapPubMedPaperDtoToCreateResearchPaper(paper: PubMedPaperDto): CreateResearchPaperDto {
  const externalIds = {
    semanticSchollarId: null,
    DOI: paper.doi || null,
    pubmedId: paper.pmid || null,
  };

  let publicLink = "";
  if (paper.doi) {
    publicLink = `https://doi.org/${paper.doi}`;
  } else if (paper.pmcid) {
    publicLink = `https://pmc.ncbi.nlm.nih.gov/articles/PMC${paper.pmcid}`;
  } else if (paper.pmid) {
    publicLink = `https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}`;
  }

  return {
    externalIds,
    title: paper.title,
    publicLink,
  };
}

export function mapPubMedPapersDtoToCreateResearchPapers(papers: PubMedPaperDto[]): CreateResearchPaperDto[] {
  return papers.map(mapPubMedPaperDtoToCreateResearchPaper);
}