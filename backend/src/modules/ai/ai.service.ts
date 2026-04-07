import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
	private readonly logger = new Logger(AiService.name);
	private client: any | null = null;
	private model: string;

	constructor(private config: ConfigService) {
		const key = this.config.get<string>('GEMINI_API_KEY') || this.config.get<string>('GEMINI_KEY');
		this.model = this.config.get<string>('GEMINI_MODEL') || 'models/gemini-2.5-flash';

		if (key) {
			try {
				this.client = new GoogleGenAI({ apiKey: key });
			} catch (err) {
				this.logger.error('Failed to initialize Gemini client', err as any);
				this.client = null;
			}
		} else {
			this.logger.warn('GEMINI_API_KEY not set; AI service will use fallback replies');
		}
	}

	async chatWithPatient(message: string, patientContext?: any): Promise<string> {
		const systemPrompt = `Tu es un assistant de santé destiné aux patients. Tu fournis des conseils généraux, non prescriptifs, et tu ne fais pas de diagnostic ni ne recommandes de médicaments. Si la question semble urgente ou dangereuse, conseille de contacter un professionnel ou les services d'urgence. Limite les réponses à des conseils simples et clairs.`;

		const contextText = patientContext
			? `Contexte patient: ${typeof patientContext === 'string' ? patientContext : JSON.stringify(patientContext)}\n`
			: '';

		const prompt = `${systemPrompt}\n${contextText}\nQuestion: ${message}\nRéponse:`;

		if (!this.client) {
			return this.generateFallbackReply(message);
		}

		try {
			const res = await this.client.models.generateContent({
				model: this.model,
				contents: prompt,
				temperature: 0.2,
				maxOutputTokens: 512,
			});

			// extract text from various response shapes
			const text = this.extractTextFromResponse(res).trim();
			if (!text) return this.generateFallbackReply(message);

			return text;
		} catch (err: any) {
			this.logger.error('Gemini request failed', err?.message || err);
			return this.generateFallbackReply(message);
		}
	}

	private generateFallbackReply(_userMessage: string): string {
		return `Je suis désolé, le service d'assistance n'est pas disponible pour le moment. Voici quelques conseils généraux : restez hydraté, reposez-vous, surveillez vos symptômes et contactez votre professionnel de santé si vos symptômes s'aggravent ou si vous avez des signes d'urgence (douleur intense, difficulté à respirer, saignement important, perte de conscience). Je ne fournis pas de diagnostics ni de prescriptions.`;
	}

	private extractTextFromResponse(res: any): string {
		const extract = (c: any): string => {
			if (c === null || c === undefined) return '';
			if (typeof c === 'string') return c;
			if (Array.isArray(c)) return c.map(extract).join('');
			if (typeof c === 'object') {
				if (Array.isArray(c.parts)) return c.parts.map((p: any) => p.text ?? extract(p)).join('');
				if (Array.isArray(c.content)) return c.content.map(extract).join('');
				if (typeof c.text === 'string') return c.text;
				// try first element if looks like an indexed object
				if (c[0]) return extract(c[0]);
				// fallback: join string values
				return Object.values(c).map(extract).join(' ');
			}
			return '';
		};

		if (res?.candidates && Array.isArray(res.candidates) && res.candidates[0]) {
			return extract(res.candidates[0].content || res.candidates[0]);
		}
		if (res?.output && Array.isArray(res.output) && res.output[0]?.content) {
			return extract(res.output[0].content);
		}
		if (res?.result && typeof res.result === 'string') return res.result;
		return '';
	}
}
