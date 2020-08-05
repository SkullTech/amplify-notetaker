import React, {useEffect, useState} from 'react';
import {API, graphqlOperation} from 'aws-amplify';
import {withAuthenticator} from 'aws-amplify-react';
import {createNote, deleteNote, updateNote} from "./graphql/mutations";
import {listNotes} from "./graphql/queries";

function App() {
    const [notes, setNotes] = useState([]);
    const [note, setNote] = useState("");
    const [id, setId] = useState("");

    const hasExistingNote = () => {
        if (id) {
            return notes.findIndex(note => note.id === id) > -1
        }
        return false;
    }

    const handleChangeNote = event => setNote(event.target.value);

    const handleAddNote = async event => {
        event.preventDefault();
        if (hasExistingNote()) {
            handleUpdateNote();
        } else {
            const result = await API.graphql(graphqlOperation(createNote, {input: {note}}));
            setNotes([result.data.createNote, ...notes]);
            setNote("");
        }
    }

    const handleUpdateNote = async () => {
        const result = await API.graphql(graphqlOperation(updateNote, {input: {id: id, note: note}}))
        const updatedNote = result.data.updateNote;
        const index = notes.findIndex(note => note.id === updatedNote.id)
        setNotes([...notes.slice(0, index), updatedNote, ...notes.slice(index + 1)])
        setNote("")
        setId("");
    }

    const handleDeleteNote = async noteId => {
        const result = await API.graphql(graphqlOperation(deleteNote, {input: {id: noteId}}))
        const updatedNotes = notes.filter(note => note.id !== result.data.deleteNote.id);
        setNotes(updatedNotes);
    }

    const handleSetNote = ({note, id}) => {
        setNote(note);
        setId(id);
    }

    useEffect(() => {
        const fetchNotes = async () => {
            const result = await API.graphql(graphqlOperation(listNotes));
            const notes = result.data.listNotes.items;
            setNotes(notes);
        }
        fetchNotes();
    }, [])

    return (
        <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
            <h1 className="code f2-l">Amplify Notetaker</h1>
            <form className="mb3"
                  onSubmit={handleAddNote}>
                <input type="text" className="pa2 f4" placeholder="Write your note" onChange={handleChangeNote}
                       value={note}/>
                <button className="pa2 f4" type="submit">{id ? "Update Note" : "Add Note"}</button>
            </form>
            <div>
                {notes.map(item => (
                    <div key={item.id} className="flex items-center">
                        <li className="list pa1 f3" onClick={() => handleSetNote(item)}>
                            {item.note}
                        </li>
                        <button className="bg-transparent bn f4" onClick={() => handleDeleteNote(item.id)}>
                            <span>&times;</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default withAuthenticator(App, {includeGreetings: true});
