import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type HospitalizationHandwritingExtract = {
  admissionDate: string;
  dischargeDate: string;
  dischargeUnit: string;
  primaryDiagnosis: string;
  hospitalizationReason: string;
  secondaryDiagnoses: string;
  proceduresPerformed: string;
  dischargeSummaryNotes: string;
  source: 'groq';
};

const DEFAULT_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

@Injectable()
export class HospitalizationHandwritingService {
  private readonly logger = new Logger(HospitalizationHandwritingService.name);

  constructor(private readonly config: ConfigService) {}

  async parseImage(
    buffer: Buffer,
    mimeType: string,
  ): Promise<HospitalizationHandwritingExtract> {
    const key = this.config.get<string>('GROQ_API_KEY')?.trim();
    if (!key) {
      throw new ServiceUnavailableException({
        code: 'GROQ_UNAVAILABLE',
        message: 'Set GROQ_API_KEY in backend .env to enable handwriting import.',
      });
    }

    const model =
      this.config.get<string>('GROQ_VISION_MODEL')?.trim() ||
      DEFAULT_VISION_MODEL;
    const dataUrl = this.toDataUrl(mimeType, buffer);

    const prompt = `You are reading a photo of a clinical document. The text may be typed or handwritten, in English or French.
Extract hospitalization information for a nurse form. Return ONLY a JSON object with these exact keys (use "" when unknown or illegible):
- "admissionDate": date as yyyy-mm-dd or dd/mm/yyyy if you can read it, else ""
- "dischargeDate": same
- "dischargeUnit": ward/service name in plain text, else ""
- "primaryDiagnosis": ICD-10 code and/or diagnosis text, else ""
- "hospitalizationReason": reason for admission, else ""
- "secondaryDiagnoses": secondary diagnoses as text, else ""
- "proceduresPerformed": procedures or surgeries performed, else ""
- "dischargeSummaryNotes": discharge summary or notes, else ""

Do not include markdown, comments, or text outside the JSON object.`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: dataUrl },
              },
            ],
          },
        ],
        max_completion_tokens: 2048,
        temperature: 0.15,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      this.logger.warn(`Groq vision HTTP ${res.status}: ${errText.slice(0, 400)}`);
      throw new BadRequestException(
        'Could not analyze the image with the AI service. Try another photo or use OCR.',
      );
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new BadRequestException('Empty response from vision model.');
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = this.parseJsonContent(content) as Record<string, unknown>;
    } catch (e) {
      this.logger.warn(`Vision JSON parse failed: ${(e as Error).message}`);
      throw new BadRequestException('Invalid JSON from vision model.');
    }

    return {
      admissionDate: this.str(parsed['admissionDate']),
      dischargeDate: this.str(parsed['dischargeDate']),
      dischargeUnit: this.str(parsed['dischargeUnit']),
      primaryDiagnosis: this.str(parsed['primaryDiagnosis']),
      hospitalizationReason: this.str(
        parsed['hospitalizationReason'] ?? parsed['reasonForHospitalization'],
      ),
      secondaryDiagnoses: this.str(parsed['secondaryDiagnoses']),
      proceduresPerformed: this.str(
        parsed['proceduresPerformed'] ?? parsed['procedures'],
      ),
      dischargeSummaryNotes: this.str(
        parsed['dischargeSummaryNotes'] ?? parsed['discharge_summary'],
      ),
      source: 'groq',
    };
  }

  private str(v: unknown): string {
    if (v == null) return '';
    const s = String(v).trim();
    return s;
  }

  private parseJsonContent(content: string): unknown {
    let s = content.trim();
    const fence = /^```(?:json)?\s*([\s\S]*?)```$/im.exec(s);
    if (fence) s = fence[1].trim();
    return JSON.parse(s) as unknown;
  }

  private toDataUrl(mimeType: string, buffer: Buffer): string {
    const m =
      mimeType === 'image/jpg' ? 'image/jpeg' : mimeType.toLowerCase();
    if (!/^image\/(jpeg|png|webp)$/.test(m)) {
      throw new BadRequestException(
        'Unsupported image type. Use JPEG, PNG, or WebP.',
      );
    }
    const b64 = buffer.toString('base64');
    return `data:${m};base64,${b64}`;
  }
}
