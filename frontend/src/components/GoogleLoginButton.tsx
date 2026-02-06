import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Wait for Google Identity Services to load
    if (!window.google || !buttonRef.current) {
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID is not set');
      toast({
        title: 'Configuration Error',
        description: 'Google Sign-In is not properly configured.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: google.accounts.id.CredentialResponse) => {
          try {
            await login(response.credential);
            toast({
              title: 'Success!',
              description: 'You have been signed in successfully.',
            });
            onSuccess?.();
          } catch (error) {
            console.error('Login failed:', error);
            toast({
              title: 'Login Failed',
              description: 'Unable to sign in. Please try again.',
              variant: 'destructive',
            });
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the button
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });

      // Optional: prompt for One Tap sign-in
      // window.google.accounts.id.prompt();
    } catch (error) {
      console.error('Failed to initialize Google Sign-In:', error);
    }
  }, [login, toast, onSuccess]);

  return (
    <div className="flex justify-center">
      <div ref={buttonRef} />
    </div>
  );
};
