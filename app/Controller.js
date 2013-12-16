var Notes = Notes || {};

Notes.controller = (function ($, dataContext) {
    var notesListPageId = "notes-list-page";
    var notesListSelector = "#notes-list-content";
    var appStorageKey = "Notes.NotesList";
    var noteEditorPageId = "note-editor-page";
    var noteTitleEditorSel = "[name=note-title-editor]",
        noteNarrativeEditorSel = "[name=note-narrative-editor]";
    var saveNoteButtonSel = "#save-note-button";
    var invalidNoteDlgSel = "#invalid-note-dialog";
    var defaultDlgTrsn = { transition: "slideup" };
    var confirmDeleteNoteDlgSel = "#confirm-delete-note-dialog";
    var deleteNoteButtonSel = "#delete-note-button",
        deleteNoteContentPlaceholderSel = "#delete-note-content-placeholder",
        okToDeleteNoteButtonSel = "#ok-to-delete-note-button";

    var queryStringToObject = function (queryString) {
        var queryStringObj = {};
        var e;
        var a = /\+/g;  // Replace + symbol with a space
        var r = /([^&;=]+)=?([^&;]*)/g;
        var d = function (s) { return decodeURIComponent(s.replace(a, " ")); };
        e = r.exec(queryString);
        while (e) {
            queryStringObj[d(e[1])] = d(e[2]);
            e = r.exec(queryString);

        }
        return queryStringObj;
    };
    var returnToNotesListPage = function () {

        $.mobile.changePage("#" + notesListPageId,
        { transition: "slide", reverse: true });
    };
    var resetCurrentNote = function () {
        currentNote = null;
    };
    var renderNotesList = function () {
        var notesList = dataContext.getNotesList();
        var view = $(notesListSelector);
        view.empty();

        var liArray = [],
            notesCount,
            note,
            i,
            ul,
            liHtml,
            dateGroup,
            noteDate;

        notesCount = notesList.length;
        ul = $("<ul id=\"notes-list\" data-role=\"listview\"></ul>").appendTo(view);

        for (i = 0; i < notesCount; i += 1) {

            note = notesList[i];

            noteDate = (new Date(note.dateCreated)).toDateString();

            if (dateGroup !== noteDate) {
                liArray.push("<li data-role=\"list-divider\">" + noteDate + "</li>");
                dateGroup = noteDate;
            }

            liHtml = "<li>"
            + "<a data-url=\"default.html#note-editor-page?noteId=" + note.id + "\" href=\"default.html#note-editor-page?noteId=" + note.id + "\">"
            + "<div class=\"list-item-title\">" + note.title + "</div>"
            + "<div class=\"list-item-narrative\">" + note.narrative + "</div>"
            + "</a>"
            + "</li>"

            liArray.push(liHtml);

        }
        var listItems = liArray.join("");
        $(listItems).appendTo(ul);
        ul.listview();
    };

    var renderSelectedNote = function (data) {
        var u = $.mobile.path.parseUrl(data.options.fromPage.context.URL);
        var re = "^#" + noteEditorPageId;
        if (u.hash.search(re) !== -1) {
            var queryStringObj = queryStringToObject(data.options.queryString);
            var titleEditor = $(noteTitleEditorSel);
            var narrativeEditor = $(noteNarrativeEditorSel);
            var noteId = queryStringObj["noteId"];
            if (typeof noteId !== "undefined") {
                // We're editing an existing note. Load the note’s properties in the editor. 
                var notesList = dataContext.getNotesList();
                var notesCount = notesList.length;
                var note;
                for (var i = 0; i < notesCount; i++) {
                    note = notesList[i];
                    if (noteId === note.id) {
                        currentNote = note;
                        titleEditor.val(currentNote.title);
                        narrativeEditor.val(currentNote.narrative);
                    }
                }
            } else {
                // We're creating a note. Reset the fields.
                titleEditor.val("");
                narrativeEditor.val("");
            }
            titleEditor.focus();
        }
    };
    var onPageBeforeChange = function (event, data) {
        if (typeof data.toPage === "string") {
            var url = $.mobile.path.parseUrl(data.toPage);
            if ($.mobile.path.isEmbeddedPage(url)) {
                data.options.queryString = $.mobile.path.parseUrl(url.hash.replace(/^#/, "")).search.replace("?", "");
            }
        }
    };
    var onPageChange = function (event, data) {
        var toPageId = data.toPage.attr("id");
        var fromPageId = null;
        if (data.options.fromPage) {
            fromPageId = data.options.fromPage.attr("id");
        }
        switch (toPageId) {
            case notesListPageId:
                resetCurrentNote(); // <-- Reset reference to the note being edited.
                renderNotesList();
                break;
            case noteEditorPageId:
                if (fromPageId === notesListPageId) {
                    renderSelectedNote(data);
                }
                break;
        }
    };
    var onSaveNoteButtonTapped = function () {
        // Validate note.
        var titleEditor = $(noteTitleEditorSel);
        var narrativeEditor = $(noteNarrativeEditorSel);
        var tempNote = dataContext.createBlankNote();
        tempNote.title = titleEditor.val();
        tempNote.narrative = narrativeEditor.val();
        if (tempNote.isValid()) {
            if (null !== currentNote) {
                currentNote.title = tempNote.title;
                currentNote.narrative = tempNote.narrative;
            } else {
                currentNote = tempNote;
            }
            dataContext.saveNote(currentNote);
            returnToNotesListPage();
        } else {
            // Inform the user the note is invalid.
            $.mobile.changePage(invalidNoteDlgSel, defaultDlgTrsn);
        }
    };
    var onDeleteNoteButtonTapped = function () {
        if (currentNote) {
            // Render selected note in confirmation dlg.
            // Deletion will be handled elsewhere, after user confirms it's ok to delete.
            var noteContentPlaceholder = $(deleteNoteContentPlaceholderSel);
            noteContentPlaceholder.empty();
            $("<h3>" + currentNote.title + "</h3><p>" + currentNote.narrative + "</p>").appendTo(noteContentPlaceholder);
            $.mobile.changePage(confirmDeleteNoteDlgSel, defaultDlgTrsn);
        }
    };
    var onOKToDeleteNoteButtonTapped = function () {
        dataContext.deleteNote(currentNote);
        returnToNotesListPage();
    };
    var init = function () {
        dataContext.init("Notes.NotesList");
        var d = $(document);
        d.bind("pagebeforechange", onPageBeforeChange);
        d.bind("pagechange", onPageChange);
        d.delegate(saveNoteButtonSel, "tap", onSaveNoteButtonTapped);
        d.delegate(deleteNoteButtonSel, "tap", onDeleteNoteButtonTapped);
        d.delegate(okToDeleteNoteButtonSel, "tap", onOKToDeleteNoteButtonTapped);
    };
    var public = {
        init: init
    };
    return public;
})(jQuery, Notes.dataContext);
$(document).bind("mobileinit", function () {
    Notes.controller.init();
});