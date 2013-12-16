var Notes = Notes || {};
Notes.dataContext = (function () {
    var notesList = [],
        notesListStorageKey = "Notes.NotesList";
    var getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    var getNotesList = function () {
        return notesList;
    };
    var loadNotesFromLocalStorage = function () {
        var storedNotes = $.jStorage.get(notesListStorageKey);
        if (storedNotes !== null) {
            notesList = storedNotes;
        } else {
            notesList = [];
        }
    };
    var saveNotesToLocalStorage = function () {
        $.jStorage.set(notesListStorageKey, notesList);
    };
    var createBlankNote = function () {
        var dateCreated = new Date();
        var id = dateCreated.getTime().toString() + (getRandomInt(0, 100)).toString();
        var noteModel = new Notes.NoteModel({
            id: id,
            dateCreated: dateCreated,
            title: "",
            narrative: ""
        });
        return noteModel;
    };
    var saveNote = function (noteModel) {
        var found = false;
        var i;
        for (i = 0; i < notesList.length; i += 1) {
            if (notesList[i].id === noteModel.id) {
                notesList[i] = noteModel;
                found = true;
                i = notesList.length;
            }
        }
        if (!found) {
            notesList.splice(0, 0, noteModel);
        }
        saveNotesToLocalStorage();
    };
    var deleteNote = function (noteModel) {
        var i;
        for (i = 0; i < notesList.length; i += 1) {
            if (notesList[i].id === noteModel.id) {
                notesList.splice(i, 1);
                i = notesList.length;
            }
        }
        saveNotesToLocalStorage();
    };
    var init = function (storageKey) {
        notesListStorageKey = storageKey;
        loadNotesFromLocalStorage();
    };
    var public = {
        init: init,
        getNotesList: getNotesList,
        createBlankNote: createBlankNote,
        saveNote: saveNote,
        deleteNote: deleteNote
    };
    return public;
})();