import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ConfirmBuyModal({
  agent,
  open,
  onClose,
  onConfirm,
}: {
  agent: any;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" /> Confirm purchase
          </DialogTitle>
        </DialogHeader>
        <div className="text-center my-4">
          {agent && (
            <>
              <div className="mb-2 font-semibold">
                Are you sure you want to buy <span className="text-primary">{agent.name}</span>?
              </div>
              <div className="text-muted-foreground text-sm">
                This action cannot be undone.
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}