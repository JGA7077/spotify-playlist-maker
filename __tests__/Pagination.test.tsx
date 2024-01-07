import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom'
import Pagination from "@/app/components/Pagination";

const PaginationMock = {
  limit: 5,
  next: "https://api.spotify.com/v1/search?query=track%3ARock+you&type=track&locale=en-US%2Cen%3Bq%3D0.9&offset=5&limit=5",
  offset: 0,
  previous: null,
  total: 1000,
  isActive: true
}

const PaginationPrevMock = {
  "limit": 5,
  "next": "https://api.spotify.com/v1/search?query=track%3Arock&type=track&locale=en-US%2Cen%3Bq%3D0.9&offset=10&limit=5",
  "offset": 5,
  "previous": "https://api.spotify.com/v1/search?query=track%3Arock&type=track&locale=en-US%2Cen%3Bq%3D0.9&offset=0&limit=5",
  "total": 1000,
  "isActive": true
}

describe('Pagination Component', () => {
  const getItemIdMock = jest.fn();

  it('should "Próxima" Pagination button', () => {
    render(<Pagination paginationReq={PaginationMock} getItemId={getItemIdMock} />);

    screen.getByRole('button', {name: 'Próxima'});
  });

  it('should call getItemId when "Próxima" button is click', () => {
    render(<Pagination paginationReq={PaginationMock} getItemId={getItemIdMock} />);

    const nextButton = screen.getByRole('button', {name: 'Próxima'});

    fireEvent.click(nextButton);

    expect(getItemIdMock).toHaveBeenCalled();
  });

  it('should enable "Anterior" button when "Próxima" button is click', () => {
    render(<Pagination paginationReq={PaginationPrevMock} getItemId={getItemIdMock} />);

    const nextButton = screen.getByRole('button', {name: 'Próxima'});
    
    fireEvent.click(nextButton);

    const prevButton = screen.getByRole('button', {name: 'Anterior'});
    expect(prevButton).toBeEnabled();
  });
});