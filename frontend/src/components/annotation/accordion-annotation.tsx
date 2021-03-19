import React, { FC } from "react";
import { AnnotationType } from "../../types";

interface Props {
  annotation: AnnotationType;
  className?: string;
  onClick: () => void;
}
export const AccordionAnnotation: FC<Props> = (props: Props) => {
  const { annotation, className, onClick } = props;

  return (
    <div className={`card ${className}`}>
      <div
        className="card-header"
        onClick={() => {
          onClick();
        }}
      >
        <h5>Annotation #{annotation.id}</h5>
      </div>
      <div className="card-body">
        {Object.keys(annotation.data).map((field) => (
          <div key={field} className="field">
            <span>{field}</span>
            <span>{annotation.data[field]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
