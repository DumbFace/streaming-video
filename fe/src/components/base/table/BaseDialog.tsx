import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/src/components/ui/dialog";
import * as React from "react";

type BaseDialogContextType = {
  // onConfirm?: (product?: Product) => void;
  // product?: Product;
};

const BaseDialogContext =
  React.createContext<BaseDialogContextType | null>(null);

/* ----------------------- Root ----------------------- */

type BaseDialogProps = React.ComponentProps<typeof Dialog> & {
  // onConfirm?: (product?: Product) => void;
};

function BaseDialog({
  // onConfirm,
  children,
  // product,
  ...props
}: BaseDialogProps) {
  return (
    <BaseDialogContext.Provider value={{}}>
      <Dialog {...props}>{children}</Dialog>
    </BaseDialogContext.Provider>
  );
}

/* ----------------------- Content ----------------------- */

function Header({ children }: { children: React.ReactNode }) {
  return <DialogHeader className="flex">{children}</DialogHeader>;
}

/* ----------------------- Content ----------------------- */

function Content({ children }: { children: React.ReactNode }) {
  return <DialogContent className="flex flex-col">{children}</DialogContent>;
}

/* ----------------------- Footer ----------------------- */

function Footer({ children }: { children: React.ReactNode }) {
  return (
    <DialogFooter className="flex text-2x1 items-center">
      {children}
    </DialogFooter>
  );
}

/* ----------------------- Cancel ----------------------- */

function Cancel(props: React.ComponentProps<typeof DialogClose>) {
  return <DialogClose {...props} />;
}

/* ----------------------- Action ----------------------- */

// function Action(props: React.ComponentProps<typeof DialogClose>) {
//   const ctx = React.useContext(BaseDialogContext);

//   return (
//     <DialogClose
//       {...props}
//       onClick={() => {
//         ctx?.onConfirm?.(ctx?.product);
//       }}
//     />
//   );
// }

/* ----------------------- Attach ----------------------- */

BaseDialog.Content = Content;
BaseDialog.Header = Header;

BaseDialog.Footer = Footer;
BaseDialog.Cancel = Cancel;
// BaseDialog.Action = Action;

export { BaseDialog };
