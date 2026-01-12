import { CustomError } from "../types/types.js";

export class ExistingResearchPaperError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = "ExistingResearchPaperError";
  }
}

export class InvalidExternalIdsError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidExternalIdsError";
  }
}

export class NoValidTitlesError extends CustomError {
  constructor(title: string) {
    super(`No valid title found for paper: ${title}`);
    this.name = "NoValidTitlesError";
  }
}