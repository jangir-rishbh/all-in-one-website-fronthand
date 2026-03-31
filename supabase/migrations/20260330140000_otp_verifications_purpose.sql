-- Separate signup OTP vs password-reset OTP for the same email
ALTER TABLE public.otp_verifications
  ADD COLUMN IF NOT EXISTS purpose text NOT NULL DEFAULT 'signup';

ALTER TABLE public.otp_verifications
  DROP CONSTRAINT IF EXISTS otp_verifications_email_key;

CREATE UNIQUE INDEX IF NOT EXISTS otp_verifications_email_purpose_unique
  ON public.otp_verifications (email, purpose);
