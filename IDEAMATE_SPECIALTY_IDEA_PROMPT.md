# IdeaMate specialty idea-generation prompt

Create 50 original, safe, patient-facing content ideas for each of these specialties: General Physician, Internal Medicine, Family Medicine, Cardiology, Diabetology, Endocrinology, Dermatology, Neurology, Psychiatry, Pulmonology, Gastroenterology, Nephrology, Oncology, Paediatrics, Obstetrics & Gynaecology, Orthopaedics, Rheumatology, Urology, Ophthalmology, ENT, Emergency Medicine, Radiology, Dentistry, Conservative Dentistry, Dental Public Health, Endodontics, Implant Dentistry, Maxillofacial Surgery, Oral Medicine, Oral Surgery, Orthodontics, Paediatric Dentistry, Periodontics, Prosthodontics, Public Health Dentistry, Ayurveda, and Homeopathy.

For now, generate one idea per specialty as a representative sample. Avoid diagnosis, prescribing, guarantees, or advice that could replace a clinician. Keep ideas practical, culturally adaptable, and suitable for short educational videos.

Return only valid JSON, with no Markdown fences, using exactly this format:

[
  {
    "specialty": "General Physician",
    "title": "A concise patient-facing idea title",
    "description": "The clinical angle, audience question, and key points to cover.",
    "category": "Patient education",
    "subcategory": "Preventive care",
    "format": "Talking Head"
  }
]

Use one object for each requested specialty. When the full version is requested, return exactly 50 objects per specialty, preserve the same keys, and keep every title distinct. I will place the JSON output in the repository root so IdeaMate can import it.
