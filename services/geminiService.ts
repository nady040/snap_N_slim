
import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFoodImage = async (base64Image: string, dailyGoal: number) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: `Analyze this food image. The user's total daily calorie budget is ${dailyGoal} kcal. 
          Identify the items, estimate the calories for each, and provide a macronutrient breakdown (protein, carbs, and fat in grams) for each item.
          Provide brief nutritional advice based on the image. 
          Critically, suggest specific "modifications" or items to remove or swap to make the meal better for weight loss (e.g., 'Remove the bun to save 150 kcal').`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                portion: { type: Type.STRING },
                protein: { type: Type.NUMBER, description: "grams of protein" },
                carbs: { type: Type.NUMBER, description: "grams of carbohydrates" },
                fat: { type: Type.NUMBER, description: "grams of fat" }
              },
              required: ["name", "calories", "portion", "protein", "carbs", "fat"]
            }
          },
          totalCalories: { type: Type.NUMBER },
          advice: { type: Type.STRING },
          modifications: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                suggestion: { type: Type.STRING },
                reason: { type: Type.STRING },
                calorieSaving: { type: Type.NUMBER }
              },
              required: ["suggestion", "reason", "calorieSaving"]
            }
          }
        },
        required: ["items", "totalCalories", "advice", "modifications"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getDinnerRecommendation = async (
  remainingCalories: number, 
  dailyGoal: number,
  consumedNutrients: { protein: number, carbs: number, fat: number },
  consumedMeals: string
) => {
  const ai = getAI();
  const prompt = `
    The user has consumed:
    - Calories: ${dailyGoal - remainingCalories} / ${dailyGoal} kcal
    - Protein: ${consumedNutrients.protein}g
    - Carbs: ${consumedNutrients.carbs}g
    - Fat: ${consumedNutrients.fat}g
    - Meals today: ${consumedMeals}

    Analyze the nutritional balance. If the user is low on protein, specifically state "You are missing the quantity of protein for the day so please add them in your next meal". 
    If they took extra of something (like fats/carbs), mention it.
    Provide an end-of-night summary and suggest 2 dinner options that fit the remaining ${remainingCalories} kcal budget while fixing the nutritional gaps.
    Return JSON format.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysisSummary: { 
            type: Type.STRING, 
            description: "A summary of what was missed or taken in excess today." 
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedCalories: { type: Type.NUMBER }
              },
              required: ["title", "description", "estimatedCalories"]
            }
          }
        },
        required: ["analysisSummary", "recommendations"]
      }
    }
  });

  return JSON.parse(response.text);
};
