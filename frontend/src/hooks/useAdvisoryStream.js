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

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'agent_status') {
          setAgentStatuses((prev) => ({
            ...prev,
            [data.agent_name]: {
              status: data.status,
              processing_time: data.processing_time || null,
              output_preview: data.output_preview || null,
              timestamp: data.timestamp || new Date().toISOString(),
            },
          }));
        }

        if (data.type === 'complete') {
          setIsComplete(true);
          es.close();
        }

        if (data.type === 'error') {
          setError(data.message || 'Stream error');
          es.close();
        }
      } catch (e) {
        // Non-JSON message, ignore
      }
    };

    es.addEventListener('agent_update', (event) => {
      try {
        const data = JSON.parse(event.data);
        setAgentStatuses((prev) => ({
          ...prev,
          [data.agent_name]: {
            status: data.status,
            processing_time: data.processing_time || null,
            output_preview: data.output_preview || null,
            timestamp: data.timestamp || new Date().toISOString(),
          },
        }));
      } catch (e) {}
    });

    es.addEventListener('complete', () => {
      setIsComplete(true);
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
