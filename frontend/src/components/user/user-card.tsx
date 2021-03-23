import React, { useContext, useState } from "react";
import { AppContext } from "../../context/app-context";
import { useDelete } from "../../hooks/api";
import { CollectionModelFull, UserModel } from "../../types";
import Loader from "../loader";
import ModalPortal from "../modal";

interface Props {
  user: UserModel;
  collection: CollectionModelFull;
  onDelete?: () => void;
}
const userDisplayName = (user: UserModel) => [user.firstname || "", user.lastname || ""].join(" ");

export const OwnerCard: React.FC<{ user: UserModel }> = (props: { user: UserModel }) => {
  const { user } = props;

  return (
    <>
      <div className="user-card">
        <div className="user-card-body">
          {userDisplayName(user)} - {user.email}
        </div>
        <div className="user-card-action">
          <i className="fas fa-user-lock" title="Owner of the collection"></i>
        </div>
      </div>
    </>
  );
};

export const UserCard: React.FC<Props> = (props: Props) => {
  const { user, collection, onDelete } = props;
  const { setAlertMessage } = useContext(AppContext);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [delUser, { loading }] = useDelete<{ email: string }>(`/collections/${collection.id}/users`);

  return (
    <>
      <div className="user-card">
        <div className="user-card-body">
          {userDisplayName(user)} - {user.email}
        </div>
        <div className="user-card-action">
          <button
            title={`Remove user "${user.email}"`}
            className="btn btn-link"
            onClick={() => setDeleteConfirmation(true)}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      {deleteConfirmation && (
        <ModalPortal title="Confirmation needed" icon="fa-question-circle" onClose={() => setDeleteConfirmation(false)}>
          <>
            <div className="modal-body">
              {loading && <Loader />}
              {!loading && (
                <div className="text-center h5">
                  You are about to remove the user "{userDisplayName(user)}" from the collection.
                </div>
              )}
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteConfirmation(false)}>
                  <i className="fas fa-window-close"></i>
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  disabled={loading}
                  onClick={async (e) => {
                    try {
                      await delUser({ email: user.email });
                      setAlertMessage({
                        message: `User ${userDisplayName(user)} removed from collection '${collection.name}'`,
                        type: "success",
                      });
                    } catch (error) {
                      setAlertMessage({
                        message: `Error when removing user ${userDisplayName(user)}: "${error?.message}"`,
                        type: "warning",
                      });
                    } finally {
                      if (onDelete) onDelete();
                      setDeleteConfirmation(false);
                    }
                  }}
                >
                  <i className={`fas fa-trash-alt`}></i>
                  Delete
                </button>
              </div>
            </div>
          </>
        </ModalPortal>
      )}
    </>
  );
};
