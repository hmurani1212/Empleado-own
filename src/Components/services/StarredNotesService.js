import notesPoolApi from '../Model/Data/NotesPool/NotesPool';
import { showToast } from '../Components/Toaster/Toaster';

const starredNotesService = (set, get) => ({
  // Global starred notes state
  starredNotes: new Set(),
  starLoading: {},
  isStarredNotesInitialized: false,
  starStateVersion: 0, // Version counter to force re-renders

  // Fetch starred notes from API
  fetchStarredNotes: async () => {
    try {
      const response = await notesPoolApi.getStarredNotes();

      if (response.status === 200 && (response.data.STATUS === 'SUCCESSFUL' || response.data.status === 'success')) {
        const starredData = response.data.DB_DATA || response.data.data || response.data || [];
        
        // Check if the data might be nested further
        let finalData = starredData;
        if (Array.isArray(starredData) && starredData.length > 0) {
          const firstItem = starredData[0];
          if (firstItem.notes || firstItem.note_data) {
            finalData = firstItem.notes || firstItem.note_data || starredData;
          }
        }

        // Extract note IDs and create a Set
        const starredIds = new Set();
        if (Array.isArray(finalData)) {
          finalData.forEach(note => {
            const noteId = String(note.notes_id || note.note_id || note.id);
            if (noteId && noteId !== 'undefined') {
              starredIds.add(noteId);
            }
          });
        }

        set(state => ({ 
          starredNotes: starredIds,
          isStarredNotesInitialized: true,
          starStateVersion: state.starStateVersion + 1
        }));

      } else {

        set(state => ({ 
          starredNotes: new Set(),
          isStarredNotesInitialized: true,
          starStateVersion: state.starStateVersion + 1
        }));
      }
    } catch (error) {
      console.error('Error fetching starred notes in global service:', error);
      set(state => ({ 
        starredNotes: new Set(),
        isStarredNotesInitialized: true,
        starStateVersion: state.starStateVersion + 1
      }));
    }
  },

  // Add note to favorites
  addToFavorites: async (note, e) => {
    if (e) e.stopPropagation(); // Prevent note click

    const noteId = String(note.note_id || note.notes_id || note.id || note._id);
    if (!noteId || noteId === 'undefined') {
      console.error('No note ID found for starring');
      console.error('Available note properties:', Object.keys(note));
      return;
    }

    // Optimistically update the UI first
    set(state => {
      let newStarredNotes;
      if (Array.isArray(state.starredNotes)) {
        // If it's an array, keep it as array and add the note
        newStarredNotes = [...state.starredNotes];
        if (!newStarredNotes.some(n => String(n.note_id || n.notes_id || n.id || n._id) === noteId)) {
          newStarredNotes.push({ note_id: noteId, id: noteId });
        }
      } else {
        // If it's a Set, keep it as Set
        newStarredNotes = new Set(state.starredNotes);
        newStarredNotes.add(noteId);
      }
      return {
        starredNotes: newStarredNotes,
        starLoading: { ...state.starLoading, [noteId]: true },
        starStateVersion: state.starStateVersion + 1
      };
    });

    try {
      console.log('Making API call to add to favorites...');
      const apiPayload = { note_id: noteId, is_starred: true };
      console.log('API payload being sent:', apiPayload);
      console.log('API URL will be: api/v1/shared_and_fav/share/favourite?note_id=' + noteId);
      
      const response = await notesPoolApi.toggleNoteStar(apiPayload);

      if (response.status === 200 && (response.data.STATUS === 'SUCCESSFUL' || response.data.status === 'success')) {
        set(state => ({
          starLoading: { ...state.starLoading, [noteId]: false },
          starStateVersion: state.starStateVersion + 1
        }));
        setTimeout(() => {
          const { fetchStarredNotes } = get();
          fetchStarredNotes();
        }, 100);

      } else {
        
        // Revert the optimistic update on failure
        set(state => {
          let newStarredNotes;
          if (Array.isArray(state.starredNotes)) {
            newStarredNotes = state.starredNotes.filter(n => String(n.note_id || n.notes_id || n.id || n._id) !== noteId);
          } else {
            newStarredNotes = new Set(state.starredNotes);
            newStarredNotes.delete(noteId);
          }
          return {
            starredNotes: newStarredNotes,
            starLoading: { ...state.starLoading, [noteId]: false },
            starStateVersion: state.starStateVersion + 1
          };
        });

        showToast('Failed to add note to favorites', 'error');
      }
    } catch (error) {
      console.error('Error adding note to favorites:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Revert the optimistic update on error
      set(state => {
        let newStarredNotes;
        if (Array.isArray(state.starredNotes)) {
          newStarredNotes = state.starredNotes.filter(n => String(n.note_id || n.notes_id || n.id || n._id) !== noteId);
        } else {
          newStarredNotes = new Set(state.starredNotes);
          newStarredNotes.delete(noteId);
        }
        return {
          starredNotes: newStarredNotes,
          starLoading: { ...state.starLoading, [noteId]: false },
          starStateVersion: state.starStateVersion + 1
        };
      });

      const errorMsg = error.response?.data?.ERROR_DESCRIPTION || 'Error adding note to favorites';
      showToast(errorMsg, 'error');
    }
  },

  // Remove note from favorites
  removeFromFavorites: async (note, e) => {
    if (e) e.stopPropagation(); // Prevent note click

    const noteId = String(note.note_id || note.notes_id || note.id || note._id);
    if (!noteId || noteId === 'undefined') {
      console.error('No note ID found for unstarring');
      console.error('Available note properties:', Object.keys(note));
      return;
    }

    // Optimistically update the UI first
    set(state => {
      let newStarredNotes;
      if (Array.isArray(state.starredNotes)) {
        newStarredNotes = state.starredNotes.filter(n => String(n.note_id || n.notes_id || n.id || n._id) !== noteId);
      } else {
        newStarredNotes = new Set(state.starredNotes);
        newStarredNotes.delete(noteId);
      }
      return {
        starredNotes: newStarredNotes,
        starLoading: { ...state.starLoading, [noteId]: true },
        starStateVersion: state.starStateVersion + 1
      };
    });

    try {
      const response = await notesPoolApi.removeNoteStar({
        note_id: noteId
      });

      if (response.status === 200 && (response.data.STATUS === 'SUCCESSFUL' || response.data.status === 'success')) {
        set(state => ({
          starLoading: { ...state.starLoading, [noteId]: false },
          starStateVersion: state.starStateVersion + 1
        }));

        showToast('Note unstarred successfully!', 'success');
      } else {

        // Revert the optimistic update on failure
        set(state => {
          let newStarredNotes;
          if (Array.isArray(state.starredNotes)) {
            newStarredNotes = [...state.starredNotes, { note_id: noteId, id: noteId }];
          } else {
            newStarredNotes = new Set(state.starredNotes);
            newStarredNotes.add(noteId);
          }
          return {
            starredNotes: newStarredNotes,
            starLoading: { ...state.starLoading, [noteId]: false },
            starStateVersion: state.starStateVersion + 1
          };
        });

        showToast('Failed to remove note from favorites', 'error');
      }
    } catch (error) {
      console.error('Error removing note from favorites:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Revert the optimistic update on error
      set(state => {
        let newStarredNotes;
        if (Array.isArray(state.starredNotes)) {
          newStarredNotes = [...state.starredNotes, { note_id: noteId, id: noteId }];
        } else {
          newStarredNotes = new Set(state.starredNotes);
          newStarredNotes.add(noteId);
        }
        return {
          starredNotes: newStarredNotes,
          starLoading: { ...state.starLoading, [noteId]: false },
          starStateVersion: state.starStateVersion + 1
        };
      });

      showToast('Error removing note from favorites', 'error');
    }
  },

  // Smart star handler - determines whether to add or remove based on current state
  handleStarClick: async (note, e) => {
    const noteId = String(note.note_id || note.notes_id || note.id || note._id);
    const { isStarred } = get();
    const isCurrentlyStarred = isStarred(noteId);
    
    if (isCurrentlyStarred) {
      await get().removeFromFavorites(note, e);
    } else {
      await get().addToFavorites(note, e);
    }
  },

  // Check if a note is starred
  isStarred: (noteId) => {
    const { starredNotes } = get();
    const normalizedNoteId = String(noteId);
    // Handle case where starredNotes might be an array instead of Set
    if (Array.isArray(starredNotes)) {
      return starredNotes.some(note => {
        const id = String(note.note_id || note.notes_id || note.id || note._id);
        return id === normalizedNoteId;
      });
    }
    // Handle Set case
    if (starredNotes && typeof starredNotes.has === 'function') {
      return starredNotes.has(normalizedNoteId);
    }
    return false;
  },

  // Refresh starred notes (useful for manual refresh)
  refreshStarredNotes: () => {
    const { fetchStarredNotes } = get();
    fetchStarredNotes();
  },

  // Initialize starred notes (call this on app start)
  initializeStarredNotes: () => {
    const { fetchStarredNotes, isStarredNotesInitialized } = get();
    if (!isStarredNotesInitialized) {
      fetchStarredNotes();
    } else {
      console.error('Starred notes already initialized, skipping...');
    }
  }
});

export default starredNotesService;
