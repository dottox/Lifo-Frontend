import './Trabajo.css';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';

function Trabajo() {
  const { authenticatedFetch, LIFO_API_URL } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [jobStatus, setJobStatus] = useState('none'); // 'none', 'working', 'ended'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all jobs and current job status
  useEffect(() => {
    const fetchJobsAndStatus = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Get all jobs
        const jobsResponse = await authenticatedFetch(`${LIFO_API_URL}/api/jobs`);
        
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobs(jobsData);
          
          // Check if user has a current job
          // We need to determine the user's job status from the API response
          // For now, let's assume we need to check each job for status
          const workingJob = jobsData.find(job => job.status === 'working' || job.isWorking);
          if (workingJob) {
            setCurrentJob(workingJob);
            setJobStatus('working');
          } else {
            const endedJob = jobsData.find(job => job.status === 'ended' || job.isEnded);
            if (endedJob) {
              setCurrentJob(endedJob);
              setJobStatus('ended');
            } else {
              setJobStatus('none');
            }
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
      // Get all jobs
      const jobsResponse = await authenticatedFetch(`${LIFO_API_URL}/api/jobs`);
      
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);
        
        // Check if user has a current job
        // We need to determine the user's job status from the API response
        // For now, let's assume we need to check each job for status
        const workingJob = jobsData.find(job => job.status === 'working' || job.isWorking);
        if (workingJob) {
          setCurrentJob(workingJob);
          setJobStatus('working');
        } else {
          const endedJob = jobsData.find(job => job.status === 'ended' || job.isEnded);
          if (endedJob) {
            setCurrentJob(endedJob);
            setJobStatus('ended');
          } else {
            setJobStatus('none');
          }
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
      // Assuming there's a claim endpoint - this might need to be adjusted based on actual API
      const response = await authenticatedFetch(`${LIFO_API_URL}/api/jobs/${currentJob.id}/claim`, {
        method: 'POST',
      });
      
      if (response.ok) {
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
      
      {jobStatus === 'none' && (
        <div className="job-list">
          <h2>Available Jobs</h2>
          <p>Select a job to start working:</p>
          {jobs.length === 0 ? (
            <p>No jobs available at the moment.</p>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="job-item">
                <h3>{job.title || job.name || `Job ${job.id}`}</h3>
                <p>{job.description || 'No description available'}</p>
                <p><strong>Payment:</strong> {job.payment || job.reward || 'Not specified'}</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  startJob(job.id);
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
      
      {jobStatus === 'working' && currentJob && (
        <div className="current-job">
          <h2>Currently Working</h2>
          <div className="job-details">
            <h3>{currentJob.title || currentJob.name || `Job ${currentJob.id}`}</h3>
            <p>{currentJob.description || 'No description available'}</p>
            <p><strong>Payment:</strong> {currentJob.payment || currentJob.reward || 'Not specified'}</p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            stopJob();
          }} className="job-form">
            <button type="submit" className="stop-job-btn">
              Stop Working
            </button>
          </form>
        </div>
      )}
      
      {jobStatus === 'ended' && currentJob && (
        <div className="completed-job">
          <h2>Job Completed</h2>
          <div className="job-details">
            <h3>{currentJob.title || currentJob.name || `Job ${currentJob.id}`}</h3>
            <p>{currentJob.description || 'No description available'}</p>
            <p><strong>Payment:</strong> {currentJob.payment || currentJob.reward || 'Not specified'}</p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            claimPayment();
          }} className="job-form">
            <button type="submit" className="claim-payment-btn">
              Claim Payment
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Trabajo;