import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resendVerification } from '@/api/auth.api';

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error('Email not found, please sign up again');
      navigate('/sign-up');
      return;
    }
    setIsLoading(true);
    try {
      await resendVerification(email);
      toast.success('Verification email resent! Check your inbox.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='w-full max-w-md text-center space-y-8'>
        {/* Icon */}
        <div className='flex justify-center'>
          <div className='bg-muted rounded-full p-6'>
            <Mail className='h-12 w-12 text-foreground' />
          </div>
        </div>

        {/* Text */}
        <div className='space-y-3'>
          <h1 className='text-3xl font-bold text-foreground'>
            Check your email
          </h1>
          <p className='text-muted-foreground'>
            We sent a verification link to{' '}
            {email ? (
              <span className='text-foreground font-medium'>{email}</span>
            ) : (
              'your email address'
            )}
          </p>
          <p className='text-muted-foreground text-sm'>
            Click the link in the email to verify your account and get started.
          </p>
        </div>

        {/* Actions */}
        <div className='space-y-3'>
          <Button
            variant='outline'
            className='w-full'
            onClick={handleResend}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Resending...
              </>
            ) : (
              'Resend verification email'
            )}
          </Button>

          <Button
            variant='ghost'
            className='w-full'
            onClick={() => navigate('/sign-in')}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
