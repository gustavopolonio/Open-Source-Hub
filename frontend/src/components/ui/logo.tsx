import { DoorOpen } from "lucide-react";
import { Button } from "./button";

export function Logo() {
  return (
    <Button size="icon" variant="ghost">
      <DoorOpen className="w-full! h-auto!" />
    </Button>
  );
}
