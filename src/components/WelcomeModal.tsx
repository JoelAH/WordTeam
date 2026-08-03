import { Dialog, DialogTitle, DialogContent, Button, Typography, Box } from '@mui/material';
import { useRouter } from 'next/navigation';

interface WelcomeModalProps {
  open: boolean;
  teamName: string;
  teamColor: string;
  onClose: () => void;
}

export default function WelcomeModal({ open, teamName, teamColor, onClose }: WelcomeModalProps) {
  const router = useRouter();

  const handleStartPlaying = () => {
    onClose();
    router.push('/game');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: 400,
          width: '90%',
          border: `1px solid ${teamColor}30`,
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          textAlign: 'center',
          color: teamColor,
          fontWeight: 'bold',
          fontSize: '1.5rem',
          pt: 4,
          pb: 2,
        }}
      >
        Welcome to WordTeam!
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            You&apos;ve been assigned to
          </Typography>
          
          <Box 
            sx={{ 
              display: 'inline-block',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              background: `${teamColor}15`,
              border: `2px solid ${teamColor}`,
              mb: 3,
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                color: teamColor,
                fontWeight: 'bold',
              }}
            >
              {teamName}
            </Typography>
          </Box>
          
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Get ready to compete with your team and earn points together!
          </Typography>
        </Box>
      </DialogContent>
      
      <Box sx={{ p: 3, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleStartPlaying}
          sx={{
            py: 1.5,
            borderRadius: 2,
            background: teamColor,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            '&:hover': {
              background: teamColor,
              opacity: 0.9,
            },
          }}
        >
          Start Playing
        </Button>
      </Box>
    </Dialog>
  );
} 