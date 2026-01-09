export interface ClinicalDocumentationDto {
  plan?: string;
  objective?: string;
  assessment?: string;
  subjective?: string;
}

export interface CreateAudioScribeDto {
  providerId: string;
  providerCreatedAt: Date;
  clinicalDocumentation: ClinicalDocumentationDto;
}

export interface AudioScribeDto {
  id: string;
  providerId: string;
  providerCreatedAt: Date;
  clinicalDocumentation: ClinicalDocumentationDto;
  createdAt: Date;
  updatedAt: Date;
}

