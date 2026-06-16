import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUp } from '@/api/auth.api';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      await signUp(form);
      toast.success('Account created! Please check your email to verify.');
      navigate('/verify-email', { state: { email: form.email } });
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
            Create your account to get started
          </p>
        </div>

        {/* Form */}
        <div className='bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                Full Name
              </label>
              <Input
                name='name'
                type='text'
                placeholder='John Doe'
                value={form.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

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
                placeholder='Min. 6 characters'
                value={form.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className='text-center text-sm text-muted-foreground'>
            Already have an account?{' '}
            <Link
              to='/sign-in'
              className='text-foreground font-medium hover:underline'
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
