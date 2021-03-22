import React, { FC } from "react";
import { AnnotationModel, CollectionModelFull } from "../../types";
import { Annotation } from "./annotation";

interface Props {
  selected?: number | null;
  setSelected: (a: AnnotationModel | null) => void;
  editMode: boolean;
  setEditMode: (b: boolean) => void;
  onSaved: () => void;
  collection: CollectionModelFull;
  annotations: Array<AnnotationModel>;
}
export const AnnotationAccordion: FC<Props> = (props: Props) => {
  const { annotations, collection, editMode, setEditMode, selected, setSelected, onSaved } = props;

  return (
    <div className="accordion">
      {annotations.map((annotation) => {
        return (
          <Annotation
            key={annotation.id}
            isSelected={annotation.id === selected}
            editMode={editMode}
            collection={collection}
            annotation={annotation}
            toggleSelected={(force?: boolean) => {
              if (force === true) setSelected(annotation);
              else setSelected(selected === annotation.id ? null : annotation);
            }}
            setEditMode={setEditMode}
            onSaved={onSaved}
          />
        );
      })}
    </div>
  );
};
