'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Box, 
  TextField, 
  Button, 
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import WelcomeModal from './WelcomeModal';
import { isAppropriateNickname } from '@/lib/utils/validation';
import { validateEmail } from '@/lib/utils/emailValidation';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [teamInfo, setTeamInfo] = useState<{ name: string; color: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Invalid email');
      setLoading(false);
      return;
    }

    // Validate password length for signup
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate nickname for inappropriate content
    if (mode === 'signup' && !isAppropriateNickname(nickname)) {
      setError('Nickname contains inappropriate content');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        console.log('Starting signup process...');
        
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          console.error('Supabase signup error:', error);
          throw error;
        }
        
        if (!data.user) {
          console.error('No user data returned from Supabase');
          throw new Error('Failed to create user account');
        }
        
        // Create user in our database using API route
        
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            nickname,
            supabaseId: data.user.id,
          }),
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          console.error('Database creation failed:', result.error || 'Unknown error');
          throw new Error(result.error || 'Failed to create user in database');
        }
        
        setTeamInfo({ 
          name: result.data.team.name, 
          color: result.data.team.color 
        });
        setShowWelcomeModal(true);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          router.push('/game');
        }
      }
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: 'var(--secondary)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--primary)',
              },
            },
          }}
        />
        
        {mode === 'signup' && (
          <TextField
            margin="normal"
            required
            fullWidth
            id="nickname"
            label="Nickname"
            name="nickname"
            autoComplete="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'var(--secondary)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--primary)',
                },
              },
            }}
          />
        )}
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: 'var(--secondary)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--primary)',
              },
            },
          }}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ 
            mt: 3, 
            mb: 2,
            py: 1.5,
            borderRadius: 3,
            background: 'linear-gradient(45deg, var(--primary), #ff8e8e)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(45deg, #ff5252, #ff8e8e)',
              boxShadow: '0 6px 12px rgba(255, 107, 107, 0.3)',
              transform: 'translateY(-2px)',
            },
            '&:disabled': {
              background: '#999',
              transform: 'none',
              boxShadow: 'none',
            },
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : (mode === 'login' ? 'Sign In' : 'Sign Up')}
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Link href={mode === 'login' ? '/signup' : '/login'} passHref>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'var(--primary)',
                cursor: 'pointer',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Typography>
          </Link>
        </Box>
      </Box>

      {teamInfo && (
        <WelcomeModal
          open={showWelcomeModal}
          teamName={teamInfo.name}
          teamColor={teamInfo.color}
          onClose={() => setShowWelcomeModal(false)}
        />
      )}
    </>
  );
} 