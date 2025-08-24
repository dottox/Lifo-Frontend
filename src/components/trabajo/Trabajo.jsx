import './Trabajo.css';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';

// Cookie utility functions
const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
};

function Trabajo() {
  const { authenticatedFetch, LIFO_API_URL } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [currentJobStatus, setCurrentJobStatus] = useState(null); // Job status from API
  const [workingUntil, setWorkingUntil] = useState(null); // Timestamp when work ends
  const [remainingTime, setRemainingTime] = useState(0); // Remaining seconds
  const [isWorking, setIsWorking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check for existing working session from cookie on component mount
  useEffect(() => {
    const savedWorkingUntil = getCookie('workingUntil');
    if (savedWorkingUntil) {
      const untilTimestamp = parseInt(savedWorkingUntil, 10);
      const now = Math.floor(Date.now() / 1000);
      
      if (untilTimestamp > now) {
        setWorkingUntil(untilTimestamp);
        setIsWorking(true);
        setRemainingTime(untilTimestamp - now);
      } else {
        // Work period has ended, clear cookie
        deleteCookie('workingUntil');
      }
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!isWorking || !workingUntil) return;

    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = workingUntil - now;
      
      if (remaining <= 0) {
        setRemainingTime(0);
        setIsWorking(false);
        deleteCookie('workingUntil');
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isWorking, workingUntil]);

  // Fetch all jobs and current job status
  useEffect(() => {
    const fetchJobsAndStatus = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Get all jobs (available jobs info)
        const jobsResponse = await authenticatedFetch(`${LIFO_API_URL}/api/jobs`);
        
        if (jobsResponse.ok) {
          const responseData = await jobsResponse.json();
          
          // Handle new paginated jobs list format
          if (responseData.content && Array.isArray(responseData.content)) {
            // This is the new paginated jobs list response
            setJobs(responseData.content);
          } else if (Array.isArray(responseData)) {
            // Fallback for legacy array format
            setJobs(responseData);
          } else {
            setJobs([]);
          }
        } else {
          setError('Failed to fetch jobs');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsAndStatus();
  }, [authenticatedFetch, LIFO_API_URL]);

  const refreshJobsAndStatus = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get jobs/status
      const jobsResponse = await authenticatedFetch(`${LIFO_API_URL}/api/jobs`);
      
      if (jobsResponse.ok) {
        const responseData = await jobsResponse.json();
        
        // Handle new paginated jobs list format
        if (responseData.content && Array.isArray(responseData.content)) {
          // This is the new paginated jobs list response
          setJobs(responseData.content);
        } else if (Array.isArray(responseData)) {
          // Fallback for legacy array format
          setJobs(responseData);
        } else {
          setJobs([]);
        }
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const startJob = async (jobId) => {
    setError('');
    
    try {
      const response = await authenticatedFetch(`${LIFO_API_URL}/api/jobs/${jobId}/work`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const responseData = await response.json();
        
        // Check if response includes workingUntil
        if (responseData.workingUntil) {
          const untilTimestamp = responseData.workingUntil;
          const now = Math.floor(Date.now() / 1000);
          
          setWorkingUntil(untilTimestamp);
          setIsWorking(true);
          setRemainingTime(untilTimestamp - now);
          setCookie('workingUntil', untilTimestamp.toString());
          setCurrentJobStatus(responseData);
        }
        
        // Refresh the job status
        await refreshJobsAndStatus();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to start job');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error starting job:', err);
    }
  };

  const stopJob = async () => {
    setError('');
    
    try {
      const response = await authenticatedFetch(`${LIFO_API_URL}/api/jobs/stop`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const responseData = await response.json();
        
        // Display results from stopping the job based on new schema
        if (responseData.message) {
          console.log('Job completed:', responseData.message);
          console.log('Job:', responseData.jobName);
          console.log('Worked time:', responseData.workedTime);
          console.log('Experience gained:', responseData.experienceGained);
          console.log('Gold gained:', responseData.goldGained);
          console.log('Level ups:', responseData.levelUps);
          console.log('Items gained:', responseData.itemsGained);
        }
        
        // Clear working state
        setIsWorking(false);
        setWorkingUntil(null);
        setRemainingTime(0);
        setCurrentJobStatus(null);
        deleteCookie('workingUntil');
        
        // Refresh the job status
        await refreshJobsAndStatus();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to stop job');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error stopping job:', err);
    }
  };

  const claimPayment = async () => {
    setError('');
    
    try {
      // Assuming there's a claim endpoint
      const response = await authenticatedFetch(`${LIFO_API_URL}/api/jobs/claim`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Clear working state after claiming
        setIsWorking(false);
        setWorkingUntil(null);
        setRemainingTime(0);
        setCurrentJobStatus(null);
        deleteCookie('workingUntil');
        
        // Refresh the job status
        await refreshJobsAndStatus();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to claim payment');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error claiming payment:', err);
    }
  };

  // Helper function to format time
  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="trabajo-container">
        <h1>Trabajo</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="trabajo-container">
      <h1>Trabajo</h1>
      
      {error && <p className="error-message">{error}</p>}
      
      {/* Show current work status with countdown */}
      {isWorking && currentJobStatus && (
        <div className="current-job">
          <h2>Currently Working</h2>
          <div className="job-details">
            <h3>{currentJobStatus.jobName || 'Current Job'}</h3>
            <p><strong>Status:</strong> {currentJobStatus.message}</p>
            <div className="countdown-container">
              <p><strong>Time Remaining:</strong></p>
              <div className="countdown-display">
                {formatTime(remainingTime)}
              </div>
            </div>
          </div>
          {remainingTime > 0 ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              stopJob();
            }} className="job-form">
              <button type="submit" className="stop-job-btn">
                Stop Working
              </button>
            </form>
          ) : (
            <form onSubmit={(e) => {
              e.preventDefault();
              claimPayment();
            }} className="job-form">
              <button type="submit" className="claim-payment-btn">
                Claim Payment
              </button>
            </form>
          )}
        </div>
      )}
      
      {/* Show available jobs when not working */}
      {!isWorking && (
        <div className="job-list">
          <h2>Available Jobs</h2>
          <p>Select a job to start working:</p>
          {jobs.length === 0 ? (
            <p>No jobs available at the moment.</p>
          ) : (
            jobs.map(job => (
              <div key={job.jobId} className="job-item">
                <h3>{job.jobName || `Job ${job.jobId}`}</h3>
                <div className="job-details">
                  <p><strong>Working Time:</strong> {job.workingTime} minutes</p>
                  <p><strong>Experience:</strong> {job.experience}</p>
                  <p><strong>Gold:</strong> {job.gold}</p>
                  {job.premium && <p><strong>Premium Job</strong></p>}
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  startJob(job.jobId);
                }} className="job-form">
                  <button type="submit" className="start-job-btn">
                    Start Working
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Trabajo;