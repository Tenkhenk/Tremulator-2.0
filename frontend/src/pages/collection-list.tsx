import React from "react";
import { CollectionList } from "../components/collection-list";

interface Props {}
export const CollectionListPage: React.FC<Props> = (props: Props) => {
  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <CollectionList />
        </div>
      </div>
    </div>
  );
};
