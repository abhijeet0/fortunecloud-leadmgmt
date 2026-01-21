interface OTPRecord {
  code: string;
  expiresAt: number;
}

const otpStore = new Map<string, OTPRecord>();

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const saveOTP = (phone: string, otp: string): void => {
  otpStore.set(phone, {
    code: otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
};

export const verifyOTP = (phone: string, otp: string): boolean => {
  const stored = otpStore.get(phone);
  if (!stored) {
    return false;
  }
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone);
    return false;
  }
  if (stored.code !== otp) {
    return false;
  }
  otpStore.delete(phone);
  return true;
};

export const sendOTPViaSMS = async (phone: string, otp: string): Promise<void> => {
  console.log(`OTP ${otp} sent to ${phone}`);
};
