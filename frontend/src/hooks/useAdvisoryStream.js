import { useState, useEffect, useRef, useCallback } from 'react';
import { getStreamUrl } from '../services/api';

export default function useAdvisoryStream(requestId) {
  const [agentStatuses, setAgentStatuses] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  const connect = useCallback(() => {
    if (!requestId) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = getStreamUrl(requestId);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    const updateAgentStatus = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data.agent) return;
        setAgentStatuses((previous) => ({
          ...previous,
          [data.agent]: {
            status: event.type.replace('agent_', ''),
            error: data.error || null,
          },
        }));
      } catch {
        setError('Could not read a pipeline update.');
      }
    };

    es.addEventListener('agent_running', updateAgentStatus);
    es.addEventListener('agent_completed', updateAgentStatus);
    es.addEventListener('agent_failed', updateAgentStatus);

    es.addEventListener('advisory_complete', () => {
      setIsComplete(true);
      es.close();
    });

    es.addEventListener('advisory_failed', (event) => {
      try {
        const data = JSON.parse(event.data);
        setError(data.error || 'The advisory pipeline failed.');
      } catch {
        setError('The advisory pipeline failed.');
      }
      es.close();
    });

    es.onerror = () => {
      // EventSource will auto-reconnect on transient failures;
      // if readyState is CLOSED, mark as error
      if (es.readyState === EventSource.CLOSED) {
        setError('Connection lost');
      }
    };
  }, [requestId]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  return { agentStatuses, isComplete, error };
}
