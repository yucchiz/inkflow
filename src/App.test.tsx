import { render, screen } from '@testing-library/react';
import App from '@/App';

describe('App', () => {
  it('アプリが正常にレンダリングされること', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
