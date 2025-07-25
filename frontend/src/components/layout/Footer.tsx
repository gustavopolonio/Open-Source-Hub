import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/ui/logo";
import { Typography } from "@/components/ui/typography";

export function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="bg-muted border-t">
      <div className="max-w-5xl flex justify-between mx-auto py-10 px-4 max-md:flex-col max-md:items-center max-md:gap-10 max-md:text-center">
        <div className="max-w-96 space-y-2">
          <Link to="/" className="flex max-md:justify-center">
            <Logo />
          </Link>

          <Typography className="text-sm">
            Open Source Hub is a platform to connect developers with open-source
            opportunities effectively.
          </Typography>

          <Typography className="text-sm">
            &copy; {new Date().getFullYear()} - All rights reserved
          </Typography>

          <Typography className="text-sm">Developed by Gustavo</Typography>
        </div>

        <div className="flex gap-15 max-sm:flex-col max-sm:gap-10">
          <div className="space-y-2">
            <Typography variant="h3" className="text-lg">
              Links
            </Typography>

            <ul className="space-y-1">
              <li>
                <Link to="/" className="text-sm hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-sm hover:underline">
                  All projects
                </Link>
              </li>

              {isAuthenticated && (
                <>
                  <li>
                    <Link
                      to="/projects/submit"
                      className="text-sm hover:underline"
                    >
                      Submit yours
                    </Link>
                  </li>
                  <li>
                    <Link to="/account" className="text-sm hover:underline">
                      Account settings
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-2">
            <Typography variant="h3" className="text-lg">
              Legal
            </Typography>

            <ul className="space-y-1">
              <li>
                <Link to="/legal/terms" className="text-sm hover:underline">
                  Terms of service
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/privacy-policy"
                  className="text-sm hover:underline"
                >
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
