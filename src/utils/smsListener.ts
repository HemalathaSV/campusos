/**
 * Mock SMS Listener Utility for Demo Purposes
 * This simulates intercepting a bank SMS upon UPI payment.
 */

export interface ParsedSMS {
  amount: number | null;
  sender: string | null;
  isPayment: boolean;
}

// Simulated SMS Generator
const simulateIncomingSMS = (expectedAmount: number): string => {
  const senders = ["Sanjay Mehta", "Priya Sharma", "Rahul Dravid", "Amit Patel"];
  const randomSender = senders[Math.floor(Math.random() * senders.length)];
  const refNumbers = ["123456789012", "987654321098", "456789123456"];
  const ref = refNumbers[Math.floor(Math.random() * refNumbers.length)];
  
  // Standard Indian Bank SMS format
  return `Dear Customer, Rs.${expectedAmount} credited to your a/c XX1234 on ${new Date().toLocaleDateString()} by ${randomSender} via UPI Ref ${ref}. Avl Bal: Rs.5,42,100. - Bank`;
};

// Parser to extract details using keywords
const parsePaymentSMS = (message: string): ParsedSMS => {
  const msgLower = message.toLowerCase();
  
  // Requirement: Detect UPI payment using keywords
  const hasKeywords = ["credited", "received", "upi", "rs."].some(keyword => msgLower.includes(keyword.toLowerCase()));
  
  if (!hasKeywords) {
    return { amount: null, sender: null, isPayment: false };
  }

  // Extract amount: Looks for Rs.120000 or Rs 120000 or Rs. 120,000
  let amount = null;
  const amountMatch = message.match(/rs\.?\s*([\d,]+)/i) || message.match(/inr\s*([\d,]+)/i);
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // Extract sender: Looks for "by SenderName via/ref"
  let sender = null;
  const senderMatch = message.match(/by\s+([a-zA-Z\s]+?)\s+(?:via|upi|ref|\.)/i);
  if (senderMatch && senderMatch[1]) {
    sender = senderMatch[1].trim();
  }

  return { amount, sender, isPayment: true };
};

// The main Background Listener trigger
export const listenForPaymentSMS = (
  expectedAmount: number, 
  onSuccess: (details: ParsedSMS, rawMessage: string) => void
) => {
  // Simulate network/SMS delay of 3-6 seconds
  const delay = Math.floor(Math.random() * 3000) + 3000;
  
  setTimeout(() => {
    // 1. Generate the mock raw SMS
    const rawSMS = simulateIncomingSMS(expectedAmount);
    
    // 2. Parse it like a real listener would
    const parsedData = parsePaymentSMS(rawSMS);
    
    // 3. Trigger success if valid
    if (parsedData.isPayment) {
      onSuccess(parsedData, rawSMS);
    }
  }, delay);
};
