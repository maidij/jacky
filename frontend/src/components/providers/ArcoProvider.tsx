'use client';

import React from 'react';
import { ConfigProvider } from '@arco-design/web-react';
import '@arco-design/web-react/dist/css/arco.css';

const ArcoProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider
      theme={{
        primaryColor: '#165DFF',
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default ArcoProvider;
