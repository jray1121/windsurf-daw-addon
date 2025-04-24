import React, { useEffect, useRef, useCallback } from 'react';
import { Box } from '@mui/material';

const Timeline = ({ 
  currentTime,
  duration,
  isPlaying,
  bpm = 120,
  timeSignature = 4,
  onSeek
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Convert time to bars:beats:sixteenths
  const timeToBarsBeatsSixteenths = useCallback((timeInSeconds) => {
    const beatsPerSecond = bpm / 60;
    const totalBeats = timeInSeconds * beatsPerSecond;
    
    const sixteenthsPerBeat = 4;
    const totalSixteenths = Math.floor(totalBeats * sixteenthsPerBeat);
    
    const sixteenthsPerBar = timeSignature * sixteenthsPerBeat;
    const bars = Math.floor(totalSixteenths / sixteenthsPerBar);
    const remainingSixteenths = totalSixteenths % sixteenthsPerBar;
    
    const beats = Math.floor(remainingSixteenths / sixteenthsPerBeat);
    const sixteenths = remainingSixteenths % sixteenthsPerBeat;

    return {
      bars: bars + 1,
      beats: beats + 1,
      sixteenths: sixteenths + 1
    };
  }, [bpm, timeSignature]);

  // Format time as bars:beats:sixteenths
  const formatTime = useCallback((timeInSeconds) => {
    const { bars, beats, sixteenths } = timeToBarsBeatsSixteenths(timeInSeconds);
    return `${bars}:${beats}:${sixteenths}`;
  }, [timeToBarsBeatsSixteenths]);

  // Convert canvas X position to time
  const xToTime = useCallback((x, canvas) => {
    const beatsPerSecond = bpm / 60;
    const minBeats = 16 * timeSignature;
    const pixelsPerBeat = canvas.width / minBeats;
    const beats = x / pixelsPerBeat;
    return beats / beatsPerSecond;
  }, [bpm, timeSignature]);

  // Handle mouse interactions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onSeek) return;

    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      onSeek(xToTime(x, canvas));
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      onSeek(xToTime(x, canvas));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onSeek, xToTime]);

  // Draw timeline
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    canvas.width = container.clientWidth * window.devicePixelRatio;
    canvas.height = container.clientHeight * window.devicePixelRatio;
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Calculate grid dimensions
    const beatsPerSecond = bpm / 60;
    const minBeats = 16 * timeSignature; // Show 16 measures
    const totalBeats = Math.max(duration * beatsPerSecond, minBeats);
    const pixelsPerBeat = width / minBeats;

    // Draw grid
    for (let beat = 0; beat <= totalBeats; beat += 0.25) {
      const x = beat * pixelsPerBeat;
      const isMeasure = beat % timeSignature === 0;
      const isBeat = beat % 1 === 0;
      
      ctx.beginPath();
      ctx.lineWidth = isMeasure ? 2 : isBeat ? 1 : 0.5;
      ctx.strokeStyle = isMeasure ? 
        'rgba(255,255,255,0.3)' : 
        isBeat ? 
          'rgba(255,255,255,0.15)' : 
          'rgba(255,255,255,0.05)';
      
      // Draw vertical lines
      ctx.moveTo(x, 0);
      ctx.lineTo(x, isMeasure ? height * 0.75 : isBeat ? height * 0.7 : height * 0.4);
      ctx.stroke();

      // Draw measure numbers
      if (isMeasure) {
        const measureNumber = (beat / timeSignature) + 1;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(measureNumber, x, height - 4);
      }
    }

    // Draw playhead
    if (typeof currentTime === 'number') {
      const x = (currentTime * beatsPerSecond) * pixelsPerBeat;
      
      // Draw playhead line
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4CAF50';
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      // Draw time display
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(formatTime(currentTime), 8, 16);

      // Draw time in seconds
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '10px monospace';
      ctx.fillText(`${currentTime.toFixed(2)}s`, 8, 30);
    }
  }, [currentTime, duration, bpm, timeSignature, formatTime]);

  return (
    <Box 
      ref={containerRef}
      sx={{
        height: 60,
        bgcolor: '#1a1a1a',
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        '&:hover': {
          '& canvas': {
            filter: 'brightness(1.1)'
          }
        }
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transition: 'filter 0.2s'
        }}
      />
    </Box>
  );
};

export default Timeline;
