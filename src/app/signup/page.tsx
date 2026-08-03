'use client';

import { Container, Box, Typography, Paper, useMediaQuery, useTheme } from '@mui/material';
import AuthForm from '@/components/AuthForm';

export default function SignupPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            Join WordTeam!
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              textAlign: 'center',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
            }}
          >
            Create an account to start playing and earning points for your team!
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
            Create Account
          </Typography>
          
          <AuthForm mode="signup" />
        </Paper>
      </Box>
    </Container>
  );
} 