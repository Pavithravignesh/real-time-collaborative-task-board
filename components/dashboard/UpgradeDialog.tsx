"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface UpgradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpgradeDialog({ isOpen, onOpenChange }: UpgradeDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
        <DialogHeader>
          <DialogTitle>Upgrade to Create More Boards</DialogTitle>
          <p className="text-sm text-gray-600">
            Free users can only create one board. Upgrade to Pro or Enterprise
            to create unlimited boards.
          </p>
        </DialogHeader>
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={() => router.push("/pricing")}>View Plans</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 