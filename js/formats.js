/**
 * Content OS for Doctors — Script Formats & Content Balancing Taxonomy
 * Easily extensible formats with archetype metadata for calendar balancing.
 */

export const scriptFormats = [
  {
    id: 'talking_head',
    name: 'Talking Head',
    category: 'education',
    duration: '45s',
    icon: '🗣️',
    description: 'Direct-to-camera clinical tip with authoritative clarity and empathetic delivery.',
    promptInstruction: 'Write a direct-to-camera hook, 3 concise points, and a single clear takeaway.'
  },
  {
    id: 'patient_story',
    name: 'Patient Story',
    category: 'story',
    duration: '60s',
    icon: '🩺',
    description: 'Anonymized narrative: symptom discovery to diagnosis, treatment, and recovery.',
    promptInstruction: 'Start with the emotional patient presentation, reveal the hidden cause, and end with the clinical lesson.'
  },
  {
    id: 'myth_vs_fact',
    name: 'Myth vs Fact',
    category: 'myth_busting',
    duration: '45s',
    icon: '⚖️',
    description: 'Busting a common, dangerous medical misconception with evidence-based facts.',
    promptInstruction: 'Rapid-fire debunking of 2-3 persistent myths followed by the exact science in simple language.'
  },
  {
    id: 'qa',
    name: 'Q&A Consultation',
    category: 'education',
    duration: '40s',
    icon: '❓',
    description: 'Answering a question every patient asks in clinic using plain, jargon-free language.',
    promptInstruction: 'State the exact patient question as the hook, explain why it happens, and give actionable guidance.'
  },
  {
    id: 'whiteboard',
    name: 'Whiteboard / Concept Breakdown',
    category: 'breakdown',
    duration: '60s',
    icon: '📋',
    description: 'Conceptual breakdown using a simple everyday analogy (plumbing, wiring, traffic).',
    promptInstruction: 'Use a vivid physical analogy to explain the underlying anatomy/physiology so anyone gets it immediately.'
  },
  {
    id: 'consultation_pov',
    name: 'Consultation POV',
    category: 'story',
    duration: '50s',
    icon: '👁️',
    description: 'Puts the viewer in the patient chair across the doctor desk, speaking to them directly.',
    promptInstruction: 'Speak directly to "you" as if sitting in the consult room discussing their latest test results or symptoms.'
  },
  {
    id: 'carousel',
    name: 'Step-by-Step Carousel',
    category: 'breakdown',
    duration: 'Slide-deck',
    icon: '📑',
    description: 'A 7-slide written guide with headline, concise body bullets, and final saveable summary.',
    promptInstruction: 'Format as Slide 1 (Hook), Slides 2-6 (Bite-sized points), Slide 7 (Summary + CTA).'
  },
  {
    id: 'podcast_clip',
    name: 'Podcast Conversation',
    category: 'conversational',
    duration: '50s',
    icon: '🎙️',
    description: 'Off-the-cuff, candid conversation about a controversial or overlooked clinical topic.',
    promptInstruction: 'Write as an unfiltered, thoughtful reflection on clinical practice that challenges conventional thinking.'
  },
  {
    id: 'interview',
    name: 'Doctor & Patient Interview',
    category: 'conversational',
    duration: '60s',
    icon: '👥',
    description: 'Dialogue format between an interviewer / patient and the doctor explaining the treatment.',
    promptInstruction: 'Host asks a probing question, doctor delivers the reassuring, evidence-based answer.'
  },
  {
    id: 'news_reaction',
    name: 'Medical News Reaction',
    category: 'myth_busting',
    duration: '45s',
    icon: '📰',
    description: 'Reacting to a trending health headline or viral social media fad with scientific reality.',
    promptInstruction: 'Cite the viral claim immediately, evaluate whether the science supports it, and give doctor advice.'
  }
];

export function getFormatById(id) {
  return scriptFormats.find((f) => f.id === id) || {
    id,
    name: id,
    category: 'education',
    duration: '45s',
    icon: '💡',
    description: 'Clinical health content.'
  };
}
