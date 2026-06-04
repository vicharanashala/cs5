import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Button from '../Button';
import Badge from '../Badge';
import Card from '../Card';

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Button Component', () => {
  it('renders with correct text', () => {
    renderWithRouter(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDefined();
  });

  it('applies primary variant styles by default', () => {
    const { container } = renderWithRouter(<Button>Primary</Button>);
    const button = container.querySelector('button');
    expect(button.className).toContain('bg-black');
    expect(button.className).toContain('text-white');
  });

  it('applies secondary variant styles', () => {
    const { container } = renderWithRouter(<Button variant="secondary">Secondary</Button>);
    const button = container.querySelector('button');
    expect(button.className).toContain('bg-white');
    expect(button.className).toContain('border');
  });

  it('applies danger variant styles', () => {
    const { container } = renderWithRouter(<Button variant="danger">Danger</Button>);
    const button = container.querySelector('button');
    expect(button.className).toContain('bg-red-600');
  });

  it('calls onClick handler when clicked', () => {
    let clicked = false;
    const { container } = renderWithRouter(
      <Button onClick={() => { clicked = true; }}>Click Me</Button>
    );
    const button = container.querySelector('button');
    fireEvent.click(button);
    expect(clicked).toBe(true);
  });

  it('is disabled when loading', () => {
    const { container } = renderWithRouter(
      <Button loading={true}>Loading</Button>
    );
    const button = container.querySelector('button');
    expect(button.disabled).toBe(true);
  });

  it('shows loading spinner when loading', () => {
    renderWithRouter(<Button loading={true}>Loading</Button>);
    expect(document.querySelector('.animate-spin')).toBeDefined();
  });
});

describe('Badge Component', () => {
  it('renders with correct text', () => {
    renderWithRouter(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('applies default variant styles', () => {
    const { container } = renderWithRouter(<Badge>Default</Badge>);
    const span = container.querySelector('span');
    expect(span.className).toContain('bg-gray-100');
  });

  it('applies success variant styles', () => {
    const { container } = renderWithRouter(<Badge variant="success">Success</Badge>);
    const span = container.querySelector('span');
    expect(span.className).toContain('bg-green-100');
    expect(span.className).toContain('text-green-800');
  });

  it('applies warning variant styles', () => {
    const { container } = renderWithRouter(<Badge variant="warning">Warning</Badge>);
    const span = container.querySelector('span');
    expect(span.className).toContain('bg-yellow-100');
  });

  it('applies error variant styles', () => {
    const { container } = renderWithRouter(<Badge variant="error">Error</Badge>);
    const span = container.querySelector('span');
    expect(span.className).toContain('bg-red-100');
  });

  it('applies pending (blue) variant styles', () => {
    const { container } = renderWithRouter(<Badge variant="pending">Pending</Badge>);
    const span = container.querySelector('span');
    expect(span.className).toContain('bg-blue-100');
    expect(span.className).toContain('text-blue-800');
  });

  it('applies peer (yellow) variant styles', () => {
    const { container } = renderWithRouter(<Badge variant="peer">Peer</Badge>);
    const span = container.querySelector('span');
    expect(span.className).toContain('bg-yellow-100');
    expect(span.className).toContain('text-yellow-800');
  });
});

describe('Card Component', () => {
  it('renders children correctly', () => {
    renderWithRouter(
      <Card>
        <p>Card Content</p>
      </Card>
    );
    expect(screen.getByText('Card Content')).toBeDefined();
  });

  it('applies hover styles when interactive', () => {
    const { container } = renderWithRouter(
      <Card interactive={true}>
        <p>Interactive Card</p>
      </Card>
    );
    const div = container.querySelector('div');
    expect(div.className).toContain('transition');
    expect(div.className).toContain('hover:scale-105');
  });

  it('applies cursor pointer when interactive', () => {
    const { container } = renderWithRouter(
      <Card interactive={true} onClick={() => {}}>
        <p>Clickable Card</p>
      </Card>
    );
    const div = container.querySelector('div');
    expect(div.className).toContain('cursor-pointer');
  });

  it('handles click events', () => {
    let clicked = false;
    const { container } = renderWithRouter(
      <Card interactive={true} onClick={() => { clicked = true; }}>
        <p>Click Me</p>
      </Card>
    );
    const div = container.querySelector('div');
    fireEvent.click(div);
    expect(clicked).toBe(true);
  });
});