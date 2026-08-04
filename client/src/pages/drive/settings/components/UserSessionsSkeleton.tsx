import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";

export default function SessionsFieldSetSkeleton() {
  return (
    <FieldSet>
      <Field orientation="responsive">
        <FieldContent>
          <FieldLegend>Active sessions</FieldLegend>
          <FieldDescription>
            This is a list of devices that have logged into your account. Revoke
            any sessions that you do not recognize.
          </FieldDescription>
        </FieldContent>
      </Field>

      <Card size="sm">
        <CardContent className="-m-(--card-spacing) space-y-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Field orientation="responsive" className="p-(--card-spacing)">
                <Field orientation="horizontal">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                </Field>
                <FieldContent className="gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                  <Skeleton className="h-3 w-56" />
                </FieldContent>
                <Skeleton className="h-8 w-20" />
              </Field>
              {i < 2 && <FieldSeparator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </FieldSet>
  );
}
