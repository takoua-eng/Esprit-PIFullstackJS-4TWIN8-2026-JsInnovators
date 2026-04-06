import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type SeverityPreset = 'high' | 'medium' | 'low';

export type SuggestDoctorMessageDto = {
  patientName: string;
  summary: string;
  severityPreset: SeverityPreset;
  sourceType?: 'vital' | 'symptom';
  parameter?: string;
};

@Injectable()
export class ClinicalAiSuggestionService {
  private readonly logger = new Logger(ClinicalAiSuggestionService.name);

  constructor(private readonly config: ConfigService) {}

  async suggestDoctorMessage(
    body: SuggestDoctorMessageDto,
  ): Promise<{ message: string; source: 'groq' | 'template' }> {
    const template = this.templateFallback(body);
    const key = this.config.get<string>('GROQ_API_KEY')?.trim();
    if (!key) {
      return { message: template, source: 'template' };
    }
    try {
      const text = await this.callGroq(key, body);
      return { message: text, source: 'groq' };
    } catch (e) {
      this.logger.warn(`Groq suggestion failed: ${(e as Error).message}`);
      return { message: template, source: 'template' };
    }
  }

  private templateFallback(body: SuggestDoctorMessageDto): string {
    const name = body.patientName?.trim() || 'there';
    const ctx = body.summary?.trim() || 'your recent health update';
    if (body.severityPreset === 'high') {
      return `Hello ${name}, this is your medical team. We reviewed: ${ctx}. If you develop chest pain, trouble breathing, confusion, severe worsening, or symptoms that concern you, seek urgent care or call emergency services.`;
    }
    if (body.severityPreset === 'medium') {
      return `Hello ${name}, we reviewed your update: ${ctx}. Please monitor your symptoms, rest, stay hydrated as appropriate, and contact the clinic if anything worsens or new symptoms appear.`;
    }
    return `Hello ${name}, thank you for the update (${ctx}). Continue your usual care plan unless something changes; contact us with any questions.`;
  }

  private async callGroq(
    apiKey: string,
    body: SuggestDoctorMessageDto,
  ): Promise<string> {
    const preset = body.severityPreset;
    const tone =
      preset === 'high'
        ? 'High urgency: include when to seek emergency care. Be brief.'
        : preset === 'medium'
          ? 'Moderate: monitoring and when to call the clinic. Be brief.'
          : 'Low: reassuring routine guidance. Be brief.';
    const prompt = `You help doctors message patients. ${tone}
Write ONE short patient-facing message (max 4 sentences, plain English). No diagnosis. Supportive and clear.
Patient name for greeting: ${body.patientName}.
Clinical context: ${body.summary}.
Output ONLY the message body.`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 240,
        temperature: 0.35,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`${res.status} ${errText.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('empty completion');
    return text;
  }
}
