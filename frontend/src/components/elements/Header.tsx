import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { Logo } from "../ui/logo";

export function Header() {
  return (
    <div className="flex justify-between items-center max-w-7xl mx-auto h-16 px-4">
      <Link to="/">
        <Logo />
      </Link>
      <Button asChild>
        <Link to="/signup">Sign up</Link>
      </Button>
    </div>
  );
}
