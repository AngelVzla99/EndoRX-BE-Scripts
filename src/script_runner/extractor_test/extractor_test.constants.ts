import { PatientProfileDto } from "../backend_client/backend_client.js";

export interface ExtractorTestCase {
    title: string;
    field: keyof PatientProfileDto;
    keyWords: string[];
    messages: string[];
}
export const EXTRACTOR_TEST_MESSAGES: ExtractorTestCase[] = [
    {
      title: "Complete symptomsOfInterest",
      field: "symptomsOfInterest",
      keyWords: ["painful_periods", "bloating", "back_pain", "fatigue"],
      messages: [
        "Since yesterday I started having painful periods",
        "I've been bloating for the last 2 days",
        "My back pain is getting worse",
        "I've been feeling very tired lately",
    ]
    },
    {
        title: "Complete dietType",
        field: "dietType",
        keyWords: ["vegan", "vegetarian"],
        messages: [
            "I only eat vegan or vegetarian food",
        ]
    },
    {
        title: "Complete dietaryRestrictions",
        field: "dietaryRestrictions",
        keyWords: ["gluten", "FODMAP"],
        messages: [
            "Everytime I eat gluten, I get a stomachache. I was diagnosed with celiac disease",
            "I'm allergic to FODMAPs. I was diagnosed with IBS",
        ]
    },
    {
        title: "Complete contraindicationTags",
        field: "contraindicationTags",
        keyWords: ["severe_low_blood_pressure", "magnesium_allergy", "pregnancy"],
        messages: [
            "I have severe low blood pressure. I'm taking medication for it",
            "My doctor advised me to avoid magnesium as I'm allergic to it",
            "I finally got pregnant after 2 years of trying, but I'm not sure if I can take magnesium during pregnancy",
        ]
    },
    {
        title: "Complete medicalCondition",
        field: "medicalCondition",
        keyWords: ["diabetes", "hypertension"],
        messages: [
            "I have diabetes. I was diagnosed with diabetes 10 years ago",
            "Last year I made some tests and I was diagnosed with hypertension",
        ]
    },
    {
        title: "Complete physicalCondition",
        field: "physicalCondition",
        keyWords: ["surgery"],
        messages: [
            "Last year I had a surgery to remove my appendix",
        ]
    },
    {
        title: "Complete lifelongMedications",
        field: "lifelongMedications",
        keyWords: ["levothyroxine", "insulin"],
        messages: [
            "I take levothyroxine every day to treat my hypothyroidism",
            "I take insulin every day to treat my diabetes",
        ]
    },
    {
        title: "Complete lifestyleHealth",
        field: "lifestyleHealth",
        keyWords: ["smoking", "drink"],
        messages: [
            "I smoke 1 pack of cigarettes per day",
            "I drink 1 glass of wine per day",
        ]
    },
    {
        title: "Complete reproductiveHealth",
        field: "reproductiveHealth",
        keyWords: ["pregnancy", "menopause"],
        messages: [
            "I'm pregnant. I'm 12 weeks pregnant",
            "I'm 50 years old and I'm going through menopause",
        ]
    },
    {
        title: "Complete surgeries",
        field: "surgeries",
        keyWords: ["append", "uterus"],
        messages: [
            "I had a surgery to remove my appendix",
            "I had a surgery to remove my uterus",
        ]
    },
    {
        title: "Complete allergies",
        field: "allergies",
        keyWords: ["penicillin", "latex"],
        messages: [
            "I made some test my doctor told me I'm allergic to latex and penicillin",
        ]
    }
];