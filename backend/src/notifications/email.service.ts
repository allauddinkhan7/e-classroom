import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: nodemailer.Transporter; 
  /* without ! Because strict property initialization is enabled, TypeScript complains: Property 'transporter' has no initializer and is not definitely assigned in the constructor 
  This is a TypeScript strict-property-initialization issue.
  The confusing part is that you know NestJS will initialize transporter later, but TypeScript doesn't know that.

  private transporter: nodemailer.Transporter;
                        ↑
                currently undefined


  TypeScript does not understand NestJS lifecycle hooks.

  TypeScript basically looks at your class and thinks:

    constructor()
        ↓
    Is transporter initialized?
        ↓
    NO ❌

    It doesn't reason:

    NestJS creates EmailService
            ↓
    NestJS calls onModuleInit()
            ↓
    transporter gets initialized
            ↓
    sendMail() is called later

    NestJS knows this lifecycle. TypeScript doesn't.



    So what does ! mean?

    When you write:

    private transporter!: nodemailer.Transporter;

    the ! is called the definite assignment assertion.

    You're telling TypeScript:

    "I know this property isn't initialized here, but trust me — it will definitely be initialized before I use it."
  
  */

  async onModuleInit() {
    // Ethereal generates a free, throwaway inbox on the fly — no signup,
    // no real email is ever actually delivered anywhere. Perfect for dev.
    const testAccount = await nodemailer.createTestAccount();

    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    this.logger.log(`Ethereal test inbox ready: ${testAccount.user}`);
  }

  async sendMail(to: string, subject: string, html: string) {
    const info = await this.transporter.sendMail({
      from: '"E-Classroom" <no-reply@eclassroom.dev>',
      to,
      subject,
      html,
    });

    // This is the actual point of Ethereal: instead of a real inbox,
    // it gives you a URL where you can view the email that "would have" sent.
    const previewUrl = nodemailer.getTestMessageUrl(info);
    this.logger.log(`Email sent — preview: ${previewUrl}`);

    return { previewUrl };
  }
}