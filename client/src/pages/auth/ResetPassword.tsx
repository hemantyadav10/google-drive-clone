import { useResetPassword } from "@/api/auth/auth.query";
import PasswordStrengthMeter from "@/components/shared/PasswordStrengthMeter";
import SmartLink from "@/components/shared/SmartLink";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
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
import { cn } from "@/lib/utils";
import {
  isResetPasswordFormField,
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const resetPasswordMutation = useResetPassword();
  const isSubmitting = resetPasswordMutation.isPending;

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    handleSubmit,
    setError,
    control,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: "",
      token: token ?? "",
      confirmPassword: "",
    },
    resolver: zodResolver(resetPasswordSchema),
    disabled: isSubmitting,
  });

  const password = watch("password", "");

  const handleSubmitForm = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(data, {
      onError: (error) => {
        if (error instanceof ApiError && error.data?.errors) {
          for (const issue of error.data.errors) {
            if (isResetPasswordFormField(issue.path)) {
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

        setError("root.serverError", {
          type: "server",
          message: error.message,
        });
      },
    });
  };

  const handleShowNewPassword = () => setShowNewPassword((prev) => !prev);
  const handleShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  if (!token) {
    return (
      <>
        <div className="flex justify-center">
          <AlertTriangleIcon className="size-12 text-destructive" />
        </div>
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Invalid reset link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            This password reset link is missing or invalid. Please request a new
            reset link to continue.
          </p>
        </CardContent>
        <CardFooter>
          <Field>
            <SmartLink
              to={"/forgot-password"}
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Request a new reset link
            </SmartLink>
            <SmartLink
              to={"/login"}
              className={cn(buttonVariants({ variant: "link", size: "sm" }))}
            >
              <ChevronLeftIcon /> Return to sign in
            </SmartLink>
          </Field>
        </CardFooter>
      </>
    );
  }

  if (resetPasswordMutation.isSuccess) {
    return (
      <>
        <div className="flex justify-center">
          <CheckCircleIcon className="size-12 text-green-700 dark:text-green-500" />
        </div>
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Password reset successful
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Your password has been updated successfully. You can now sign in
            with your new password.
          </p>
        </CardContent>
        <CardFooter>
          <SmartLink
            to={"/login"}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full"
            )}
          >
            Continue to sign in
          </SmartLink>
        </CardFooter>
      </>
    );
  }

  return (
    <>
      <CardHeader className="text-center">
        <Field>
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your new password below to regain access to your account.
          </CardDescription>
        </Field>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleSubmitForm)} noValidate>
          <FieldSet>
            <FieldGroup>
              {errors.root?.serverError && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Password reset failed</AlertTitle>
                  <AlertDescription>
                    {errors.root.serverError.message}
                  </AlertDescription>
                </Alert>
              )}

              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>New password</FieldLabel>

                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        type={showNewPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
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

                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
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
              <Field>
                <Button type="submit" disabled={isSubmitting} size={"lg"}>
                  {isSubmitting ? <Spinner /> : "Reset Password"}
                </Button>
                <SmartLink
                  to={"/forgot-password"}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" })
                  )}
                >
                  Request a new reset link
                </SmartLink>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
    </>
  );
}

export default ResetPassword;
