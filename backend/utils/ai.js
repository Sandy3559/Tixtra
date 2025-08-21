import { createAgent, gemini } from "@inngest/agent-kit";

const analyzeTicket = async (ticket) => {
  try {
    const supportAgent = createAgent({
      model: gemini({
        model: "gemini-2.0-flash-exp",  
        apiKey: process.env.GEMINI_API_KEY,
      }),
      name: "AI Ticket Triage Assistant",
      system: `You are an expert AI assistant that processes technical support tickets. 

Your job is to:
1. Summarize the issue.
2. Estimate its priority.
3. Provide helpful notes and resource links for human moderators.
4. List relevant technical skills required.

CRITICAL: You must respond with ONLY a valid JSON object. No other text, no markdown, no code blocks, no explanations.

The JSON format must be exactly:
{
  "summary": "Brief summary of the issue",
  "priority": "low|medium|high",
  "helpfulNotes": "Detailed technical explanation with helpful resources",
  "relatedSkills": ["skill1", "skill2"]
}`,
    });

    const prompt = `Analyze this support ticket and respond with ONLY a JSON object:

Title: ${ticket.title || 'No title'}
Description: ${ticket.description || 'No description'}

Required JSON format (respond with ONLY this, no other text):
{
  "summary": "Brief summary",
  "priority": "medium",
  "helpfulNotes": "Technical explanation",
  "relatedSkills": ["React", "Node.js"]
}`;

    console.log("🤖 Sending request to AI...");
    const response = await supportAgent.run(prompt);
    
    console.log("🤖 AI Response received:", response);

    // Handle different possible response structures
    let raw = null;
    
    if (response && response.output && Array.isArray(response.output) && response.output[0]) {
      raw = response.output[0].content || response.output[0].context || response.output[0];
    } else if (response && response.content) {
      raw = response.content;
    } else if (response && typeof response === 'string') {
      raw = response;
    } else if (response && response.text) {
      raw = response.text;
    }

    console.log("🤖 Raw response:", raw);

    if (!raw || typeof raw !== 'string') {
      console.error("❌ Invalid AI response format:", response);
      return getFallbackResponse(ticket);
    }

    // Try multiple parsing strategies
    let parsedData = null;

    // Strategy 1: Direct JSON parse
    try {
      parsedData = JSON.parse(raw.trim());
    } catch (e) {
      console.log("📝 Direct parse failed, trying regex extraction...");
    }

    // Strategy 2: Extract JSON from markdown code blocks
    if (!parsedData) {
      const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (codeBlockMatch && codeBlockMatch[1]) {
        try {
          parsedData = JSON.parse(codeBlockMatch[1].trim());
        } catch (e) {
          console.log("📝 Code block extraction failed...");
        }
      }
    }

    // Strategy 3: Look for JSON object in the text
    if (!parsedData) {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.log("📝 JSON object extraction failed...");
        }
      }
    }

    // Strategy 4: Manual extraction if all else fails
    if (!parsedData) {
      console.log("📝 Attempting manual extraction...");
      parsedData = extractJsonManually(raw);
    }

    // Validate the parsed data
    if (parsedData && validateResponse(parsedData)) {
      console.log("✅ Successfully parsed AI response:", parsedData);
      return parsedData;
    } else {
      console.error("❌ Invalid response structure:", parsedData);
      return getFallbackResponse(ticket);
    }

  } catch (error) {
    console.error("❌ AI analysis error:", error.message);
    return getFallbackResponse(ticket);
  }
};

// Fallback response when AI fails
function getFallbackResponse(ticket) {
  console.log("🔄 Using fallback response");
  return {
    summary: `Issue with ${ticket.title || 'support request'}`,
    priority: "medium",
    helpfulNotes: `This ticket requires manual review. Original description: ${ticket.description || 'No description provided'}. Please assign to appropriate technical staff.`,
    relatedSkills: ["General Support", "Technical Review"]
  };
}

// Validate response structure
function validateResponse(data) {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.summary === 'string' &&
    typeof data.priority === 'string' &&
    ['low', 'medium', 'high'].includes(data.priority.toLowerCase()) &&
    typeof data.helpfulNotes === 'string' &&
    Array.isArray(data.relatedSkills)
  );
}

// Manual JSON extraction as last resort
function extractJsonManually(text) {
  try {
    // Look for key patterns and extract values
    const summary = text.match(/"summary":\s*"([^"]+)"/i)?.[1] || "Manual review required";
    const priority = text.match(/"priority":\s*"(low|medium|high)"/i)?.[1] || "medium";
    const helpfulNotes = text.match(/"helpfulNotes":\s*"([^"]+)"/i)?.[1] || "Please review manually";
    
    // Extract skills array
    const skillsMatch = text.match(/"relatedSkills":\s*\[([^\]]+)\]/i);
    let relatedSkills = ["General Support"];
    
    if (skillsMatch) {
      try {
        relatedSkills = skillsMatch[1]
          .split(',')
          .map(skill => skill.replace(/"/g, '').trim())
          .filter(skill => skill.length > 0);
      } catch (e) {
        console.log("📝 Skills extraction failed, using default");
      }
    }

    return {
      summary,
      priority,
      helpfulNotes,
      relatedSkills
    };
  } catch (error) {
    console.error("❌ Manual extraction failed:", error);
    return null;
  }
}

export default analyzeTicket;