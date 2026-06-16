import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

const SignInPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      const response = await signIn(form);
      const { accessToken, user } = response.data;
      setAuth(accessToken, user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/app');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-8'>
        {/* Logo */}
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-foreground'>LearnX</h1>
          <p className='mt-2 text-muted-foreground'>
            Welcome back! Sign in to continue
          </p>
        </div>

        {/* Form */}
        <div className='bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                Email
              </label>
              <Input
                name='email'
                type='email'
                placeholder='john@example.com'
                value={form.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                Password
              </label>
              <Input
                name='password'
                type='password'
                placeholder='Your password'
                value={form.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className='text-center text-sm text-muted-foreground'>
            Don't have an account?{' '}
            <Link
              to='/sign-up'
              className='text-foreground font-medium hover:underline'
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
