import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  User,
  Monitor,
  Smartphone,
  Globe,
  LogOut,
  Loader2,
  Shield,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getMe, getLoggedInDevices, logout, logoutAll } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const DeviceIcon = ({ deviceInfo }) => {
  const ua = deviceInfo?.userAgent?.toLowerCase() || '';
  if (
    ua.includes('mobile') ||
    ua.includes('android') ||
    ua.includes('iphone')
  ) {
    return <Smartphone className='h-5 w-5 text-muted-foreground' />;
  }
  return <Monitor className='h-5 w-5 text-muted-foreground' />;
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch fresh user data
  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await getMe();
      return res.data;
    },
  });

  // Fetch devices
  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const res = await getLoggedInDevices();
      return res.data;
    },
    enabled: activeTab === 'sessions',
  });

  // Logout current device
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuth();
      window.location.href = '/';
    },
    onError: () => {
      clearAuth();
      window.location.href = '/';
    },
  });

  // Logout all devices
  const logoutAllMutation = useMutation({
    mutationFn: logoutAll,
    onSuccess: () => {
      toast.success('Logged out from all devices');
      clearAuth();
      window.location.href = '/';
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  const profile = meData || user;
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'sessions', label: 'Sessions', icon: Shield },
  ];

  return (
    <div className='h-full overflow-y-auto'>
      <div className='max-w-2xl mx-auto p-8 space-y-8'>
        {/* Header */}
        <div>
          <h1 className='text-2xl font-bold text-foreground'>Settings</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Manage your account and sessions
          </p>
        </div>

        {/* Tabs */}
        <div className='flex gap-1 border-b border-border'>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className='h-4 w-4' />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className='space-y-6'>
            {/* Avatar + name */}
            <div className='flex items-center gap-4'>
              <Avatar className='h-16 w-16'>
                <AvatarFallback className='text-xl font-semibold'>
                  {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className='font-semibold text-foreground text-lg'>
                  {profile?.name}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {profile?.email}
                </p>
              </div>
            </div>

            <Separator />

            {/* Profile details */}
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide font-medium'>
                    Full Name
                  </p>
                  <p className='text-sm text-foreground font-medium'>
                    {profile?.name || '—'}
                  </p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide font-medium'>
                    Email
                  </p>
                  <p className='text-sm text-foreground font-medium'>
                    {profile?.email || '—'}
                  </p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide font-medium'>
                    Email Verified
                  </p>
                  <span
                    className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${
                      profile?.isVerified
                        ? 'bg-green-500/15 text-green-600 border border-green-500/20'
                        : 'bg-yellow-500/15 text-yellow-600 border border-yellow-500/20'
                    }`}
                  >
                    {profile?.isVerified ? 'Verified' : 'Not verified'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Danger zone */}
            <div className='space-y-3'>
              <p className='text-sm font-medium text-foreground'>Account</p>
              <div className='flex flex-col sm:flex-row gap-3'>
                <Button
                  variant='outline'
                  className='gap-2'
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <LogOut className='h-4 w-4' />
                  )}
                  Logout from this device
                </Button>
                <Button
                  variant='destructive'
                  className='gap-2'
                  onClick={() => logoutAllMutation.mutate()}
                  disabled={logoutAllMutation.isPending}
                >
                  {logoutAllMutation.isPending ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <LogOut className='h-4 w-4' />
                  )}
                  Logout from all devices
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-foreground'>Active Sessions</p>
                <p className='text-sm text-muted-foreground mt-0.5'>
                  All devices currently logged into your account
                </p>
              </div>
              <Button
                variant='destructive'
                size='sm'
                className='gap-2'
                onClick={() => logoutAllMutation.mutate()}
                disabled={logoutAllMutation.isPending}
              >
                {logoutAllMutation.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <LogOut className='h-4 w-4' />
                )}
                Logout all
              </Button>
            </div>

            <Separator />

            {devicesLoading ? (
              <div className='flex items-center justify-center py-12'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
              </div>
            ) : !devices || devices.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-12'>
                No active sessions found
              </p>
            ) : (
              <div className='space-y-3'>
                {devices.map((device, i) => (
                  <div
                    key={i}
                    className='flex items-start gap-4 p-4 rounded-xl border border-border bg-card'
                  >
                    <div className='mt-0.5 shrink-0'>
                      <DeviceIcon deviceInfo={device.deviceInfo} />
                    </div>
                    <div className='flex-1 min-w-0 space-y-1'>
                      <p className='text-sm font-medium text-foreground'>
                        {device.deviceInfo?.browser || 'Unknown browser'} on{' '}
                        {device.deviceInfo?.os || 'Unknown OS'}
                      </p>
                      <div className='flex flex-wrap gap-x-4 gap-y-1'>
                        <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <Globe className='h-3 w-3' />
                          {device.ipAddress || 'Unknown IP'}
                        </span>
                        <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <Clock className='h-3 w-3' />
                          Last active: {formatDate(device.lastUsedAt)}
                        </span>
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        Signed in: {formatDate(device.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
 