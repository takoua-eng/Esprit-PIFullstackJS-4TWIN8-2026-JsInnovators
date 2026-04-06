import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const twilio = require('twilio');

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;
  private twilioClient: any;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_APP_PASSWORD'),
      },
    });
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioClient = twilio(accountSid, authToken);
  }

  // ─── OpenAI API proxy ─────────────────────────────────────────

  async askAI(prompt: string, maxTokens = 600): Promise<string> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY not configured in .env');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        max_tokens: maxTokens,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful medical coordinator assistant for MediFollow, a post-hospitalization monitoring system.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.choices?.[0]?.message?.content || 'No response generated.';
  }

  // ─── Email ────────────────────────────────────────────────────

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"MediFollow" <${this.configService.get('GMAIL_USER')}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      return false;
    }
  }

  // ─── SMS ──────────────────────────────────────────────────────

  async sendSms(to: string, message: string): Promise<boolean> {
    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to,
      });
      this.logger.log(`SMS sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}: ${error.message}`);
      return false;
    }
  }

  // ─── Email HTML builder ───────────────────────────────────────

  buildEmailHtml(
    patientName: string,
    message: string,
    missingVitals: string[],
    missingSymptoms: string[],
  ): string {
    const vitalsSection =
      missingVitals.length > 0
        ? `<div style="margin:12px 0;padding:12px 16px;background:#fef2f2;border-left:4px solid #ef4444;border-radius:4px;">
          <strong style="color:#991b1b;">Missing Vital Parameters:</strong>
          <ul style="margin:8px 0 0 0;padding-left:20px;color:#374151;">
            ${missingVitals.map((f) => `<li>${f}</li>`).join('')}
          </ul></div>`
        : '';

    const symptomsSection =
      missingSymptoms.length > 0
        ? `<div style="margin:12px 0;padding:12px 16px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:4px;">
          <strong style="color:#92400e;">Missing Symptom Report:</strong>
          <ul style="margin:8px 0 0 0;padding-left:20px;color:#374151;">
            ${missingSymptoms.map((f) => `<li>${f}</li>`).join('')}
          </ul></div>`
        : '';

    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:0;">
        <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:32px;text-align:center;">
            <span style="color:#60cdff;font-weight:700;font-size:14px;">🏥 MEDI-FOLLOW</span>
            <h1 style="color:white;margin:12px 0 0;font-size:22px;">Daily Health Reminder</h1>
          </div>
          <div style="padding:28px 32px;">
            <p style="color:#374151;font-size:16px;">Dear <strong>${patientName}</strong>,</p>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">${message}</p>
            ${vitalsSection}${symptomsSection}
            <div style="margin-top:24px;padding:16px;background:#f0f9ff;border-radius:10px;border:1px solid #bae6fd;">
              <p style="color:#0369a1;font-size:13px;margin:0;">📋 Please log in to MediFollow and complete your daily follow-up.</p>
            </div>
          </div>
          <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">Automated message from MediFollow. Do not reply.</p>
          </div>
        </div>
      </body></html>`;
  }

  buildSmsMessage(
    patientName: string,
    missingVitals: string[],
    missingSymptoms: string[],
  ): string {
    const firstName = patientName.split(' ')[0];
    const missing = [...missingVitals, ...missingSymptoms];
    if (missing.length === 0)
      return `MediFollow: Hi ${firstName}, please complete your daily health follow-up.`;
    const missingText =
      missing.slice(0, 3).join(', ') + (missing.length > 3 ? '...' : '');
    return `MediFollow: Hi ${firstName}, still missing: ${missingText}. Please submit now.`;
  }
}
