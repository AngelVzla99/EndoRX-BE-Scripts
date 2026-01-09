export interface CptCodeApiResponse {
  code: string;
  description: string;
}

export interface ClinicalDocumentationApiResponse {
  plan: string;
  objective: string;
  assessment: string;
  subjective: string;
}

export interface ScribeApiResponse {
  created_at: string;
  updated_at: string;
  id: string;
  patient_name: string;
  started_recording_at: string;
  ended_recording_at: string;
  audio_length_in_seconds: number;
  status: string;
  template: object;
  additional_context: object;
  transcription: string;
  clinical_documentation: ClinicalDocumentationApiResponse;
  cpt_codes: CptCodeApiResponse[];
  user_template_id: string;
  patient_id: string;
}

export interface GetScribesResponse {
  data: {
    scribes: ScribeApiResponse[];
  };
}
