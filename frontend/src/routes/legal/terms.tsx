import { createFileRoute } from "@tanstack/react-router";
import { Typography } from "@/components/ui/typography";

export const Route = createFileRoute("/legal/terms")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-2xl mx-auto space-y-7">
      <Typography variant="h2">
        Terms and Conditions for Open Source Hub
      </Typography>

      <Typography>Effective Date: July 25, 2025</Typography>

      <Typography>
        Welcome to Open Source Hub. By using our platform, you agree to be bound
        by the following terms and conditions. If you do not agree with these
        terms, please do not use our service.
      </Typography>

      <Typography>1. Overview</Typography>

      <Typography>
        Open Source Hub is a community-driven platform that allows users to
        discover, share, and contribute to open-source projects. Our goal is to
        connect developers with open-source opportunities efficiently through
        features like project submissions, tagging, filtering, and voting.
      </Typography>

      <Typography>
        Users authenticate via GitHub OAuth. Upon signing in, Open Source Hub
        may access select GitHub data such as repository details, organization
        affiliations, and basic account information, as authorized by the user.
      </Typography>

      <Typography>2. Accounts and GitHub Authentication</Typography>

      <Typography>
        To use the full features of Open Source Hub, you must log in using your
        GitHub account. By logging in, you grant Open Source Hub permission to
        access specific information associated with your GitHub account, which
        may include:
      </Typography>

      <ul className="list-disc space-y-1 pl-4">
        <li>Repository metadata (e.g., name, description, stars)</li>

        <li>Organization affiliations</li>

        <li>Basic profile information (e.g., GitHub user ID, avatar)</li>
      </ul>

      <Typography>
        We do not request or store your GitHub password. Authentication is
        handled securely through GitHub’s OAuth system.
      </Typography>

      <Typography>3. Project Submissions</Typography>

      <Typography>
        Users may submit public GitHub repositories to Open Source Hub. By
        submitting a repository, you represent that:
      </Typography>

      <ul className="list-disc space-y-1 pl-4">
        <li>
          You are the owner of the repository or have appropriate permission to
          share it.
        </li>

        <li>
          The repository adheres to all applicable laws and GitHub’s terms of
          service.
        </li>

        <li>
          The repository does not contain malicious code, spam, or inappropriate
          content.
        </li>
      </ul>

      <Typography>
        We reserve the right to remove any submitted project that violates our
        guidelines or GitHub’s policies.
      </Typography>

      <Typography>4. Repository Availability</Typography>

      <Typography>
        Open Source Hub stores metadata from GitHub repositories submitted by
        users. If a submitted repository is later deleted or made private on
        GitHub, Open Source Hub may mark the project as inactive or remove it
        from the platform.
      </Typography>

      <Typography>
        We may periodically verify the status of submitted repositories to
        ensure accuracy and relevance.
      </Typography>

      <Typography>5. Data Collection and Usage</Typography>

      <Typography>
        We collect minimal personal data, limited to what is provided through
        GitHub OAuth. This typically includes:
      </Typography>

      <ul className="list-disc space-y-1 pl-4">
        <li>GitHub user ID</li>

        <li>GitHub username</li>

        <li>Avatar URL</li>
      </ul>

      <Typography>
        We do not collect or store sensitive personal information like
        passwords.
      </Typography>

      <Typography>
        Additionally, we may collect non-personal data such as cookies and IP
        addresses to improve your experience on our platform. Please refer to
        our Privacy Policy for more information.
      </Typography>

      <Typography>6. Cookies and Analytics</Typography>

      <Typography>
        Open Source Hub uses cookies for essential functionality and analytics.
        By using our platform, you consent to our use of cookies.
      </Typography>

      <Typography>
        We use analytics tools to understand user behavior and improve the
        platform. No personally identifiable information is sold or shared with
        third parties for marketing purposes.
      </Typography>

      <Typography>7. Intellectual Property</Typography>

      <Typography>
        All projects submitted to Open Source Hub remain the intellectual
        property of their respective owners. We do not claim ownership of any
        GitHub repositories listed on our platform.
      </Typography>

      <Typography>8. Changes to Terms</Typography>

      <Typography>
        We may update these Terms and Conditions from time to time. When we do,
        we will notify users via email or through a notification on the website.
        Continued use of the platform after updates constitutes acceptance of
        the revised terms.
      </Typography>

      <Typography>9. Governing Law</Typography>

      <Typography>
        These Terms and Conditions are governed by and construed in accordance
        with the laws of Brazil, without regard to its conflict of law
        principles.
      </Typography>

      <Typography>10. Contact</Typography>

      <Typography>
        For questions or concerns about these terms, please contact us.
      </Typography>
    </div>
  );
}
