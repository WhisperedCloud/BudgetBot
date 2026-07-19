import { toast } from 'sonner';

export const notify = {
  success: (title: string, desc: string) => {
    toast.success(desc);
    dispatch(title, desc, 'success');
  },
  error: (title: string, desc: string) => {
    toast.error(desc);
    dispatch(title, desc, 'error');
  },
  info: (title: string, desc: string) => {
    toast(desc);
    dispatch(title, desc, 'info');
  }
};

const dispatch = (title: string, desc: string, type: 'success' | 'error' | 'info') => {
  const event = new CustomEvent('finance_notification', {
    detail: { title, desc, type, time: new Date().toISOString() }
  });
  window.dispatchEvent(event);
};
