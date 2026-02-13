
import { GoogleGenAI, Type } from "@google/genai";
import { MatchResult, Job } from '../types';

const getAiClient = () => {
  // Assuming process.env.API_KEY is available as per instructions
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeResumeMatch = async (resumeText: string, jobDescription: string): Promise<MatchResult> => {
  const ai = getAiClient();
  
  // Prompt engineering for structured JSON output
  const prompt = `
    You are an expert HR AI Recruiter. 
    Analyze the following Resume Text against the Job Description.
    
    Resume Text:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Calculate a match score percentage (0-100) based on skills, experience, and relevance.
    Identify missing critical skills from the resume that are required in the job description.
    Provide a brief 1-sentence analysis of the fit.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Match score percentage 0-100" },
            missingSkills: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of missing skills"
            },
            analysis: { type: Type.STRING, description: "Brief analysis of the match" }
          },
          required: ["score", "missingSkills", "analysis"]
        }
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response from AI");
    }
    
    const result = JSON.parse(text);
    return result as MatchResult;

  } catch (error) {
    console.error("AI Analysis Failed:", error);
    // Fallback mock response if API fails or key is missing
    return {
      score: 0,
      missingSkills: ["Error connecting to AI service"],
      analysis: "Could not perform analysis. Please check API Key."
    };
  }
};

export interface ResumeReviewResult {
  rating: number; // 1-10
  summary: string;
  strengths: string[];
  improvements: string[];
}

export const reviewResumeQuality = async (resumeText: string): Promise<ResumeReviewResult> => {
    const ai = getAiClient();
    
    const prompt = `
      You are a professional Resume Coach.
      Review the following resume text and provide constructive feedback.
      
      Resume Text:
      ${resumeText}
      
      Provide:
      1. A rating out of 10.
      2. A short summary of the candidate's profile.
      3. Top 3 strengths.
      4. Top 3 areas for improvement.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rating: { type: Type.NUMBER, description: "Rating from 1 to 10" },
              summary: { type: Type.STRING, description: "Short professional summary" },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["rating", "summary", "strengths", "improvements"]
          }
        }
      });
  
      const text = response.text;
      if (!text) throw new Error("No response");
      return JSON.parse(text) as ResumeReviewResult;
  
    } catch (error) {
      console.error("Resume Review Failed", error);
      return {
          rating: 5,
          summary: "Could not analyze resume.",
          strengths: ["N/A"],
          improvements: ["Check API connection"]
      };
    }
};

// New function for AI Recommendations
export const recommendJobsBasedOnResume = async (resumeText: string, availableJobs: Job[]): Promise<string[]> => {
    const ai = getAiClient();

    // Create a simplified version of jobs to save tokens
    const jobsSummary = availableJobs.map(j => ({
        id: j.id,
        title: j.title,
        company: j.company,
        requirements: j.requirements.join(", ")
    }));

    const prompt = `
        You are a smart recruiter. 
        Given the Resume Text below, select the top 3 Job IDs from the provided list that best match the candidate's profile.
        
        Resume:
        ${resumeText.substring(0, 3000)} // Truncate to avoid token limits if very long

        Available Jobs (JSON):
        ${JSON.stringify(jobsSummary)}

        Return strictly a JSON array of strings containing the 'id' of the recommended jobs. 
        If no strong matches found, return the ones that are closest or an empty array.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Array of matching Job IDs"
                }
            }
        });

        const text = response.text;
        if (!text) return [];
        return JSON.parse(text) as string[];

    } catch (error) {
        console.error("AI Recommendation Failed", error);
        return [];
    }
};
