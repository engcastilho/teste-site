"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return <Sonner richColors closeButton position="top-center" className="toaster group" {...props} />;
}

export { Toaster };
