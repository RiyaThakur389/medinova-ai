const Groq = require('groq-sdk');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Initialize Groq client
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const SYSTEM_PROMPTS = {
  symptomChecker: `You are MediNova AI's symptom analysis assistant. When a user provides symptoms, analyze them and provide:
1. Possible conditions (list 3-5 with likelihood %)
2. Urgency level (Low/Medium/High/Emergency)
3. Recommended actions
4. When to seek immediate care
Always include a disclaimer that this is not a medical diagnosis and the user should consult a doctor.
Format your response in a clear, structured way.`,

  chatbot: `You are MediNova AI's health assistant chatbot. You help patients with:
- General health questions
- Understanding medical terms
- Appointment guidance
- Medication information
- Healthy lifestyle tips
Be empathetic, clear, and always recommend consulting a doctor for specific medical concerns.
Do not provide specific diagnoses or replace professional medical advice.`,

  prescriptionAssistant: `You are MediNova AI's prescription assistant for licensed medical doctors only.
Based on the diagnosis and symptoms provided, suggest:
1. Possible medication options with standard dosages
2. Common treatment protocols
3. Lab tests to consider
4. Contraindications to be aware of
5. Follow-up recommendations
Always note that the doctor should use their clinical judgment and verify drug interactions.`,

  reportSummary: `You are MediNova AI's medical report summarizer.
Convert complex medical reports into simple, patient-friendly language:
1. Main findings (in simple terms)
2. What the results mean
3. Normal vs abnormal values explained simply
4. Key points the patient should know
5. Questions to ask their doctor
Use simple English, avoid jargon, and be reassuring while being accurate.`
};

// @desc    AI Symptom Checker
// @route   POST /api/ai/symptom-check
// @access  Private (Patient)
const symptomChecker = asyncHandler(async (req, res) => {
  const { symptoms, age, gender, medicalHistory } = req.body;

  if (!symptoms) return res.status(400).json({ success: false, message: 'Symptoms are required' });

  const groq = getGroqClient();

  const userMessage = `Patient Information:
- Age: ${age || 'Not provided'}
- Gender: ${gender || 'Not provided'}
- Medical History: ${medicalHistory || 'None mentioned'}
- Current Symptoms: ${symptoms}

Please analyze these symptoms and provide a detailed assessment.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.symptomChecker },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 1000,
    temperature: 0.3
  });

  const response = completion.choices[0]?.message?.content;

  res.json({ success: true, analysis: response });
});

// @desc    AI Chatbot
// @route   POST /api/ai/chat
// @access  Private
const aiChat = asyncHandler(async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

  const groq = getGroqClient();

  // Build message history
  const messages = [
    { role: 'system', content: SYSTEM_PROMPTS.chatbot },
    ...conversationHistory.slice(-10), // Keep last 10 messages for context
    { role: 'user', content: message }
  ];

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages,
    max_tokens: 500,
    temperature: 0.7
  });

  const response = completion.choices[0]?.message?.content;

  res.json({ success: true, response, role: 'assistant' });
});

// @desc    AI Prescription Assistant (Doctors only)
// @route   POST /api/ai/prescription-assist
// @access  Doctor
const prescriptionAssistant = asyncHandler(async (req, res) => {
  const { diagnosis, symptoms, patientAge, allergies, currentMedications } = req.body;

  if (!diagnosis) return res.status(400).json({ success: false, message: 'Diagnosis is required' });

  const groq = getGroqClient();

  const userMessage = `Clinical Information:
- Diagnosis: ${diagnosis}
- Symptoms: ${symptoms || 'Not specified'}
- Patient Age: ${patientAge || 'Not specified'}
- Known Allergies: ${allergies?.join(', ') || 'None'}
- Current Medications: ${currentMedications?.join(', ') || 'None'}

Please provide prescription recommendations.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.prescriptionAssistant },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 1000,
    temperature: 0.2
  });

  const suggestions = completion.choices[0]?.message?.content;

  res.json({ success: true, suggestions });
});

// @desc    AI Report Summary
// @route   POST /api/ai/report-summary
// @access  Private
const reportSummary = asyncHandler(async (req, res) => {
  const { reportText, reportType } = req.body;

  if (!reportText) return res.status(400).json({ success: false, message: 'Report text is required' });

  const groq = getGroqClient();

  const userMessage = `Report Type: ${reportType || 'Medical Report'}

Report Content:
${reportText}

Please summarize this in simple, patient-friendly language.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.reportSummary },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 800,
    temperature: 0.3
  });

  const summary = completion.choices[0]?.message?.content;

  res.json({ success: true, summary });
});

module.exports = { symptomChecker, aiChat, prescriptionAssistant, reportSummary };
