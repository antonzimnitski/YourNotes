import React from 'react';
import { connect } from 'react-redux';

import AddFolderModal from './AddFolderModal';
import RenameFolderModal from './RenameFolderModal';
import DeleteFolderConfirmationModal from './DeleteFolderConfirmationModal';
import AddTagModal from './AddTagModal';
import ShowDeleteNoteConfirmationModal from './DeleteNoteConfirmationModal';

const MODAL_COMPONENTS = {
  ADD_FOLDER: AddFolderModal,
  RENAME_FOLDER: RenameFolderModal,
  DELETE_FOLDER_CONFIRMATION: DeleteFolderConfirmationModal,
  ADD_TAG: AddTagModal,
  DELETE_NOTE_CONFIRMATION: ShowDeleteNoteConfirmationModal,
};

const ModalRoot = ({ modalType, modalProps }) => {
  if (!modalType) {
    return null;
  }

  const SpecificModal = MODAL_COMPONENTS[modalType];

  return <SpecificModal {...modalProps} />;
};

export default connect(state => state.modal)(ModalRoot);
