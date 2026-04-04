export const EMAIL_TEMPLATES = [
  {
    id: 1,
    name: 'Interview Schedule',
    category: 'HR',
    description: 'Candidate interview schedule notification',
    subject: 'Interview Scheduled – {{designation}} at {{companyName}}',
    body: `
      <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto;">
        <p>Dear <strong>{{candidateName}}</strong>,</p>
        <p>We are pleased to inform you that your interview has been scheduled.</p>
        <table style="width:100%; border-collapse:collapse; margin:16px 0;">
          <tr style="background:#f0f4f4;">
            <td style="padding:10px; border:1px solid #ddd; font-weight:600;">Position</td>
            <td style="padding:10px; border:1px solid #ddd;">{{designation}}</td>
          </tr>
          <tr>
            <td style="padding:10px; border:1px solid #ddd; font-weight:600;">Date</td>
            <td style="padding:10px; border:1px solid #ddd;">{{interviewDate}}</td>
          </tr>
          <tr style="background:#f0f4f4;">
            <td style="padding:10px; border:1px solid #ddd; font-weight:600;">Time</td>
            <td style="padding:10px; border:1px solid #ddd;">{{interviewTime}}</td>
          </tr>
          <tr>
            <td style="padding:10px; border:1px solid #ddd; font-weight:600;">Mode</td>
            <td style="padding:10px; border:1px solid #ddd;">{{interviewMode}}</td>
          </tr>
          <tr style="background:#f0f4f4;">
            <td style="padding:10px; border:1px solid #ddd; font-weight:600;">Interviewer</td>
            <td style="padding:10px; border:1px solid #ddd;">{{panelistName}}</td>
          </tr>
        </table>
        <p>Please join using the link: <a href="{{interviewLink}}">{{interviewLink}}</a></p>
        <p>Best regards,<br/><strong>{{hrName}}</strong><br/>{{companyName}}</p>
      </div>`,
  },
  {
    id: 2,
    name: 'Offer Letter',
    category: 'HR',
    description: 'Formal offer letter with CTC details',
    subject: 'Job Offer – {{designation}} at {{companyName}}',
    body: `
      <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto;">
        <p>Dear <strong>{{candidateName}}</strong>,</p>
        <p>We are delighted to offer you the position of <strong>{{designation}}</strong> 
        at <strong>{{companyName}}</strong>.</p>
        <p><strong>Annual CTC:</strong> {{annualCTC}}</p>
        <p><strong>Joining Date:</strong> {{joiningDate}}</p>
        <p><strong>Department:</strong> {{department}}</p>
        <p>Please confirm your acceptance by <strong>{{offerExpiry}}</strong>.</p>
        <p>We look forward to welcoming you to our team.</p>
        <p>Warm regards,<br/><strong>{{hrName}}</strong><br/>{{companyName}}</p>
      </div>`,
  },
  {
    id: 3,
    name: 'Welcome Onboard',
    category: 'Onboarding',
    description: 'Friendly welcome email for new employees',
    subject: 'Welcome to {{companyName}}, {{employeeName}}!',
    body: `
      <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto;">
        <h2 style="color:#0d5f68;">Welcome aboard, {{employeeName}}! 🎉</h2>
        <p>We are thrilled to have you join <strong>{{companyName}}</strong> 
        as <strong>{{designation}}</strong>.</p>
        <p><strong>Your Employee ID:</strong> {{employeeId}}</p>
        <p><strong>Reporting Manager:</strong> {{managerName}}</p>
        <p><strong>Joining Date:</strong> {{joiningDate}}</p>
        <p>If you have any questions, feel free to reach out to 
        <a href="mailto:{{hrEmail}}">{{hrEmail}}</a>.</p>
        <p>Best wishes,<br/><strong>{{hrName}}</strong><br/>HR Team, {{companyName}}</p>
      </div>`,
  },
  {
    id: 4,
    name: 'Rejection Email',
    category: 'HR',
    description: 'Professional candidate rejection notification',
    subject: 'Update on Your Application – {{companyName}}',
    body: `
      <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto;">
        <p>Dear <strong>{{candidateName}}</strong>,</p>
        <p>Thank you for your interest in the <strong>{{designation}}</strong> 
        position at <strong>{{companyName}}</strong>.</p>
        <p>After careful consideration, we regret to inform you that we will 
        not be moving forward with your application at this time.</p>
        <p>We appreciate the time you invested and encourage you to apply 
        for future openings.</p>
        <p>Best regards,<br/><strong>{{hrName}}</strong><br/>{{companyName}}</p>
      </div>`,
  },
  {
    id: 5,
    name: 'Password Reset',
    category: 'Security',
    description: 'Security-focused password reset notification',
    subject: 'Password Reset Request – {{companyName}}',
    body: `
      <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto;">
        <p>Dear <strong>{{employeeName}}</strong>,</p>
        <p>We received a request to reset your password for your 
        <strong>{{companyName}}</strong> account.</p>
        <p>If you did not request this, please ignore this email or contact 
        <a href="mailto:{{hrEmail}}">{{hrEmail}}</a> immediately.</p>
        <p>Best regards,<br/>IT Security Team<br/>{{companyName}}</p>
      </div>`,
  },
];

export const TEMPLATE_CATEGORIES = [
  'All', 'HR', 'Onboarding', 'Security',
  'Finance', 'Marketing', 'System', 'Internal',
];
