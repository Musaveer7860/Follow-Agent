import json
import re
import datetime
import logging
from app.config import settings

logger = logging.getLogger("meetmind.gemini")

GEMINI_PROMPT_TEMPLATE = """
You are Follow Agent, an elite executive meeting intelligence assistant.
Analyze the following meeting transcript / audio recording text and extract structured details in pure JSON format.

JSON Schema Requirement:
Return ONLY a valid JSON object matching this exact structure:
{{
  "summary": "Concise executive summary of main outcomes (3-5 sentences).",
  "decisions": [
    "Key decisions approved during the meeting"
  ],
  "tasks": [
    {{
      "title": "Concise key work deliverable (action verb + target work, NOT full long sentences)",
      "owner": "Name of assigned person (e.g. Alex, Priya, Vikram) or Unassigned",
      "deadline": "YYYY-MM-DD (Parse exact date discussed e.g. 2026-07-28 if 'July 28' or 'Friday')",
      "priority": "High / Medium / Low",
      "status": "Pending"
    }}
  ],
  "risks": [
    "Identified risks, blockers, or dependencies"
  ],
  "followups": [
    "Follow-up items or future review topics"
  ]
}}

Rules:
1. Extract ALL actionable work items. Make task titles concise deliverables (e.g. 'Finalize JWT refresh token flow', NOT 'Alex needs to finish JWT refresh tokens by Friday').
2. Parse exact dates spoken in the transcript (e.g. 'July 28' -> '2026-07-28', 'Friday' -> next Friday date).
3. Output ONLY valid JSON block without markdown formatting preamble.

Meeting Transcript / Recording Text:
---
{transcript}
---
"""

def extract_spoken_deadline_date(text: str) -> str:
    """
    Intelligent NLP date extractor that converts spoken meeting dates into YYYY-MM-DD format.
    E.g. 'July 28', '28th July', 'Friday', 'tomorrow', 'August 5'.
    """
    today = datetime.date.today()
    text_lower = text.lower()

    # 1. Look for explicit Month + Day (e.g., "July 28", "July 28th", "28 July")
    month_names = {
        'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
        'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'jun': 6, 'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }

    match_month_day = re.search(r'(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(st|nd|rd|th)?', text_lower)
    if match_month_day:
        m_str = match_month_day.group(1)
        d_num = int(match_month_day.group(2))
        month_num = month_names.get(m_str, today.month)
        year_num = today.year
        # If month is past, assume next year
        if month_num < today.month:
            year_num += 1
        try:
            return datetime.date(year_num, month_num, d_num).isoformat()
        except ValueError:
            pass

    match_day_month = re.search(r'(\d{1,2})(st|nd|rd|th)?\s+(of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)', text_lower)
    if match_day_month:
        d_num = int(match_day_month.group(1))
        m_str = match_day_month.group(4)
        month_num = month_names.get(m_str, today.month)
        year_num = today.year
        if month_num < today.month:
            year_num += 1
        try:
            return datetime.date(year_num, month_num, d_num).isoformat()
        except ValueError:
            pass

    # 2. Look for Day of Week (e.g., "Friday", "Thursday", "tomorrow")
    if "tomorrow" in text_lower:
        return (today + datetime.timedelta(days=1)).isoformat()
    if "today" in text_lower:
        return today.isoformat()

    days_of_week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    for idx, day_name in enumerate(days_of_week):
        if day_name in text_lower:
            days_ahead = idx - today.weekday()
            if days_ahead <= 0: # Target next week's day
                days_ahead += 7
            return (today + datetime.timedelta(days=days_ahead)).isoformat()

    # Fallback to relative default (+3 days)
    return (today + datetime.timedelta(days=3)).isoformat()

def mock_fallback_analysis(transcript: str) -> dict:
    """
    Fallback NLP rule-based parser with intelligent date & keypoint extraction.
    """
    lines = [line.strip() for line in transcript.split('\n') if line.strip()]
    today = datetime.date.today()
    
    speakers = list(set(re.findall(r'([A-Z][a-z]+):', transcript)))
    if not speakers:
        speakers = ["Rahul", "Priya", "Alex", "Vikram", "Sneha"]
    
    tasks = []
    decisions = []
    risks = []
    followups = []
    
    for i, line in enumerate(lines):
        lower_line = line.lower()
        if any(w in lower_line for w in ["will do", "action item", "take care of", "assign", "need to", "must", "finish", "complete", "handle", "by"]):
            owner = "Unassigned"
            for sp in speakers:
                if sp in line or sp.lower() in lower_line:
                    owner = sp
                    break
            
            priority = "High" if any(w in lower_line for w in ["urgent", "asap", "critical", "blocking", "high priority", "friday", "today"]) else ("Medium" if i % 2 == 0 else "Low")
            
            # Extract exact deadline date from spoken text
            deadline_date = extract_spoken_deadline_date(line)
            
            # Extract concise deliverable title instead of raw long sentence
            raw_text = re.sub(r'^[A-Z][a-z]+:\s*', '', line)
            raw_text = re.sub(r'^(i will|i\'ll|we need to|needs to|must|please)\s+', '', raw_text, flags=re.IGNORECASE)
            clean_title = raw_text.strip().capitalize()
            if len(clean_title) > 80:
                clean_title = clean_title[:77] + "..."

            tasks.append({
                "title": clean_title,
                "owner": owner,
                "deadline": deadline_date,
                "priority": priority,
                "status": "Pending"
            })
            
        elif any(w in lower_line for w in ["agreed", "decided", "conclusion", "approved", "finalized", "decision:"]):
            clean_dec = re.sub(r'^[A-Z][a-z]+:\s*', '', line)
            decisions.append(clean_dec.strip().capitalize())
            
        elif any(w in lower_line for w in ["risk", "blocker", "concern", "issue", "delay", "challenge"]):
            clean_risk = re.sub(r'^[A-Z][a-z]+:\s*', '', line)
            risks.append(clean_risk.strip().capitalize())
            
        elif any(w in lower_line for w in ["follow up", "next meeting", "review", "circle back"]):
            clean_fol = re.sub(r'^[A-Z][a-z]+:\s*', '', line)
            followups.append(clean_fol.strip().capitalize())

    summary = (
        f"Meeting transcript analyzed. "
        f"A total of {len(tasks)} key action items were extracted."
    )

    return {
        "summary": summary,
        "decisions": decisions,
        "tasks": tasks,
        "risks": risks,
        "followups": followups
    }

async def analyze_transcript_with_gemini(transcript: str) -> dict:
    """
    Sends transcript to Gemini API and parses structured JSON output with accurate deadline date parsing.
    Falls back to intelligent local date & keypoint parser if API key is unconfigured.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.info("No GEMINI_API_KEY configured. Utilizing intelligent date & keypoint fallback analysis engine.")
        return mock_fallback_analysis(transcript)

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
        model_name = settings.GEMINI_MODEL
        model = genai.GenerativeModel(model_name)
        
        prompt = GEMINI_PROMPT_TEMPLATE.format(transcript=transcript)
        response = model.generate_content(prompt)
        
        raw_text = response.text.strip()
        
        clean_text = re.sub(r'^```(json)?\s*', '', raw_text, flags=re.MULTILINE)
        clean_text = re.sub(r'```$', '', clean_text, flags=re.MULTILINE).strip()
        
        data = json.loads(clean_text)
        
        required_keys = ["summary", "decisions", "tasks", "risks", "followups"]
        for k in required_keys:
            if k not in data:
                data[k] = [] if k != "summary" else ""

        # Post-process deadlines in tasks to guarantee YYYY-MM-DD date format
        for task in data.get("tasks", []):
            if "deadline" in task and task["deadline"]:
                parsed_d = extract_spoken_deadline_date(task["deadline"])
                task["deadline"] = parsed_d

        return data
        
    except Exception as e:
        logger.error(f"Gemini API invocation error: {e}. Executing fallback analysis engine.")
        return mock_fallback_analysis(transcript)
