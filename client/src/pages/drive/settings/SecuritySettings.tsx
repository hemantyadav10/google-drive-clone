import { FieldGroup, FieldSeparator } from "@/components/ui/field";
import { Suspense } from "react";
import ChangePasswordForm from "./components/ChangePasswordForm";
import UserSessions from "./components/UserSessions";
import SessionsFieldSetSkeleton from "./components/UserSessionsSkeleton";

function SecuritySettings() {
  return (
    <FieldGroup className="gap-8">
      <ChangePasswordForm />
      <FieldSeparator />
      <Suspense fallback={<SessionsFieldSetSkeleton />}>
        <UserSessions />
      </Suspense>
    </FieldGroup>
  );
}

export default SecuritySettings;
