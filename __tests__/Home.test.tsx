import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'
 
describe('Home Component', () => {
  it('shloud renders a heading', () => {
    render(<Home />)
 
    const heading = screen.getByRole('heading', { level: 1 })
 
    expect(heading).toBeInTheDocument()
  })

  it('should show right page title', () => {
    render(<Home />);

    screen.getByText("Playlist Maker");
  })

  it('should show login link', () => {
    render(<Home />);

    screen.getByRole('link', {name: 'Login'});
  })

  it('should redirect to login page', () => {
    render(<Home />);
  
    const loginLink = screen.getByRole('link', {name: 'Login'});
    
    expect(loginLink.getAttribute('href')).toBe('login');
  });
})