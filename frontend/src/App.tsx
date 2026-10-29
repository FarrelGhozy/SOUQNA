import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router.js';
import { ToastProvider } from './components/ui/ToastContext.js';

export default function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
