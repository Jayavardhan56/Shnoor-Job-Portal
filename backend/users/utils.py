import pdfplumber
from docx import Document
import os
import re
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def extract_text(file_path):
    text=""
    try:
        ext=os.path.splitext(file_path)[1].lower()
        if ext==".pdf":
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    content=page.extract_text()
                    if content:
                        text+=content + "\n"
        elif ext==".docx":
            doc=Document(file_path)
            for para in doc.paragraphs:
                text+=para.text + "\n"
        else:
            text="Unsupported File Format"
    except Exception as e:
        print("Error Extracting Text:",e)
    return text

def parse_skills(skills_text):
    return [skill.strip().lower() for skill in skills_text.split(",") if skill.strip()]

def calculate_ats_score(resume_text,job_description,job_skills_text):
    resume_text=resume_text.lower()
    job_skills=parse_skills(job_skills_text)
    matched=[s for s in job_skills if s in resume_text]
    skill_score=(len(matched)/len(job_skills))*100 if job_skills else 0
    return {"score":round(skill_score,2),"matched":matched,"missing":[s for s in job_skills if s not in resume_text]}

def get_advanced_ai_analysis(resume_text,job_title,job_description,job_skills_text,screening_data=None):
    api_key=os.getenv("GROQ_API_KEY")
    if not api_key:
        return {
            "score":0,
            "analysis":"AI Analysis Unavailable: API key not configured.",
            "highlights":{"strengths":[],"gaps":["Config Error"],"ratings":{"Technical":0,"Experience":0,"Context":0}}
        }
    try:
        client=Groq(api_key=api_key)
        screening_text=""
        if screening_data:
            screening_text="\nSCREENING EVALUATION:\n"
            for item in screening_data:
                screening_text+=f"Q:{item.get('question')}\nExpected:{item.get('expected_answer')}\nCandidate Answer:{item.get('answer')}\n"
        prompt=f"""
        You are an elite Recruitment AI Agent for the SHNOOR Job Portal. Analyze the resume and screening responses against the job requirements.
        JOB TITLE:{job_title}
        DESCRIPTION:{job_description}
        REQUIRED SKILLS:{job_skills_text}
        RESUME CONTENT:{resume_text}
        {screening_text}
        Your Task:
        1.Compare Candidate Answers against Expected Answers.
        2.Analyze Resume for technical fit and experience.
        3.Provide a combined ATS score (0-100). The screening performance should account for 40% of this score.
        4.Write a concise 2-paragraph professional executive summary in the "analysis" field.
           -THE SUMMARY MUST INCLUDE A "DIAGNOSTIC COMPARISON" SECTION AT THE END.
           -For each question, state: "For [Question], you expected [Expected Answer], but the candidate answered [Candidate Answer]. [Evaluation: He is lacking / He exceeded expectations / He is better than expectations]."
        5.In "highlights", include specific screening results in "strengths" (if good) or "gaps" (if poor).
        Respond ONLY with a valid JSON object.
        {{
          "score": (integer),
          "analysis": (string),
          "highlights": {{
            "strengths": [list],
            "gaps": [list],
            "ratings": {{"Technical":0-10,"Experience":0-10,"Context":0-10}}
          }}
        }}
        """
        chat=client.chat.completions.create(
            messages=[{"role":"user","content":prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type":"json_object"}
        )
        res=json.loads(chat.choices[0].message.content)
        return{
            "score":res.get("score",0),
            "analysis":res.get("analysis","No analysis provided."),
            "highlights":res.get("highlights",{"strengths":[],"gaps":[],"ratings":{"Technical":0,"Experience":0,"Context":0}})
        }
    except Exception as e:
        print("Groq API Error:",e)
        return {
            "score":0,
            "analysis":f"Analysis failed: {str(e)}",
            "highlights":{"strengths":[],"gaps":["Processing Error"],"ratings":{"Technical":0,"Experience":0,"Context":0}}
        }

def calculate_profile_strength(profile):
    score=0
    if profile.photo:score+=10
    if profile.headline:score+=10
    if profile.summary:score+=10
    if profile.education:score+=20
    if profile.experiences:score+=20
    if profile.skills and (profile.skills.get('technical') or profile.skills.get('soft')):score+=20
    if profile.projects:score+=10
    return min(score,100)

def send_mail_async(subject, message, from_email, recipient_list, html_message=None):
    import threading
    from django.core.mail import send_mail
    def run():
        for email in recipient_list:
            if not email:
                continue
            try:
                send_mail(subject, message, from_email, [email], html_message=html_message, fail_silently=False)
            except Exception as e:
                print(f"Error sending email to {email}: {e}")
    threading.Thread(target=run, daemon=True).start()