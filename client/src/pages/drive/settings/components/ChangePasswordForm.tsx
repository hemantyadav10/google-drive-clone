import { useChangePassword } from "@/api/auth/auth.query";
import PasswordStrengthMeter from "@/components/shared/PasswordStrengthMeter";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api-errors";
import {
  changePasswordSchema,
  isChangePasswordFormField,
  type ChangePasswordFormData,
} from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePasswordMutation = useChangePassword();
  const isSubmitting = changePasswordMutation.isPending;

  const {
    handleSubmit,
    setError,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    defaultValues: {
      confirmPassword: "",
      currentPassword: "",
      newPassword: "",
    },
    resolver: zodResolver(changePasswordSchema),
    disabled: isSubmitting,
  });

  const password = watch("newPassword", "");

  const handleSubmitForm = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        reset();
      },
      onError: (error) => {
        if (error instanceof ApiError && error.data) {
          if (error.data.errors) {
            for (const issue of error.data.errors) {
              if (isChangePasswordFormField(issue.path)) {
                setError(issue.path, {
                  type: "server",
                  message: issue.message,
                });
              } else {
                setError("root.serverError", {
                  type: "server",
                  message: issue.message,
                });
              }
            }
            return;
          }
        }

        setError("root.serverError", {
          type: "server",
          message: error.message,
        });
      },
    });
  };

  const handleShowCurrentPassword = () =>
    setShowCurrentPassword((prev) => !prev);
  const handleShowNewPassword = () => setShowNewPassword((prev) => !prev);
  const handleShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  return (
    <FieldSet>
      <FieldLegend>Change Password</FieldLegend>
      <FieldDescription>
        Choose a strong password you don&apos;t use anywhere else.
      </FieldDescription>
      <form onSubmit={handleSubmit(handleSubmitForm)} noValidate>
        <FieldGroup className="max-w-md">
          {/* Error */}
          {errors.root?.serverError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Password change failed</AlertTitle>
              <AlertDescription>
                {errors.root.serverError.message}
              </AlertDescription>
            </Alert>
          )}
          {/* Success */}
          {changePasswordMutation.isSuccess && (
            <Alert variant="success">
              <CheckCircle2Icon />
              <AlertTitle>Password changed successfully</AlertTitle>
              <AlertDescription>
                You&apos;ve been logged out of all other devices for security.
              </AlertDescription>
              <AlertAction>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={changePasswordMutation.reset}
                >
                  <XIcon />
                </Button>
              </AlertAction>
            </Alert>
          )}
          <Controller
            control={control}
            name="currentPassword"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Current password</FieldLabel>

                <InputGroup className="h-9">
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      onClick={handleShowCurrentPassword}
                      disabled={isSubmitting}
                    >
                      {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>New password</FieldLabel>

                <InputGroup className="h-9">
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    type={showNewPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      onClick={handleShowNewPassword}
                      disabled={isSubmitting}
                    >
                      {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                <PasswordStrengthMeter password={password} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Confirm new password
                </FieldLabel>

                <InputGroup className="h-9">
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      onClick={handleShowConfirmPassword}
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field className="justify-start" orientation={"horizontal"}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner />
                  Updating...
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </FieldSet>
  );
}

export default ChangePasswordForm;
