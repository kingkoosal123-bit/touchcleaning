import { supabase } from "@/integrations/supabase/client";

export type EmailType = 
  | 'booking' 
  | 'enquiry' 
  | 'newsletter' 
  | 'enquiry_reply' 
  | 'booking_reply' 
  | 'account_created' 
  | 'work_assigned';

interface SendEmailParams {
  type: EmailType;
  to: string;
  data: Record<string, any>;
  cc?: string[];
}

export async function sendEmail({ type, to, data, cc }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: response, error } = await supabase.functions.invoke('send-email', {
      body: { type, to, data, cc },
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Email send error:', err);
    return { success: false, error: err.message };
  }
}

// Convenience functions for common email types
export const emailService = {
  sendBookingConfirmation: (to: string, bookingData: Record<string, any>) =>
    sendEmail({ type: 'booking', to, data: bookingData }),

  sendEnquiryConfirmation: (to: string, enquiryData: Record<string, any>) =>
    sendEmail({ type: 'enquiry', to, data: enquiryData }),

  sendNewsletterWelcome: (to: string) =>
    sendEmail({ type: 'newsletter', to, data: {} }),

  sendEnquiryReply: (to: string, replyData: { name: string; reply_message: string }) =>
    sendEmail({ type: 'enquiry_reply', to, data: replyData }),

  sendBookingReply: (to: string, replyData: Record<string, any>) =>
    sendEmail({ type: 'booking_reply', to, data: replyData }),

  sendAccountCreated: (to: string, accountData: { full_name: string; email: string; role: string; temp_password?: string }) =>
    sendEmail({ type: 'account_created', to, data: accountData }),

  sendWorkAssignment: (to: string, jobData: Record<string, any>) =>
    sendEmail({ type: 'work_assigned', to, data: jobData }),
};
