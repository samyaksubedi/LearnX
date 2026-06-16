import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Pages — we'll create these next
import LandingPage from '@/pages/Landing/LandingPage';
import SignInPage from '@/pages/Auth/SignInPage';
import SignUpPage from '@/pages/Auth/SignUpPage';
import VerifyEmailPage from '@/pages/Auth/VerifyEmailPage';
import EmailVerificationHandler from '@/pages/Auth/EmailVerificationHandler';
import AppLayout from '@/pages/App/AppLayout';
import AppHome from '@/pages/App/AppHome';
import ConversationPage from '@/pages/App/ConversationPage';
import SettingsPage from '@/pages/App/SettingsPage';

const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/sign-in',
    element: (
      <PublicRoute>
        <SignInPage />
      </PublicRoute>
    ),
  },
  {
    path: '/sign-up',
    element: (
      <PublicRoute>
        <SignUpPage />
      </PublicRoute>
    ),
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/auth/verify/:token',
    element: <EmailVerificationHandler />,
  },

  // Protected routes
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AppHome />,
      },
      {
        path: 'conversations/:conversationId',
        element: <ConversationPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
