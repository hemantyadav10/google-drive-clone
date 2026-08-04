import { FieldContent } from "@/components/ui/field";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { checkPasswordStrength } from "@/lib/password-strength";

const STRENGTH_LABELS = [
  "Very weak",
  "Weak",
  "Fair",
  "Good",
  "Strong",
] as const;

const STRENGTH_COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-yellow-500",
  "bg-green-500",
  "bg-green-500",
] as const;

export default function PasswordStrengthMeter({
  password,
}: {
  password: string;
}) {
  if (password.length < 2) return null;

  const result = checkPasswordStrength(password);
  const score = result.score;

  return (
    <FieldContent>
      <Progress
        value={(score + 1) * 20}
        indicatorClassName={STRENGTH_COLORS[score]}
        className={"flex-row-reverse flex-nowrap items-center"}
      >
        <ProgressLabel
          className={"text-xs font-normal text-nowrap text-muted-foreground"}
        >
          {STRENGTH_LABELS[score]}
        </ProgressLabel>
      </Progress>

      {result.feedback.warning && (
        <p className="text-xs text-muted-foreground">
          {result.feedback.warning}
        </p>
      )}
    </FieldContent>
  );
}
