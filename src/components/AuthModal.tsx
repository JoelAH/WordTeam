'use client';

import { 
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box
} from '@mui/material';
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 2,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%',
          margin: '16px'
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center',
        color: 'var(--primary)',
        fontWeight: 'bold',
        fontSize: '1.5rem',
        padding: '24px 24px 8px'
      }}>
        Guess the Word for you and team!
      </DialogTitle>
      <DialogContent sx={{ padding: '16px 24px' }}>
        <Typography sx={{ 
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '1rem',
          lineHeight: 1.5,
          marginBottom: '24px'
        }}>
          Sign in or create an account to start playing!
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Link href="/signup" passHref style={{ textDecoration: 'none' }}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, var(--primary), #ff8e8e)',
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(255, 82, 82, 0.2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ff5252, #ff8e8e)',
                  boxShadow: '0 6px 16px rgba(255, 82, 82, 0.3)'
                },
                '&:active': {
                  transform: 'translateY(1px)'
                }
              }}
            >
              Create Account
            </Button>
          </Link>
          <Link href="/login" passHref style={{ textDecoration: 'none' }}>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                color: 'var(--primary)',
                borderColor: 'var(--primary)',
                textTransform: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 500,
                '&:hover': {
                  borderColor: 'var(--primary)',
                  background: 'rgba(255, 82, 82, 0.05)'
                }
              }}
            >
              Sign In
            </Button>
          </Link>
        </Box>
      </DialogContent>
    </Dialog>
  );
} 