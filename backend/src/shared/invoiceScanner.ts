export const runOCR = (img_path: String) => { };
export const runLLamaVision = (img_path: String) => { };
// export const runConcensus = (ocrRawOutput: any, visionRawOutput: any) => {
//     let consensusData, confidenceScore, manualReviewRequired;
//     return { consensusData, confidenceScore, manualReviewRequired };
// };
export const runConcensus = (ocrRawOutput: any, visionRawOutput: any) => {
    let consensusData: Record<string, any> = {}; 
    let confidenceScore = 0;
    let manualReviewRequired = true;
    
    return { consensusData, confidenceScore, manualReviewRequired };
};