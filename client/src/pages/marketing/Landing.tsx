import { currentUserQuery } from "@/api/user/user.query";
import authImage from "@/assets/auth.webp";
import ProfileMenu from "@/components/shared/ProfileMenu";
import SmartLink from "@/components/shared/SmartLink";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Cloud,
  CloudIcon,
  Cpu,
  Fingerprint,
  FolderSync,
  Lock,
  MonitorIcon,
  MoonIcon,
  Search,
  Share2,
  ShieldCheck,
  Smartphone,
  SunIcon,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Suspense, useEffect, useState } from "react";

// --- INLINE SVG MOCKUPS (Theme-Aware) ---

const DashboardMockup = () => (
  <div className="relative mx-auto max-w-5xl overflow-hidden rounded-4xl border border-border bg-background shadow-lg">
    {/* Mockup Header */}
    <div className="flex items-center border-b border-border bg-muted/50 px-4 py-2">
      <div className="flex gap-1.5">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <div className="h-3 w-3 rounded-full bg-green-500/80" />
      </div>
      <div className="mx-auto flex h-6 w-1/3 items-center justify-center rounded-full border border-border bg-background text-[10px] text-muted-foreground">
        <Lock className="mr-1 size-2.5" /> driveclone.internal/workspace
      </div>
    </div>
    {/* Mockup Body */}
    <div className="flex aspect-video w-full">
      {/* Sidebar */}
      <div className="hidden w-48 space-y-4 border-r border-border bg-muted/20 p-4 sm:block">
        <div className="h-4 w-24 rounded bg-primary/20" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-3 w-full rounded bg-muted-foreground/10"
            />
          ))}
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 bg-background p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-6 w-32 rounded bg-foreground/10" />
          <div className="h-8 w-8 rounded-full bg-primary/20" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <Cloud className="mb-3 h-8 w-8 text-primary-text/60" />
              <div className="mb-1 h-2 w-16 rounded bg-muted-foreground/20" />
              <div className="h-2 w-10 rounded bg-muted-foreground/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
    {/* Fade overlay for bottom */}
    <div className="absolute bottom-0 left-0 h-24 w-full bg-linear-to-t from-background to-transparent" />
  </div>
);

const SecurityMockup = () => (
  <div className="relative rounded-xl border border-border bg-card p-6 shadow-lg">
    <div className="mb-4 flex items-center gap-4 border-b border-border pb-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Fingerprint className="h-6 w-6 text-primary-text" />
      </div>
      <div>
        <div className="mb-2 h-4 w-32 rounded bg-foreground/20" />
        <div className="h-3 w-24 rounded bg-muted-foreground/20" />
      </div>
    </div>
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-md bg-muted/50 p-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <div className="h-3 w-20 rounded bg-foreground/10" />
          </div>
          <div className="h-3 w-12 rounded bg-primary/20" />
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---

export default function Landing() {
  const { theme, setTheme } = useTheme();
  const { data: currentUser, isPending } = useQuery(currentUserQuery);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll(); // initialize
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative isolate min-h-screen bg-background font-sans text-foreground selection:bg-primary/20">
      {/* HEADER */}
      <header
        className={cn(
          "sticky inset-x-0 top-0 z-50 transition-all",
          scrolled ? "bg-background/80 backdrop-blur-2xl" : "bg-transparent"
        )}
      >
        <div className="grid h-16 w-full grid-cols-3 px-4 sm:px-6 lg:px-8">
          <SmartLink
            to="/"
            className="col-span-1 flex items-center gap-2 justify-self-start"
          >
            <CloudIcon className="size-6 fill-primary-text text-primary-text" />
            <span className="text-xl font-medium">DriveClone</span>
          </SmartLink>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 justify-self-center text-sm font-medium text-muted-foreground md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-primary-text"
            >
              Features
            </a>
            <a
              href="#security"
              className="transition-colors hover:text-primary-text"
            >
              Security
            </a>
            <a
              href="#pricing"
              className="transition-colors hover:text-primary-text"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3 justify-self-end">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() =>
                setTheme(
                  theme === "light"
                    ? "dark"
                    : theme === "dark"
                      ? "system"
                      : "light"
                )
              }
              title={`Theme: ${theme}`}
              className="rounded-full"
            >
              {theme === "light" && <SunIcon />}
              {theme === "dark" && <MoonIcon />}
              {theme === "system" && <MonitorIcon />}
            </Button>
            {isPending ? (
              <Skeleton className="size-8 rounded-full" />
            ) : currentUser ? (
              <Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
                <ProfileMenu />
              </Suspense>
            ) : (
              <>
                <SmartLink
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "hidden text-muted-foreground hover:text-foreground sm:inline-flex"
                  )}
                  moduleLoader={() => import("../auth/Login")}
                  to="/login"
                >
                  Log in
                </SmartLink>
                <SmartLink
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "shadow-sm"
                  )}
                  to="/register"
                >
                  Get started
                </SmartLink>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative -mt-16 overflow-hidden py-16 pt-32 sm:py-24 sm:pt-40">
        {/* Auth Image Background Integration */}
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-position-[center_top] bg-no-repeat opacity-10 mix-blend-multiply dark:opacity-20 dark:mix-blend-normal"
          style={{ backgroundImage: `url(${authImage})` }}
          aria-hidden="true"
        />

        {/* Abstract Background Elements */}
        <div
          className="invisible absolute top-0 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:-top-80 dark:visible"
          aria-hidden="true"
        >
          <div
            className="aspect-1155/678 w-288.75 bg-linear-to-tr from-primary to-primary/20 opacity-20"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          ></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Your Cloud.{" "}
            <span className="bg-linear-to-r from-primary-text to-cyan-900 bg-clip-text text-transparent">
              Redefined.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Secure, intelligent, and blazing-fast storage for everyone. Start
            for free and access your files anywhere, collaborate in real-time,
            and scale effortlessly.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <SmartLink
              className={cn(buttonVariants({ size: "xl" }), "w-full sm:w-auto")}
              to="/register"
            >
              Get 15GB Free
            </SmartLink>
            <SmartLink
              className={cn(
                buttonVariants({ variant: "outline", size: "xl" }),
                "w-full sm:w-auto"
              )}
              to="#pricing"
            >
              View Plans
              <ChevronRight />
            </SmartLink>
          </div>
        </div>

        {/* Hero Mockup */}
        <div className="relative z-10 mx-auto mt-16 w-full max-w-7xl px-4 sm:mt-24 sm:px-6 lg:px-8">
          <DashboardMockup />
        </div>
      </section>

      {/* SOCIAL PROOF / TRUSTED BY */}
      <section className="relative z-10 border-y border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Trusted by creators, students, and businesses worldwide
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 text-muted-foreground opacity-70">
            <div className="flex items-center gap-2 font-serif text-xl font-bold">
              <Cpu className="h-6 w-6" /> GlobalTech
            </div>
            <div className="flex items-center gap-2 font-sans text-xl font-bold tracking-tighter">
              <Share2 className="h-6 w-6" /> CoreFlow
            </div>
            <div className="flex items-center gap-2 font-mono text-xl font-bold">
              <Cloud className="h-6 w-6" /> Innoplanet
            </div>
            <div className="flex items-center gap-2 font-sans text-xl font-bold italic">
              <FolderSync className="h-6 w-6" /> Goxneky
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section
        id="features"
        className="relative z-10 bg-background py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl sm:text-center">
            <h2 className="text-base leading-7 font-semibold text-primary-text">
              Everything in one place
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Powerful tools for modern workflows
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Real-time Device Sync",
                description:
                  "Sync your phone, tablet, and desktop app instantly. Changes made offline are automatically pushed when you reconnect.",
                icon: Smartphone,
              },
              {
                title: "Frictionless Collaboration",
                description:
                  "Shared folders designed for teams. Leave comments, track file history, and resolve conflicts seamlessly.",
                icon: Users,
              },
              {
                title: "Intelligent Search",
                description:
                  "Find exact phrases instantly. Our OCR technology recognizes text inside images, PDFs, and scanned documents.",
                icon: Search,
              },
              {
                title: "Granular Permissions",
                description:
                  "Set view-only, comment, or edit rights. Ensure external guests only see what you want them to see.",
                icon: Lock,
              },
              {
                title: "Expiring Links",
                description:
                  "Share large assets with clients securely. Auto-expire links after a set date or a specific number of downloads.",
                icon: Share2,
              },
              {
                title: "Zero-Trust Architecture",
                description:
                  "Advanced encryption at rest and in transit. Protect your data with policies built for enterprise compliance.",
                icon: ShieldCheck,
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:border-primary hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary-text">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEEP DIVE: SECURITY */}
      <section
        id="security"
        className="relative z-10 overflow-hidden border-y border-border bg-muted/30 py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-x-12 gap-y-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary-text">
                <ShieldCheck className="mr-2 h-4 w-4" /> Enterprise Security
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Uncompromising control, built for peace of mind.
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                DriveClone balances an intuitive user experience with the robust
                administrative controls required for your data privacy. We
                secure your session, not just your files.
              </p>
              <dl className="mt-8 space-y-6 text-base leading-7 text-foreground">
                {[
                  "Stateless session management & strict token validation",
                  "JSON Web Tokens (JWT) with Refresh Token Rotation (RTR)",
                  "Robust ES256 signing algorithms for tamper-proof auth",
                  "Comprehensive audit logs for complete account transparency",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-x-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-primary-text" />
                    <span>{item}</span>
                  </div>
                ))}
              </dl>
            </div>

            {/* Security Visual Mockup */}
            <div className="relative mx-auto w-full max-w-lg lg:mx-0">
              <div className="absolute -inset-x-4 -inset-y-4 z-0 rounded-2xl bg-linear-to-br from-primary/20 to-transparent opacity-50 blur-2xl"></div>
              <div className="relative z-10">
                <SecurityMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section
        id="pricing"
        className="relative z-10 bg-background py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-base leading-7 font-semibold text-primary-text">
              Simple, transparent pricing
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Cloud storage for everyone
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Start with plenty of space for free. Upgrade only when you need
              more storage and advanced features.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {/* Free Tier */}
            <div className="flex flex-col justify-between gap-8 rounded-3xl border border-border bg-card p-6 shadow">
              <div>
                <h3 className="text-lg leading-8 font-semibold text-foreground">
                  Basic
                </h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    Free
                  </span>
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Perfect for individuals just getting started.
                </p>
                <ul className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                  {[
                    "15 GB secure storage",
                    "Access from any device",
                    "Standard file sharing",
                    "Basic search functionality",
                  ].map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check
                        className="h-6 w-5 flex-none text-primary-text"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <SmartLink
                to="/register"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" })
                )}
              >
                Get Started
              </SmartLink>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="relative flex flex-col justify-between gap-8 rounded-3xl border border-primary bg-linear-to-b from-primary/5 to-card p-6 shadow-lg shadow-primary/10 dark:from-primary/15">
              <div>
                <h3 className="text-lg leading-8 font-semibold text-foreground">
                  Pro
                </h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    $9.99
                  </span>
                  <span className="text-sm leading-6 font-semibold text-muted-foreground">
                    /month
                  </span>
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Everything you need for serious projects.
                </p>
                <ul className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                  {[
                    "2 TB secure storage",
                    "Advanced file sharing controls",
                    "Expiring share links",
                    "Priority customer support",
                    "30-day version history",
                  ].map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check
                        className="h-6 w-5 flex-none text-primary-text"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <SmartLink
                to="/register?plan=pro"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" })
                )}
              >
                Upgrade to Pro
              </SmartLink>
            </div>

            {/* Business Tier */}
            <div className="flex flex-col justify-between gap-8 rounded-3xl border border-border bg-card p-6 shadow">
              <div>
                <h3 className="text-lg leading-8 font-semibold text-foreground">
                  Business
                </h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    $19.99
                  </span>
                  <span className="text-sm leading-6 font-semibold text-muted-foreground">
                    /user/mo
                  </span>
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  For teams demanding absolute control.
                </p>
                <ul className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                  {[
                    "Unlimited storage",
                    "Advanced admin console",
                    "Custom branding",
                    "Single Sign-On (SSO)",
                    "24/7 dedicated support",
                  ].map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check
                        className="h-6 w-5 flex-none text-primary-text"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <SmartLink
                to="/contact-sales"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" })
                )}
              >
                Contact Sales
              </SmartLink>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-position-[center_top] bg-no-repeat opacity-100 mix-blend-multiply dark:opacity-60 dark:mix-blend-normal dark:filter-[invert(1)_brightness(1.5)]"
          style={{ backgroundImage: `url(${authImage})` }}
        />

        {/* Subtle abstract glow for CTA */}
        <div
          className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 transform-gpu blur-3xl"
          aria-hidden="true"
        >
          <div
            className="aspect-1155/678 w-288.75 bg-linear-to-tr from-primary to-primary/20 opacity-10"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          ></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Start organizing your files today.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Join thousands of users who trust DriveClone to keep their files
            safe, synced, and easy to share. Your first 15GB are entirely free.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <SmartLink
              className={cn(buttonVariants({ size: "xl" }))}
              to="/register"
            >
              Get started for free
            </SmartLink>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-muted/20 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="xl:grid xl:grid-cols-5 xl:gap-8">
            <div className="space-y-8 xl:col-span-2">
              <SmartLink
                to="/"
                className="col-span-1 flex items-center gap-2 justify-self-start"
              >
                <CloudIcon className="size-6 fill-primary-text text-primary-text" />
                <span className="text-xl font-medium">DriveClone</span>
              </SmartLink>
              <p className="max-w-xs text-sm leading-6 text-muted-foreground">
                Making cloud storage simple, secure, and accessible for
                everyone. Your files, exactly where you need them.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-3 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm leading-6 font-semibold text-foreground">
                    Product
                  </h3>
                  <ul className="mt-6 space-y-4">
                    {["Features", "Integrations", "Pricing", "Changelog"].map(
                      (item) => (
                        <li key={item}>
                          <a
                            href="#"
                            className="text-sm leading-6 text-muted-foreground transition-colors hover:text-primary-text"
                          >
                            {item}
                          </a>
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm leading-6 font-semibold text-foreground">
                    Support
                  </h3>
                  <ul className="mt-6 space-y-4">
                    {[
                      "Help Center",
                      "Community",
                      "API Documentation",
                      "System Status",
                    ].map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="text-sm leading-6 text-muted-foreground transition-colors hover:text-primary-text"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm leading-6 font-semibold text-foreground">
                    Company
                  </h3>
                  <ul className="mt-6 space-y-4">
                    {["About us", "Careers", "Blog", "Contact"].map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="text-sm leading-6 text-muted-foreground transition-colors hover:text-primary-text"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm leading-6 font-semibold text-foreground">
                    Legal
                  </h3>
                  <ul className="mt-6 space-y-4">
                    {[
                      "Privacy Policy",
                      "Terms of Service",
                      "Cookie Policy",
                      "Security",
                    ].map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="text-sm leading-6 text-muted-foreground transition-colors hover:text-primary-text"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-4 border-t border-border pt-8 sm:mt-20 sm:flex-row sm:items-center sm:justify-between lg:mt-24">
            <p className="text-xs leading-5 text-muted-foreground">
              &copy; {new Date().getFullYear()} DriveClone, Inc. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
