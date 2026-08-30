import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',

      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  // =====================================================
  // APPLICATION CONFIRMATION - CANDIDATE
  // =====================================================

  async sendApplicationConfirmation(
    email: string,
    name: string,
    jobTitle: string,
    company: string,
  ) {
    await this.transporter.sendMail({
      from: `"CampusHire" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Application Submitted - ${jobTitle}`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 25px;
          color: #333;
        ">

          <h2 style="color: #5b21b6;">
            Application Submitted Successfully
          </h2>

          <p>Hello ${name},</p>

          <p>
            Your application has been successfully submitted
            through <strong>CampusHire</strong>.
          </p>

          <div style="
            background: #f5f3ff;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          ">

            <p>
              <strong>Job:</strong> ${jobTitle}
            </p>

            <p>
              <strong>Company:</strong> ${company}
            </p>

            <p>
              <strong>Status:</strong> Applied
            </p>

          </div>

          <p>
            The recruiter has been notified about your application.
          </p>

          <p>
            You can check your application status from
            your CampusHire account.
          </p>

          <br />

          <p>
            Best regards,<br />
            <strong>CampusHire Team</strong>
          </p>

        </div>
      `,
    });
  }

  // =====================================================
  // NEW APPLICATION - RECRUITER
  // =====================================================

  async sendRecruiterApplicationNotification(
    recruiterEmail: string,
    recruiterName: string,
    candidateName: string,
    candidateEmail: string,
    candidatePhone: string | undefined,
    jobTitle: string,
    company: string,
    coverMessage: string | undefined,
  ) {
    await this.transporter.sendMail({
      from: `"CampusHire" <${process.env.MAIL_USER}>`,
      to: recruiterEmail,
      subject: `New Application Received - ${jobTitle}`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 25px;
          color: #333;
        ">

          <h2 style="color: #5b21b6;">
            New Job Application
          </h2>

          <p>Hello ${recruiterName},</p>

          <p>
            You have received a new application for
            <strong>${jobTitle}</strong>
            at
            <strong>${company}</strong>.
          </p>

          <div style="
            background: #f5f3ff;
            padding: 18px;
            border-radius: 8px;
            margin: 20px 0;
          ">

            <h3>
              Candidate Details
            </h3>

            <p>
              <strong>Name:</strong>
              ${candidateName}
            </p>

            <p>
              <strong>Email:</strong>
              ${candidateEmail}
            </p>

            ${
              candidatePhone
                ? `
                  <p>
                    <strong>Phone:</strong>
                    ${candidatePhone}
                  </p>
                `
                : ''
            }

          </div>

          ${
            coverMessage
              ? `
                <div style="
                  background: #fafafa;
                  padding: 18px;
                  border-radius: 8px;
                  margin: 20px 0;
                ">

                  <h3>
                    Cover Message
                  </h3>

                  <p>
                    ${coverMessage}
                  </p>

                </div>
              `
              : ''
          }

          <p>
            Please log in to your
            <strong>CampusHire Recruiter Dashboard</strong>
            to review the application and resume.
          </p>

          <br />

          <p>
            Best regards,<br />
            <strong>CampusHire Team</strong>
          </p>

        </div>
      `,
    });
  }

  // =====================================================
  // APPLICATION STATUS UPDATE - CANDIDATE
  // =====================================================

  async sendApplicationStatusUpdate(
    email: string,
    name: string,
    jobTitle: string,
    company: string,
    status: string,
  ) {
    const isShortlisted =
      status === 'Shortlisted';

    const subject = isShortlisted
      ? `Application Shortlisted - ${jobTitle}`
      : `Application Update - ${jobTitle}`;

    const heading = isShortlisted
      ? 'Congratulations! Your Application Has Been Shortlisted'
      : 'Application Status Update';

    const message = isShortlisted
      ? `
          We are pleased to inform you that your application
          for <strong>${jobTitle}</strong> at
          <strong>${company}</strong> has been
          <strong>shortlisted</strong>.
        `
      : `
          Thank you for your interest in the
          <strong>${jobTitle}</strong> position at
          <strong>${company}</strong>.
          After reviewing your application, the recruiter
          has decided not to move forward with your application
          at this time.
        `;

    await this.transporter.sendMail({
      from: `"CampusHire" <${process.env.MAIL_USER}>`,
      to: email,
      subject,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 25px;
          color: #333;
        ">

          <h2 style="color: #5b21b6;">
            ${heading}
          </h2>

          <p>Hello ${name},</p>

          <p>
            ${message}
          </p>

          <div style="
            background: #f5f3ff;
            padding: 18px;
            border-radius: 8px;
            margin: 20px 0;
          ">

            <p>
              <strong>Job:</strong>
              ${jobTitle}
            </p>

            <p>
              <strong>Company:</strong>
              ${company}
            </p>

            <p>
              <strong>Status:</strong>
              ${status}
            </p>

          </div>

          ${
            isShortlisted
              ? `
                <p>
                  Please log in to your CampusHire account
                  for further updates.
                </p>
              `
              : `
                <p>
                  We appreciate the time you took to apply
                  and wish you the best in your job search.
                </p>
              `
          }

          <br />

          <p>
            Best regards,<br />
            <strong>CampusHire Team</strong>
          </p>

        </div>
      `,
    });
  }

  // =====================================================
  // VERIFY EMAIL CONNECTION
  // =====================================================

  async verifyConnection() {
    try {
      await this.transporter.verify();

      console.log(
        'Email server is ready to send messages',
      );

      return true;
    } catch (error) {
      console.error(
        'Email server connection failed:',
        error,
      );

      return false;
    }
  }
}