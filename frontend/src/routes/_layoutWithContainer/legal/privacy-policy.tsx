import { createFileRoute } from "@tanstack/react-router";
import { Typography } from "@/components/ui/typography";

export const Route = createFileRoute("/_layoutWithContainer/legal/privacy-policy")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-2xl mx-auto space-y-7">
      <Typography variant="h2">Privacy Policy for Open Source Hub</Typography>

      <Typography>Effective Date: July 25, 2025</Typography>

      <Typography>
        Your privacy is important to us. This Privacy Policy explains how Open
        Source Hub collects, uses, and protects your personal information when
        you use our platform.
      </Typography>

      <Typography>1. Overview</Typography>

      <Typography>
        Open Source Hub is a community platform that enables developers to
        share, discover, and collaborate on open-source projects. Users
        authenticate through GitHub OAuth to access features such as project
        submissions, voting, and bookmarking.
      </Typography>

      <Typography>
        We collect only the minimum amount of personal data necessary to provide
        our services, and we do not sell or misuse your data.
      </Typography>

      <Typography>2. Data We Collect</Typography>

      <Typography>
        When you log in using GitHub OAuth, we collect the following information
        from your GitHub profile:
      </Typography>

      <ul className="list-disc space-y-1 pl-4">
        <li>GitHub user ID</li>
        <li>GitHub username</li>
        <li>Avatar image URL</li>
        <li>Public repository metadata (e.g., name, stars, description)</li>
        <li>Organization affiliations (if authorized)</li>
      </ul>

      <Typography>
        We do <strong>not</strong> collect:
      </Typography>

      <ul className="list-disc space-y-1 pl-4">
        <li>Your GitHub password</li>
        <li>Private repositories or their contents</li>
        <li>Sensitive personal information</li>
      </ul>

      <Typography>3. How We Use Your Data</Typography>

      <Typography>We use the data collected to:</Typography>

      <ul className="list-disc space-y-1 pl-4">
        <li>Authenticate users via GitHub OAuth</li>
        <li>Display public GitHub repository information</li>
        <li>Show your profile on projects you submit</li>
        <li>Enable voting, bookmarking, and filtering features</li>
        <li>Ensure repository ownership and validity</li>
      </ul>

      <Typography>
        We do not use your data for advertising, and we never sell your data to
        third parties.
      </Typography>

      <Typography>4. Repository Data</Typography>

      <Typography>
        When you submit a project, we store its public metadata in our database.
        If the repository is deleted or made private on GitHub, we may mark it
        as inactive or remove it.
      </Typography>

      <Typography>
        We do <strong>not</strong> clone, store, or modify your repository
        contents.
      </Typography>

      <Typography>5. Cookies and Analytics</Typography>

      <Typography>We use cookies to:</Typography>

      <ul className="list-disc space-y-1 pl-4">
        <li>Maintain login sessions</li>
        <li>Remember UI preferences (like theme settings)</li>
        <li>Collect anonymous analytics for improvements</li>
      </ul>

      <Typography>
        Analytics data may include anonymized IP addresses and device/browser
        information. This data is used solely to improve Open Source Hub and is
        not shared with third parties.
      </Typography>

      <Typography>6. Data Security</Typography>

      <Typography>
        We use industry-standard measures to protect your data, including:
      </Typography>

      <ul className="list-disc space-y-1 pl-4">
        <li>HTTPS encryption</li>
        <li>Token-based authentication</li>
        <li>Secure OAuth authentication via GitHub</li>
      </ul>

      <Typography>
        Your data is securely stored and only accessible to authorized personnel
        for technical support or moderation purposes.
      </Typography>

      <Typography>7. Your Rights</Typography>

      <Typography>You have the right to:</Typography>

      <ul className="list-disc space-y-1 pl-4">
        <li>Request access to the data we store about you</li>
        <li>Request deletion of your data and account</li>
        <li>
          Revoke GitHub OAuth authorization at any time via your GitHub settings
        </li>
      </ul>

      <Typography>To exercise your rights, please contact us.</Typography>

      <Typography>8. Third-Party Services</Typography>

      <Typography>
        Open Source Hub uses GitHub’s OAuth service for authentication. Your use
        of GitHub is subject to GitHub’s Privacy Policy, available at{" "}
        <a
          href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
          target="_blank"
          className="underline"
          rel="noreferrer"
        >
          https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement
        </a>
        .
      </Typography>

      <Typography>9. Changes to This Policy</Typography>

      <Typography>
        We may update this Privacy Policy from time to time. If changes are
        made, we will notify you by email or through a website notification.
      </Typography>

      <Typography>10. Contact</Typography>

      <Typography>
        If you have any questions or concerns regarding this Privacy Policy,
        please contact us.
      </Typography>
    </div>
  );
}
