import React, { FC } from "react";
import { AnnotationType } from "../../types";
import { AccordionAnnotation } from "./accordion-annotation";

interface Props {
  selected?: number | null;
  annotations: Array<AnnotationType>;
}
export const AnnotationAccordion: FC<Props> = (props: Props) => {
  const { annotations, selected } = props;

  return (
    <div className="accordion">
      {annotations.map((annotation) => {
        return (
          <AccordionAnnotation
            key={annotation.id}
            className={annotation.id === selected ? "selected" : ""}
            annotation={annotation}
          />
        );
      })}
    </div>
  );
};
