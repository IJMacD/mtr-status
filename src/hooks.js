import React from 'react';

export function useAlarm (duration) {
    const [ count, setCount ] = React.useState(0);

    React.useEffect(() => {
      const id = setInterval(() => setCount(count => count + 1), duration);
      return () => clearInterval(id);
    }, [duration])

    return count;
  }