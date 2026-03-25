const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';
const USE_MOCK = true;

const SYSTEM_PROMPT = `You are MedBot, a helpful AI assistant for City General Hospital. You help patients and visitors with:
- Appointment scheduling and booking inquiries
- Department information (ER, ICU, Cardiology, Pediatrics, Radiology, Surgery, Pharmacy, Neurology, Orthopedics)
- Visiting hours: Monday-Friday 9AM-8PM, Weekends 10AM-6PM
- Emergency contacts: Emergency 911, Hospital Main +1-800-555-0100, ER Direct +1-800-555-0199
- Symptom guidance and health FAQs (always recommend consulting a doctor for medical decisions)
- Pharmacy hours: Monday-Friday 8AM-9PM, Weekends 9AM-5PM
- Insurance and billing: Billing department at extension 4400

Be professional, empathetic, and concise. Keep responses under 120 words. For emergencies, always direct users to call 911 or go to the Emergency Department immediately.`;

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MOCK_RESPONSES: Record<string, string> = {
  appointment:
    "I'd be happy to help you schedule an appointment! We have availability in most departments this week. Could you let me know which department or specialist you'd like to see? You can also call our scheduling line at +1-800-555-0100 for immediate booking.",
  visiting:
    "Our visiting hours are:\n- Monday to Friday: 9:00 AM - 8:00 PM\n- Weekends: 10:00 AM - 6:00 PM\n\nPlease check in at the front desk upon arrival. Each patient may have up to 2 visitors at a time. Children under 12 must be accompanied by an adult.",
  emergency:
    "If you're experiencing a medical emergency, please call 911 immediately or go to our Emergency Department, which is open 24/7.\n\nER Direct Line: +1-800-555-0199\n\nFor non-emergency urgent care, our Urgent Care Center is open daily from 8 AM to 10 PM.",
  pharmacy:
    "Our hospital pharmacy hours are:\n- Monday to Friday: 8:00 AM - 9:00 PM\n- Weekends: 9:00 AM - 5:00 PM\n\nWe accept most insurance plans. For prescription refills, please have your prescription number ready. You can also call the pharmacy at extension 3200.",
  department:
    "City General Hospital has the following departments:\n- Emergency & Trauma\n- Cardiology\n- Pediatrics\n- Radiology & Imaging\n- Surgery\n- Neurology\n- Orthopedics\n- ICU\n- Pharmacy\n\nWould you like more details about a specific department?",
  insurance:
    "For insurance and billing inquiries, please contact our Billing Department at extension 4400. We accept most major insurance plans including Medicare and Medicaid. Our billing team is available Monday-Friday, 8 AM - 5 PM. You can also access your billing statements through our patient portal.",
  hours:
    "City General Hospital is open 24/7 for emergency services.\n\nOutpatient services: Monday-Friday 7 AM - 7 PM\nPharmacy: Mon-Fri 8 AM - 9 PM, Weekends 9 AM - 5 PM\nVisiting hours: Mon-Fri 9 AM - 8 PM, Weekends 10 AM - 6 PM\nLab services: Monday-Saturday 6 AM - 6 PM",
  default:
    "Thank you for reaching out! I can help you with:\n- Appointment scheduling\n- Department information\n- Visiting hours\n- Emergency contacts\n- Pharmacy information\n- Insurance & billing questions\n\nWhat would you like to know more about?",
};

function getMockResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  if (msg.includes('appointment') || msg.includes('book') || msg.includes('schedule'))
    return MOCK_RESPONSES.appointment;
  if (msg.includes('visit') || msg.includes('visiting'))
    return MOCK_RESPONSES.visiting;
  if (msg.includes('emergency') || msg.includes('urgent') || msg.includes('911'))
    return MOCK_RESPONSES.emergency;
  if (msg.includes('pharmacy') || msg.includes('prescription') || msg.includes('medicine'))
    return MOCK_RESPONSES.pharmacy;
  if (msg.includes('department') || msg.includes('cardiology') || msg.includes('pediatric') || msg.includes('radiology') || msg.includes('surgery') || msg.includes('neurology') || msg.includes('orthopedic'))
    return MOCK_RESPONSES.department;
  if (msg.includes('insurance') || msg.includes('billing') || msg.includes('payment') || msg.includes('cost'))
    return MOCK_RESPONSES.insurance;
  if (msg.includes('hour') || msg.includes('open') || msg.includes('close') || msg.includes('time'))
    return MOCK_RESPONSES.hours;
  return MOCK_RESPONSES.default;
}

export async function sendMessage(
  messages: ConversationMessage[],
  apiKey: string,
): Promise<string> {
  if (USE_MOCK) {
    const lastUserMsg = messages.filter((m) => m.role === 'user').pop();
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));
    return getMockResponse(lastUserMsg?.content ?? '');
  }

  if (!apiKey) {
    throw new Error('API key not configured. Please set EXPO_PUBLIC_CLAUDE_API_KEY in your .env file.');
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as any)?.error?.message || `Request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text as string;
}
