import { Singleton } from "typescript-ioc";
import { createTransport, Transporter } from "nodemailer";
import * as Isemail from "isemail";
import { getLogger, Logger } from "./logger";
import { config } from "../config";

/* eslint-disable @typescript-eslint/no-use-before-define */
@Singleton
export class MailService {
  private log: Logger = getLogger("ContactController");
  mailer: Transporter;

  constructor() {
    this.log.info(`SMTP configuration is `, config.smtp);
    this.mailer = createTransport(config.smtp);
  }

  /**
   * Send an email
   */
  async send(from: string, replyTo: string, to: Array<string>, subject: string, body: string): Promise<void> {
    this.log.info(`Sending email from -> ${from} | replyTo -> ${replyTo}`);

    // Checking
    if (!Isemail.validate(from)) throw new Error(`Email ${from} is not valid`);
    if (!Isemail.validate(replyTo)) throw new Error(`Email ${replyTo} is not valid`);
    if (!subject) throw new Error(`Sending an email with an empty subject is not allowed`);
    if (!body) throw new Error(`Sending an email with an empty body is not allowed`);
    if (to === undefined || to.length === 0) throw new Error(`You must specify a recipient.`);
    to.forEach((email: string) => {
      if (!Isemail.validate(email)) throw new Error(`Email ${email} is not valid`);
    });

    // Send email
    try {
      const email = { from: from, replyTo: replyTo, to: to.join(", "), subject: subject, text: body };
      this.log.debug(`Sending email`, email);
      await this.mailer.sendMail(email);
    } catch (error) {
      this.log.error(`An error occured when sending email`, error);
      throw new Error(error.message);
    }
  }
}
