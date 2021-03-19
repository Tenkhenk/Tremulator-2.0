import React, { useContext, useEffect } from "react";
import { CollectionList } from "../components/collection-list";
import { AppContext } from "../context/app-context";

interface Props {}
export const CollectionListPage: React.FC<Props> = (props: Props) => {
  return <CollectionList />;
};
