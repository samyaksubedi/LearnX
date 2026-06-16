import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyEmail } from '@/api/auth.api';

const EmailVerificationHandler = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return; // ← skip second run
    hasRun.current = true;
    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
            'Verification link expired or invalid',
        );
      }
    };
    verify();
  }, [token]);

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='w-full max-w-md text-center space-y-8'>
        {status === 'loading' && (
          <>
            <Loader2 className='h-16 w-16 animate-spin text-foreground mx-auto' />
            <div className='space-y-2'>
              <h1 className='text-2xl font-bold text-foreground'>
                Verifying your email...
              </h1>
              <p className='text-muted-foreground'>Please wait a moment</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className='flex justify-center'>
              <CheckCircle className='h-16 w-16 text-green-500' />
            </div>
            <div className='space-y-2'>
              <h1 className='text-2xl font-bold text-foreground'>
                Email Verified!
              </h1>
              <p className='text-muted-foreground'>{message}</p>
            </div>
            <Button className='w-full' onClick={() => navigate('/sign-in')}>
              Continue to Sign In
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className='flex justify-center'>
              <XCircle className='h-16 w-16 text-destructive' />
            </div>
            <div className='space-y-2'>
              <h1 className='text-2xl font-bold text-foreground'>
                Verification Failed
              </h1>
              <p className='text-muted-foreground'>{message}</p>
            </div>
            <div className='space-y-3'>
              <Button className='w-full' onClick={() => navigate('/sign-up')}>
                Back to Sign Up
              </Button>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => navigate('/verify-email')}
              >
                Resend verification email
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationHandler;
