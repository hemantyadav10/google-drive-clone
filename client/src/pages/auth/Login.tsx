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
import { getOAuthErrorMessage } from "@/lib/oauth-error-messages";
import type { loginAction } from "@/router/actions/login.action";
import {
  isLoginFormField,
  loginSchema,
  type LoginFormData,
} from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Turnstile } from "@marsidev/react-turnstile";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  useActionData,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "react-router";
import { BarLoader } from "react-spinners";
import GoogleAuthButton from "./components/GoogleAuthButton";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const actionData = useActionData<typeof loginAction>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const isSubmitting =
    navigation.formAction === "/login" &&
    navigation.formMethod === "POST" &&
    (navigation.state === "loading" || navigation.state === "submitting");

  const {
    handleSubmit,
    setError,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
    disabled: isSubmitting,
  });

  const turnstileTokenValue = watch("turnstileToken");

  const handleSubmitForm = (data: LoginFormData) => {
    void submit(data, {
      method: "post",
      action: "/login",
    });
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  useEffect(() => {
    if (!actionData) return;

    turnstileRef.current?.reset();

    if (actionData.errors) {
      for (const issue of actionData.errors) {
        if (isLoginFormField(issue.path)) {
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
    const oauthError = searchParams.get("error");
    if (!oauthError) return;

    setError("root.serverError", {
      type: "server",
      message: getOAuthErrorMessage(oauthError),
    });

    setSearchParams(
      (prev) => {
        prev.delete("error");
        prev.delete("error_description");
        return prev;
      },
      { replace: true }
    );
  }, [searchParams, setError, setSearchParams]);

  useEffect(() => {
    void import("../drive/Drive");
  }, []);

  return (
    <>
      {isSubmitting && (
        <div className="absolute inset-x-0 top-0 sm:right-(--card-spacing) sm:left-(--card-spacing)">
          <BarLoader
            color="var(--primary-text)"
            className="bg-primary/30"
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
              Sign In to your account
            </h1>
            {errors.root?.serverError && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Login failed</AlertTitle>
                <AlertDescription>
                  {errors.root.serverError.message}
                </AlertDescription>
              </Alert>
            )}
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
                    <div className="flex items-center justify-between gap-2">
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <SmartLink
                        className={
                          "text-right text-primary-text hover:underline"
                        }
                        to={"/forgot-password"}
                      >
                        Forgot password?
                      </SmartLink>
                    </div>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
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
                {isSubmitting && <Spinner />} Sign In
              </Button>
            </Field>

            <FieldSeparator className="[&>span]:bg-card">or</FieldSeparator>

            <Field>
              <GoogleAuthButton isFormSubmitting={isSubmitting} />
            </Field>
            <FieldDescription className="text-center [&>a]:no-underline [&>a]:underline-offset-1 [&>a]:hover:underline">
              Don&apos;t have an account?{" "}
              <SmartLink to="/register" className="text-primary-text">
                Sign up
              </SmartLink>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </>
  );
}

export default Login;
