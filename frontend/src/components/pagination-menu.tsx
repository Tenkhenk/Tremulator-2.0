import React, { FC } from "react";

interface Props {
  page: number;
  totalPages: number;
  changePage: (page: number) => void;
}

export const PaginationMenu: FC<Props> = (props: Props) => {
  const { page, totalPages, changePage } = props;
  return (
    <h3>
      <button
        className={`btn btn-link ${page === 1 ? "disabled" : ""}`}
        onClick={() => changePage(page - 1)}
        title="next annotations page"
      >
        <i className="fas fa-caret-left"></i>
      </button>
      page {page}/{totalPages}
      <button
        className={`btn btn-link ${page < totalPages ? "" : "disabled"}`}
        onClick={() => changePage(page + 1)}
        title="next annotations page"
      >
        <i className="fas fa-caret-right"></i>
      </button>
    </h3>
  );
};
