import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Không tìm thấy phần tử #root để khởi chạy ứng dụng TRƯỜNG PHÁT REAL.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

