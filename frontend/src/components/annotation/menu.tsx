import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { SchemaModel } from "../../types";
import { Link } from "react-router-dom";

interface Props {
  schemas: SchemaModel[];
}
export const AnnotationsMenu: FC<Props> = (props: Props) => {
  const { schemas } = props;

  // annotation menu
  const annotationsMenu = useRef(null);
  const [annotationsMenuOpened, setAnnotationsMenuOpened] = useState<boolean>(false);
  const closeAnnotationsMenu = useCallback(
    (e: MouseEvent) => {
      if (e.target !== annotationsMenu.current) setAnnotationsMenuOpened(false);
    },
    [setAnnotationsMenuOpened, annotationsMenu],
  );

  useEffect(() => {
    document.body.addEventListener("click", closeAnnotationsMenu);
    return function cleanup() {
      document.body.removeEventListener("click", closeAnnotationsMenu);
    };
  }, [closeAnnotationsMenu]);

  return (
    <div className="dropdown">
      <button
        className="btn btn-link dropdown-toggle px-2"
        ref={annotationsMenu}
        onClick={() => setAnnotationsMenuOpened((prev) => !prev)}
      >
        <i className="fas fa-vector-square mr-2"></i>
        {schemas.reduce((total, s) => total + s.nb_annotations, 0)} Annotations
      </button>
      <ul className={`dropdown-menu ${annotationsMenuOpened ? "show" : ""}`}>
        {schemas.map((s) => (
          <li key={s.id} className="dropdown-item px-2">
            <Link
              title={`list ${s.name} annotations`}
              to={`/collections/${s.collection_id}/schemas/${s.id}/annotations`}
            >
              <i className="fas fa-vector-square mr-2"></i>
              {s.nb_annotations}
              <span className="ml-2">{s.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
