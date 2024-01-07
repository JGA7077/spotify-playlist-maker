import { PaginationReqType } from '@/app/callback/SearchArtist';

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
    <ul
      className="flex justify-center items-center gap-5 list-none"
    >
      <li>
        <button
          className="border-none p-4 rounded-2xl cursor-pointer"
          disabled={current === 1}
          onClick={(e) => onPageChange(current - 1)}
        >Prev</button>
      </li>

      {Array.from({ length: Math.min(MAX_ITEMS, pages) })
        .map((_, index) => index + first)
        .map((page) => (
          <li key={`pagination-key-${page}`}>
            <button
              onClick={() => onPageChange(page)}
              className={`border-none p-4 rounded-2xl cursor-pointer ${page === current ? "bg-slate-950 text-white" : ""}`}
            >{page}
            </button>
          </li>
        ))
      }

      <li>
        <button
          className="border-none p-4 rounded-2xl cursor-pointer"
          onClick={(e) => onPageChange(current + 1)}
          disabled={current === pages} 
        >Next</button>
      </li>
    </ul>
  )
};