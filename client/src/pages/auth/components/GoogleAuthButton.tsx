import GoogleIcon from "@/assets/google-icon.svg";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";

interface GoogleAuthButtonProps {
  isFormSubmitting: boolean;
}

const googleAuthUri = `${import.meta.env.VITE_BASE_URL}/auth/google`;

function GoogleAuthButton({ isFormSubmitting }: GoogleAuthButtonProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const isDisabled = isNavigating || isFormSubmitting;

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsNavigating(false);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleClick = () => {
    setIsNavigating(true);
    window.location.assign(googleAuthUri);
  };

  return (
    <Button
      variant={"outline"}
      type="button"
      disabled={isDisabled}
      size={"lg"}
      onClick={handleClick}
    >
      {isNavigating ? <Spinner /> : <img src={GoogleIcon} className="size-4" />}{" "}
      Continue with Google
    </Button>
  );
}

export default GoogleAuthButton;
