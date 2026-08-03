'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Divider,
  Skeleton,
  Chip,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  points: number;
  team: {
    name: string;
    color: string;
  } | null;
}

interface Team {
  _id: string;
  name: string;
  color: string;
  points: number;
}

interface PreviousWinner {
  name: string;
  team: {
    name: string;
    color: string;
  } | null;
  points: number;
}

interface PreviousTeamWinner {
  name: string;
  color: string;
  points: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [previousWinner, setPreviousWinner] = useState<PreviousWinner | null>(null);
  const [previousTeamWinner, setPreviousTeamWinner] = useState<PreviousTeamWinner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch previous winners
        const prevWinnerResponse = await fetch('/api/leaderboard/previous-winner');
        if (prevWinnerResponse.ok) {
          const prevWinnerData = await prevWinnerResponse.json();
          setPreviousWinner(prevWinnerData);
        }
        
        const prevTeamWinnerResponse = await fetch('/api/leaderboard/previous-team-winner');
        if (prevTeamWinnerResponse.ok) {
          const prevTeamWinnerData = await prevTeamWinnerResponse.json();
          setPreviousTeamWinner(prevTeamWinnerData);
        }
        
        if (activeTab === 0) {
          const response = await fetch('/api/leaderboard/users');
          if (!response.ok) {
            throw new Error('Failed to fetch users leaderboard');
          }
          const data = await response.json();
          setUsers(data);
        } else {
          const response = await fetch('/api/leaderboard/teams');
          if (!response.ok) {
            throw new Error('Failed to fetch teams leaderboard');
          }
          const data = await response.json();
          setTeams(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    localStorage.setItem('fromLeaderboard', 'true');
  }, [activeTab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, position: 'relative' }}>
      <IconButton 
        onClick={() => router.back()}
        sx={{ 
          position: 'absolute',
          left: 0,
          top: 0
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Leaderboard
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Users" />
          <Tab label="Teams" />
        </Tabs>
      </Box>
      
      {activeTab === 0 ? (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Top Players
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            See who&apos;s leading the pack today
          </Typography>
          
          {loading ? (
            <Box sx={{ mt: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ width: '100%' }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : error ? (
            <Typography color="error" align="center" sx={{ py: 2 }}>
              {error}
            </Typography>
          ) : users.length === 0 ? (
            <Typography align="center" sx={{ py: 2 }}>
              No data available
            </Typography>
          ) : (
            <List>
              {users.map((user, index) => (
                <Box key={user._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          mr: 2,
                          fontWeight: 'bold'
                        }}
                      >
                        {index + 1}
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={
                        user.team ? (
                          <Typography component="span" variant="body2" color="text.secondary">
                            Team: <Box component="span" sx={{ color: user.team.color }}>{user.team.name}</Box>
                          </Typography>
                        ) : null
                      }
                    />
                    <Typography variant="h6" fontWeight="bold">
                      {user.points} pts
                    </Typography>
                  </ListItem>
                  {index < users.length - 1 && <Divider variant="inset" component="li" />}
                </Box>
              ))}
            </List>
          )}
          
          {previousWinner && (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Previous Game Winner
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.default'
              }}>
                <Box>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {previousWinner.name}
                  </Typography>
                  {previousWinner.team && (
                    <Chip 
                      label={previousWinner.team.name} 
                      size="small"
                      sx={{ 
                        bgcolor: previousWinner.team.color, 
                        color: 'white',
                        mt: 1
                      }} 
                    />
                  )}
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {previousWinner.points} pts
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Team Rankings
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            See which team is on top
          </Typography>
          
          {loading ? (
            <Box sx={{ mt: 2 }}>
              {[1, 2].map((i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ width: '100%' }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : error ? (
            <Typography color="error" align="center" sx={{ py: 2 }}>
              {error}
            </Typography>
          ) : teams.length === 0 ? (
            <Typography align="center" sx={{ py: 2 }}>
              No data available
            </Typography>
          ) : (
            <List>
              {teams.map((team, index) => (
                <Box key={team._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          mr: 2,
                          fontWeight: 'bold'
                        }}
                      >
                        {index + 1}
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={team.name}
                    />
                    <Typography variant="h6" fontWeight="bold">
                      {team.points} pts
                    </Typography>
                  </ListItem>
                  {index < teams.length - 1 && <Divider variant="inset" component="li" />}
                </Box>
              ))}
            </List>
          )}
          
          {previousTeamWinner && (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Previous Game Team Winner
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.default'
              }}>
                <Box>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {previousTeamWinner.name}
                  </Typography>
                  <Chip 
                    label="Champion Team" 
                    size="small"
                    sx={{ 
                      bgcolor: previousTeamWinner.color, 
                      color: 'white',
                      mt: 1
                    }} 
                  />
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {previousTeamWinner.points} pts
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      )}
    </Container>
  );
} 