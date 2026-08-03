'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        background: 'linear-gradient(135deg, var(--background) 0%, #f0f0f0 100%)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobile ? '100%' : '50%',
            maxWidth: 400,
          }}
        >
          <Image
            src="/word-team-logo.svg"
            alt="WordTeam Logo"
            width={200}
            height={200}
            priority
            style={{
              marginBottom: '2rem',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.3s ease',
            }}
          />
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              marginBottom: '1rem',
              background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            Welcome Back!
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              textAlign: 'center',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
            }}
          >
            Sign in to continue playing and earning points for your team!
          </Typography>
        </Box>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: isMobile ? '100%' : '50%',
            maxWidth: 500,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Typography 
            component="h2" 
            variant="h5" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: 'var(--primary)',
              marginBottom: 3,
            }}
          >
            Sign In
          </Typography>
          
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
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Link href="/signup" passHref>
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
                  Don&apos;t have an account? Sign Up
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 