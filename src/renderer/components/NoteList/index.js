/* eslint-disable consistent-return */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { func } from 'prop-types';

import getSearchKey from '../lib/getSearchKey';
import getNotes from '../lib/getNotes';
import {
  notesDataType, locationType, historyType, sortByType,
} from '../../types';

import { updateNote, showDeleteNoteConfirmationModal } from '../../actions';
import updateNoteApi from '../../../lib/updateNote';

import context from '../../../lib/context';

import NoteItem from './NoteItem';

function sortByUpdatedAtDesc(a, b) {
  return new Date(b.updatedAt) - new Date(a.updatedAt);
}

function sortByUpdatedAtAsc(a, b) {
  return new Date(a.updatedAt) - new Date(b.updatedAt);
}

function sortByCreatedAtDesc(a, b) {
  return new Date(b.createdAt) - new Date(a.createdAt);
}

function sortByCreatedAtAsc(a, b) {
  return new Date(a.createdAt) - new Date(b.createdAt);
}

function sortByAlphabeticalDesc(a, b) {
  return b.title.localeCompare(a.title);
}

function sortByAlphabeticalAsc(a, b) {
  return a.title.localeCompare(b.title);
}

const SORT_BY = {
  UPDATED_AT: {
    DESC: sortByUpdatedAtDesc,
    ASC: sortByUpdatedAtAsc,
  },
  CREATED_AT: {
    DESC: sortByCreatedAtDesc,
    ASC: sortByCreatedAtAsc,
  },
  ALPHABETICAL: {
    DESC: sortByAlphabeticalDesc,
    ASC: sortByAlphabeticalAsc,
  },
};

class NoteList extends Component {
  static propTypes = {
    notesData: notesDataType.isRequired,
    location: locationType.isRequired,
    history: historyType.isRequired,
    dispatch: func.isRequired,
    sortBy: sortByType.isRequired,
  };

  notes = [];

  constructor() {
    super();

    this.handleDeleteNote = this.handleDeleteNote.bind(this);
    this.handleStarClick = this.handleStarClick.bind(this);
    this.handleRestore = this.handleRestore.bind(this);
    this.handleTrash = this.handleTrash.bind(this);
    this.handleNoteClick = this.handleNoteClick.bind(this);
    this.handleNoteContextMenu = this.handleNoteContextMenu.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { location, history } = this.props;
    const { pathname } = location;
    const visibleNoteKeys = this.notes.map(note => note.key);
    const note = this.notes[0];
    const prevKey = getSearchKey(prevProps.location);
    const curKey = getSearchKey(location);
    const noteKey = visibleNoteKeys.includes(prevKey) ? prevKey : note && note.key;

    if (note && curKey === null) {
      history.replace({
        pathname,
        search: `key=${noteKey}`,
      });
    }
  }

  handleDeleteNote(note) {
    const { dispatch } = this.props;

    dispatch(showDeleteNoteConfirmationModal(note));
  }

  handleNoteClick(noteKey) {
    const { location, history } = this.props;
    const searchKey = getSearchKey(location);
    const { pathname } = location;

    if (noteKey && searchKey !== noteKey) {
      history.push({
        pathname,
        search: `key=${noteKey}`,
      });
    }
  }

  handleNoteContextMenu(note) {
    const { location } = this.props;
    const searchKey = getSearchKey(location);
    const { pathname } = location;
    const { key } = note;

    if (searchKey !== key) {
      this.handleNoteClick(key);
    }

    const deleteNoteLabel = 'Delete Note';
    const restoreNoteLabel = 'Restore Note';
    const moveToTrashLabel = 'Move to trash';

    const templates = [];

    if (pathname === '/trash') {
      templates.push(
        {
          label: restoreNoteLabel,
          click: () => this.handleRestore(note),
        },
        {
          label: deleteNoteLabel,
          click: () => this.handleDeleteNote(note),
        },
      );
    } else {
      templates.push({
        label: moveToTrashLabel,
        click: () => this.handleTrash(note),
      });
    }

    context.popup(templates);
  }

  handleStarClick(note) {
    const { dispatch } = this.props;

    const newNote = Object.assign({}, note, { isStarred: !note.isStarred });

    updateNoteApi(newNote)
      .then(data => dispatch(updateNote(data)))
      .catch(error => console.log('Error in handleStarClick() in NoteItem component', error));
  }

  handleTrash(note) {
    const { dispatch } = this.props;

    const newNote = Object.assign({}, note, { isStarred: false, isTrashed: true });

    updateNoteApi(newNote)
      .then(data => dispatch(updateNote(data)))
      .catch(error => console.log('Error in handleTrash() in NoteItem component', error));
  }

  handleRestore(note) {
    const { dispatch } = this.props;

    const newNote = Object.assign({}, note, { isTrashed: false });

    updateNoteApi(newNote)
      .then(data => dispatch(updateNote(data)))
      .catch(error => console.log('Error in handleRestore() in NoteItem component', error));
  }

  render() {
    const { location, notesData, sortBy } = this.props;
    const { pathname } = location;
    const { sortField, sortOrder } = sortBy;

    const notes = getNotes(pathname, notesData);
    const sortByFunction = SORT_BY[sortField][sortOrder];
    this.notes = notes.sort(sortByFunction);
    const locationKey = getSearchKey(location);

    const noteList = notes
      && notes.map((note) => {
        const isActive = locationKey === note.key;
        return (
          <NoteItem
            key={note.key}
            isActive={isActive}
            note={note}
            handleStarClick={this.handleStarClick}
            handleNoteClick={this.handleNoteClick}
            handleNoteContextMenu={this.handleNoteContextMenu}
          />
        );
      });

    return <div className="notelist">{noteList}</div>;
  }
}

export default withRouter(connect(null)(NoteList));
