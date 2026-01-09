import { ScribeApiResponse } from "./commure.dtos.js";
import { CreateAudioScribeDto, AudioScribeDto, ClinicalDocumentationDto } from "./audio-scribe.dto.js";
import { AudioScribeEntity } from "./audio-scribe.model.js";

export function mapScribeApiResponseToCreateDto(
  apiResponse: ScribeApiResponse
): CreateAudioScribeDto {
  return {
    providerId: apiResponse.id,
    providerCreatedAt: new Date(apiResponse.created_at),
    clinicalDocumentation: {
      plan: apiResponse.clinical_documentation.plan,
      objective: apiResponse.clinical_documentation.objective,
      assessment: apiResponse.clinical_documentation.assessment,
      subjective: apiResponse.clinical_documentation.subjective,
    },
  };
}

export function mapAudioScribeEntityToDto(
  entity: AudioScribeEntity
): AudioScribeDto {
  return {
    id: entity._id.toString(),
    providerId: entity.providerId,
    providerCreatedAt: entity.providerCreatedAt,
    clinicalDocumentation: {
      plan: entity.clinicalDocumentation.plan ?? undefined,
      objective: entity.clinicalDocumentation.objective ?? undefined,
      assessment: entity.clinicalDocumentation.assessment ?? undefined,
      subjective: entity.clinicalDocumentation.subjective ?? undefined,
    },
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

