import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

export function RouteChangeTracker() {
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  // localhost는 기록하지 않음
  useEffect(() => {
    if (!window.location.href.includes('localhost')) {
      ReactGA.initialize(import.meta.env.VITE_GOOGLE_ANALYTICS_ID);
      setInitialized(true);
    }
  }, []);

  // location 변경 감지시 pageview 이벤트 전송
  useEffect(() => {
    if (initialized) {
      ReactGA.set({ page: location.pathname });
      ReactGA.send('pageview');
    }
  }, [initialized, location]);

  // 개발용
  //   useEffect(() => {
  //     ReactGA.initialize(import.meta.env.VITE_GOOGLE_ANALYTICS_ID);
  //     ReactGA.set({ page: location.pathname });
  //     ReactGA.send('pageview');
  //   }, [location]);

  return null;
}
