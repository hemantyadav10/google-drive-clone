import PasswordStrengthMeter from "@/components/shared/PasswordStrengthMeter";
import SmartLink from "@/components/shared/SmartLink";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import type { registerAction } from "@/router/actions/register.action";
import {
  isRegisterFormField,
  registerSchema,
  type RegisterFormData,
} from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useActionData, useNavigation, useSubmit } from "react-router";
import { BarLoader } from "react-spinners";
import GoogleAuthButton from "./components/GoogleAuthButton";

function Register() {
  const [showPassword, setShowPassword] = useState(false);

  const actionData = useActionData<typeof registerAction>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);

  const isSubmitting =
    navigation.formAction === "/register" &&
    navigation.formMethod === "POST" &&
    (navigation.state === "loading" || navigation.state === "submitting");

  const handleSubmitForm = (data: RegisterFormData) => {
    submit(data, {
      method: "post",
      action: "/register",
    });
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const {
    handleSubmit,
    setError,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(registerSchema),
    disabled: isSubmitting,
  });

  const password = watch("password", "");
  const turnstileTokenValue = watch("turnstileToken");

  useEffect(() => {
    if (!actionData) return;

    turnstileRef.current?.reset();

    if (actionData.errors) {
      for (const issue of actionData.errors) {
        if (isRegisterFormField(issue.path)) {
          setError(issue.path, { type: "server", message: issue.message });
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
      message: actionData.message,
    });
  }, [actionData, setError]);

  useEffect(() => {
    void import("../auth/VerifyEmailPending");
  }, []);

  return (
    <>
      {isSubmitting && (
        <div className="absolute inset-x-0 top-0 sm:right-(--card-spacing) sm:left-(--card-spacing)">
          <BarLoader
            color="var(--primary-text)"
            className="bg-primary/20"
            aria-label="Loading Spinner"
            data-testid="loader"
            width={"100%"}
          />
        </div>
      )}
      <CardContent>
        <form onSubmit={handleSubmit(handleSubmitForm)} noValidate>
          <FieldGroup>
            <h1 className="text-center text-xl font-semibold">
              Create your account
            </h1>

            {errors.root?.serverError && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Registration failed</AlertTitle>
                <AlertDescription>
                  {errors.root.serverError.message}
                </AlertDescription>
              </Alert>
            )}
            <Controller
              control={control}
              name="fullName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      required
                      placeholder="John Doe"
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="example@gmail.com"
                    />
                  </InputGroup>
                  <FieldDescription className="text-xs">
                    We'll send a verification link to this email address.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field>
              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        placeholder="••••••••"
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          type="button"
                          onClick={handleClickShowPassword}
                          size={"icon-sm"}
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
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
            </Field>

            {/* Cloudflare Turnstile */}
            <Field className={turnstileLoaded ? "" : "hidden!"}>
              <Turnstile
                ref={turnstileRef}
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                options={{ size: "flexible" }}
                onSuccess={(token) =>
                  setValue("turnstileToken", token, { shouldValidate: true })
                }
                onExpire={() => setValue("turnstileToken", "")}
                onWidgetLoad={() => setTurnstileLoaded(true)}
                onError={() => {
                  setValue("turnstileToken", "");
                  setError("turnstileToken", {
                    message: "Security verification failed. Please try again.",
                  });
                }}
              />
              {errors.turnstileToken && (
                <FieldError errors={[errors.turnstileToken]} />
              )}
            </Field>

            <Field>
              <Button
                type="submit"
                disabled={isSubmitting || !turnstileTokenValue}
                size={"lg"}
              >
                {isSubmitting && <Spinner />} Create account
              </Button>
            </Field>

            <FieldSeparator className="[&>span]:bg-card">or</FieldSeparator>

            <Field>
              <GoogleAuthButton isFormSubmitting={isSubmitting} />
            </Field>
            <FieldDescription className="text-center [&>a]:no-underline [&>a]:underline-offset-1 [&>a]:hover:underline">
              Already have an account?{" "}
              <SmartLink to="/login" className="text-primary-text">
                Sign in
              </SmartLink>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
      <FieldDescription className="px-6 text-center text-xs">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </>
  );
}

export default Register;
