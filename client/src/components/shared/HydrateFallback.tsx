import { LoaderIcon } from "lucide-react";

function HydrateFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="flex shimmer items-center gap-1 text-muted-foreground">
        <LoaderIcon className="size-5 animate-spin" />
        Loading...
      </span>
    </div>
  );
}

export default HydrateFallback;
