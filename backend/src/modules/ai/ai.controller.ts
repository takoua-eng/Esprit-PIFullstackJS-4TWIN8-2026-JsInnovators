import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
export class AiController {
	constructor(private readonly aiService: AiService) {}

	@UseGuards(JwtAuthGuard)
	@Post('chat')
	async chat(@Body() body: { message: string; patientContext?: any }) {
		const { message, patientContext } = body || { message: '', patientContext: undefined };
		const response = await this.aiService.chatWithPatient(message, patientContext);
		return { response };
	}
}
