import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Paper, Typography, Button, Stack, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';
import Timeline from './Timeline';

const DAW = ({ song }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // Temporary duration

  const clickTrack = song.tracks.find(track => track.type === 'click');
  const pianoTrack = song.tracks.find(track => track.type === 'piano');
  const vocalsTrack = song.tracks.find(track => track.type === 'all_vocals');

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleSeek = useCallback((time) => {
    setCurrentTime(time);
  }, []);

  return (
    <Paper 
      elevation={1}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {song.title}
        </Typography>
        
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {song.voicing.toUpperCase()}
          </Typography>
          {clickTrack && <Chip label="Click Track" color="primary" size="small" />}
          {pianoTrack && <Chip label="Piano" color="secondary" size="small" />}
          {vocalsTrack && <Chip label="Vocals" color="info" size="small" />}
        </Stack>
      </Box>

      <Box sx={{ p: 2 }}>
        <Timeline 
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          bpm={120} // We'll get this from the click track analysis
          timeSignature={4} // We'll get this from song metadata
          onSeek={handleSeek}
        />

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          {!isPlaying ? (
            <Button 
              variant="contained" 
              color="primary" 
              disabled={!clickTrack}
              onClick={handlePlay}
              startIcon={<PlayArrowIcon />}
            >
              Play
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              disabled={!clickTrack}
              onClick={handlePause}
              startIcon={<PauseIcon />}
            >
              Pause
            </Button>
          )}
          <Button 
            variant="contained" 
            disabled={!clickTrack || (!isPlaying && currentTime === 0)}
            onClick={handleStop}
            startIcon={<StopIcon />}
          >
            Stop
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

DAW.propTypes = {
  song: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    voicing: PropTypes.string.isRequired,
    tracks: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        filePath: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired
};

export default DAW;
