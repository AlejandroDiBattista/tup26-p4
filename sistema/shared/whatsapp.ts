export type WhatsAppReadState = {
  id: string;
  status: "starting" | "qr" | "reading" | "done" | "error";
  text?: string;
  count?: number;
  warnings?: string[];
  error?: string;
};
