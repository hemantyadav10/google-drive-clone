import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FOLDER_COLORS, type FolderColor } from "@/constants/folder";
import { cn } from "@/lib/utils";

interface CreateNewFolderDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  folderColor: FolderColor;
  setFolderColor: (color: FolderColor) => void;
}

function CreateNewFolderDialog({
  open,
  setOpen,
  setFolderColor,
  folderColor,
}: CreateNewFolderDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) setFolderColor("#FFCE3C");
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={"text-lg"}>New Folder</DialogTitle>
        </DialogHeader>
        {/* form/input goes here */}
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" name="name" defaultValue="Untitled folder" />
            <FieldDescription>
              Enter a name for your new folder
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Folder color</FieldLabel>
            <div
              role="radiogroup"
              aria-label="Folder color"
              className="flex flex-wrap gap-7 gap-y-4"
            >
              {FOLDER_COLORS.map((color) => {
                const selected = folderColor === color.value;
                return (
                  <Button
                    key={color.value}
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className={cn(
                      "rounded-full",
                      selected ? "ring-2 ring-ring" : "hover:opacity-80"
                    )}
                    role="radio"
                    aria-checked={selected}
                    aria-label={color.name}
                    title={color.name}
                    onClick={() => setFolderColor(color.value)}
                  >
                    <svg
                      role="img"
                      aria-label={color.name}
                      viewBox="0 0 40 40"
                      fill={color.value}
                      focusable="false"
                      className="size-full"
                    >
                      <circle cx="50%" cy="50%" r="50%" />
                    </svg>
                  </Button>
                );
              })}
            </div>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button onClick={() => setOpen(false)}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateNewFolderDialog;
