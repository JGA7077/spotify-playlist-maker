import { PaginationReqType } from '@/app/callback/SearchArtist';

const PaginationContainer = styled.ul`
  ${flexboxContainer({})}
  gap: 20px;
  list-style: none;

  button {
    border: none;
    padding: 15px;
    border-radius: 15px;
    cursor: pointer;

    &.activePage {
      background-color: black;
      color: white;
    }
  }
`

interface PaginationProps {
  paginationReq: PaginationReqType;
  getItemId: (paginationUrl: number | null) => void;
}

const MAX_ITEMS = 5;
const MAX_LEFT = (MAX_ITEMS - 1) / 2;

export default function Pagination({paginationReq, getItemId}: PaginationProps) {
  const {total, limit, offset} = paginationReq;
  const current = offset ? (offset / limit) + 1 : 1;
  const pages = Math.ceil(total / limit);
  const maxFirst = Math.max(pages - (MAX_ITEMS - 1), 1);
  const first = Math.min(
    Math.max(current - MAX_LEFT, 1),
    maxFirst
  )

  const onPageChange = (page: number) => {
    const paginationOffset = (page - 1) * limit;
    getItemId(paginationOffset);
  }

  if (!paginationReq.isActive) return null;

  return(
    <PaginationContainer>
      <li>
        <button 
          disabled={current === 1}
          onClick={(e) => onPageChange(current - 1)}
        >Anterior</button>
      </li>

      {Array.from({ length: Math.min(MAX_ITEMS, pages) })
        .map((_, index) => index + first)
        .map((page) => (
          <li key={`pagination-key-${page}`}>
            <button
              onClick={() => onPageChange(page)}
              className={page === current ? "activePage" : ''}
            >{page}
            </button>
          </li>
        ))
      }

      <li>
        <button 
          onClick={(e) => onPageChange(current + 1)}
          disabled={current === pages} 
        >Próxima</button>
      </li>
    </PaginationContainer>
  )
};