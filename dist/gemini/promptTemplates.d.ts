export declare const PromptTemplates: {
    menuProcessing: (rawMenuText: string) => string;
    locationExtraction: (textInput: string) => string;
    operatingHours: (hoursText: string) => string;
    sentimentAnalysis: (reviewText: string) => string;
    dataEnhancement: (rawData: unknown) => string;
    foodTruckExtraction: (markdownContent: string, sourceUrl?: string) => string;
};
