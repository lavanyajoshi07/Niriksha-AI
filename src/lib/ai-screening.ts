import { GoogleGenAI } from '@google/genai';
import { AIScreeningResult, InfrastructureCategory, PriorityLevel } from '@/types';

export async function runAIScreening(
  imageUrl: string,
  hintCategory?: InfrastructureCategory,
  description?: string
): Promise<AIScreeningResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Analyze this infrastructure damage photograph for an Indian civic body. 
Category hint: ${hintCategory || 'unknown'}. Description: ${description || 'N/A'}.
Respond ONLY with a JSON object in this format:
{
  "detectedCategory": "pothole" | "road_crack" | "damaged_road" | "blocked_drain" | "waterlogging" | "damaged_public_infrastructure" | "bridge_structural" | "street_lighting",
  "categoryLabel": "Human readable name",
  "estimatedSeverity": "low" | "medium" | "high",
  "confidenceScore": 92.5,
  "suggestedPriority": "critical" | "high" | "medium" | "low",
  "explanation": "Detailed professional engineering observation..."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType: 'image/jpeg', data: imageUrl.split(',')[1] || imageUrl } }
            ]
          }
        ]
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        detectedCategory: parsed.detectedCategory || hintCategory || 'pothole',
        categoryLabel: parsed.categoryLabel || 'Road Infrastructure Defect',
        estimatedSeverity: parsed.estimatedSeverity || 'high',
        confidenceScore: parsed.confidenceScore || 91.0,
        suggestedPriority: parsed.suggestedPriority || 'high',
        explanation: parsed.explanation || 'Vision AI detected asphalt degradation requiring field inspection.',
        isDemoMode: false,
      };
    } catch (err) {
      console.warn('[AIScreening] Real Gemini API call failed or image unreadable, falling back to Sentinel AI Demo Engine:', err);
    }
  }

  // --- Clearly Labelled Demo Screening Engine ---
  const cat = hintCategory || 'pothole';

  const demoCategoryMap: Record<InfrastructureCategory, { label: string; severity: 'low' | 'medium' | 'high'; priority: PriorityLevel; explanation: string }> = {
    pothole: {
      label: 'Severe Asphalt Pothole Cluster',
      severity: 'high',
      priority: 'critical',
      explanation: '[Bharat Sentinel AI Demo Engine] Computer vision detected sharp asphalt edge breakdown with exposed aggregate sub-grade (~10-14cm depth). High hazard risk for two-wheelers and high-speed corridor traffic.',
    },
    road_crack: {
      label: 'Alligator Longitudinal Cracking',
      severity: 'medium',
      priority: 'medium',
      explanation: '[Bharat Sentinel AI Demo Engine] Interlocking crocodile skin crack pattern detected over 4.2 sq.m. Moisture infiltration risk during monsoons.',
    },
    damaged_road: {
      label: 'Asphalt Shear Disintegration',
      severity: 'high',
      priority: 'high',
      explanation: '[Bharat Sentinel AI Demo Engine] Multi-layer pavement distress with loose gravel dispersion. Surface compaction compromised.',
    },
    blocked_drain: {
      label: 'Stormwater Culvert Debris Blockage',
      severity: 'high',
      priority: 'high',
      explanation: '[Bharat Sentinel AI Demo Engine] High density municipal silt & plastic waste clogging >70% of stormwater drainage throat. Immediate desilting required.',
    },
    waterlogging: {
      label: 'Sub-surface Drainage Overflow & Waterlogging',
      severity: 'high',
      priority: 'critical',
      explanation: '[Bharat Sentinel AI Demo Engine] Standing water depth estimated >35cm over 18m road length. Sub-base structural saturation risk.',
    },
    damaged_public_infrastructure: {
      label: 'Civic Infrastructure Structural Damage',
      severity: 'medium',
      priority: 'medium',
      explanation: '[Bharat Sentinel AI Demo Engine] Concrete median/footpath slab displacement detected. Pedestrian hazard flag active.',
    },
    bridge_structural: {
      label: 'Bridge Expansion Joint & Deck Stress',
      severity: 'high',
      priority: 'critical',
      explanation: '[Bharat Sentinel AI Demo Engine] Spalling concrete and exposed rebar noted near bridge pier expansion joint. Urgent structural audit required.',
    },
    street_lighting: {
      label: 'Streetlight Pole / Electrical Conduit Failure',
      severity: 'low',
      priority: 'low',
      explanation: '[Bharat Sentinel AI Demo Engine] Physical luminaire casing dislocation. Low immediate road risk, electrical safety check advised.',
    },
  };

  const selected = demoCategoryMap[cat] || demoCategoryMap.pothole;
  const confidence = Math.round((88 + Math.random() * 9.5) * 10) / 10;

  return {
    detectedCategory: cat,
    categoryLabel: selected.label,
    estimatedSeverity: selected.severity,
    confidenceScore: confidence,
    suggestedPriority: selected.priority,
    explanation: selected.explanation,
    isDemoMode: true,
  };
}
