import { useState, useCallback, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import type { LogEntry, LogStats, WebSocketMessage, ConnectionStatus } from '~/types/glimpse';

interface UseGlimpseWebSocketReturn {
  logs: LogEntry[];
  stats: LogStats | null;
  connectionStatus: ConnectionStatus;
  sendPing: () => void;
  clearLogs: () => void;
}

const useGlimpseWebSocket = (url: string): UseGlimpseWebSocketReturn => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('Connecting');
  const socketRef = useRef<WebSocket | null>(null);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const sendPing = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send('ping');
    }
  }, []);

  useEffect(() => {
    console.log(`WebSocket 연결 시도: ${url}`);
    setConnectionStatus('Connecting');

    // SockJS 연결 생성
    const socket = new SockJS(url) as WebSocket;
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket 연결됨');
      setConnectionStatus('Connected');
    };

    socket.onmessage = (event: MessageEvent) => {
      // ping/pong 메시지는 단순 텍스트로 처리
      if (event.data === 'pong') {
        console.log('pong received');
        return;
      }

      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'connected':
            console.log('서버 연결 확인:', message.message);
            break;

          case 'initial_logs':
            const initialLogs = message.data as LogEntry[];
            setLogs(initialLogs || []);
            break;

          case 'real_time_logs':
            const realTimeLogs = message.data as LogEntry[];
            if (realTimeLogs && realTimeLogs.length > 0) {
              setLogs(prevLogs => {
                // 새로운 로그만 앞에 추가하고 최대 1000개로 제한
                const newLogs = [...realTimeLogs, ...prevLogs].slice(0, 1000);
                console.log('현재 로그 총 개수:', newLogs.length);
                return newLogs;
              });
            }
            break;

          case 'log_stats':
            const logStats = message.data as LogStats;
            setStats(logStats);
            break;

          case 'error':
            console.error('서버 에러:', message.message);
            break;

          default:
            console.log('알 수 없는 메시지 타입:', message.type);
        }
      } catch (error) {
        console.error('메시지 파싱 오류:', error, 'Raw data:', event.data);
      }
    };

    socket.onclose = (event: CloseEvent) => {
      console.log('WebSocket 연결 종료:', event.code, event.reason);
      setConnectionStatus('Disconnected');
    };

    socket.onerror = (error: Event) => {
      console.error('WebSocket 오류:', error);
      setConnectionStatus('Error');
    };

    // 정리 함수
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [url]);

  return {
    logs,
    stats,
    connectionStatus,
    sendPing,
    clearLogs
  };
};

export default useGlimpseWebSocket;