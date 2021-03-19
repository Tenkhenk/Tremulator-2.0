import React, { FC } from "react";
import { AnnotationType } from "../../types";
import { AccordionAnnotation } from "./accordion-annotation";

interface Props {
  selected?: number | null;
  onClick: (a: AnnotationType) => void;
  annotations: Array<AnnotationType>;
}
export const AnnotationAccordion: FC<Props> = (props: Props) => {
  const { annotations, onClick, selected } = props;

  return (
    <div className="accordion">
      {annotations.map((annotation) => {
        return (
          <AccordionAnnotation
            onClick={() => onClick(annotation)}
            key={annotation.id}
            className={annotation.id === selected ? "selected" : ""}
            annotation={annotation}
          />
        );
      })}
    </div>
  );
};
