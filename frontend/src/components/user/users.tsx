import React from "react";
import { CollectionModelFull } from "../../types";
import { UserCard, OwnerCard } from "./user-card";

interface Props {
  collection: CollectionModelFull;
  onUpdate?: () => void;
}

export const CollectionUsers: React.FC<Props> = (props: Props) => {
  const { collection, onUpdate } = props;

  return (
    <>
      {/* LIST USER */}
      <div className="d-flex flex-wrap justify-content-center mt-3">
        <OwnerCard key={collection.owner.email} user={collection.owner} />
        {collection.users.map((user) => (
          <UserCard key={user.email} user={user} collection={collection} onDelete={onUpdate} />
        ))}
      </div>
    </>
  );
};
