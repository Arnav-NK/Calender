document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthDisplay = document.getElementById('monthDisplay');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const todayBtn = document.getElementById('todayBtn');
    
    const noteModal = document.getElementById('noteModal');
    const modalDateDisplay = document.getElementById('modalDateDisplay');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const notesList = document.getElementById('notesList');
    const noteTime = document.getElementById('noteTime');
    const noteText = document.getElementById('noteText');
    const addNoteBtn = document.getElementById('addNoteBtn');

    const editNoteModal = document.getElementById('editNoteModal');
    const closeEditModalBtn = document.getElementById('closeEditModalBtn');
    const editNoteTime = document.getElementById('editNoteTime');
    const editNoteText = document.getElementById('editNoteText');
    const saveEditNoteBtn = document.getElementById('saveEditNoteBtn');

    let currentDate = new Date();
    let selectedDateString = null;
    let editingNoteId = null;

    // Load notes from localStorage
    // Structure: { 'YYYY-MM-DD': [{ id: '123', time: '14:30', text: 'Meeting' }] }
    let notesData = JSON.parse(localStorage.getItem('minimalCalendarNotes')) || {};

    function saveNotesData() {
        localStorage.setItem('minimalCalendarNotes', JSON.stringify(notesData));
    }

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const startingDay = firstDayOfMonth.getDay();
        
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthDisplay.textContent = `${monthNames[month]} ${year}`;
        
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

        // Empty cells before start of month
        for (let i = 0; i < startingDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyCell);
        }

        // Days of month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            
            if (isCurrentMonth && i === today.getDate()) {
                dayCell.classList.add('today');
            }
            
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            const dayNumber = document.createElement('div');
            dayNumber.classList.add('day-number');
            dayNumber.textContent = i;
            dayCell.appendChild(dayNumber);
            
            // Check if there are notes for this day
            if (notesData[dateString] && notesData[dateString].length > 0) {
                const indicator = document.createElement('div');
                indicator.classList.add('day-indicator');
                dayCell.appendChild(indicator);
            }

            dayCell.addEventListener('click', () => openNoteModal(dateString));
            
            calendarGrid.appendChild(dayCell);
        }
    }

    function openNoteModal(dateString) {
        selectedDateString = dateString;
        
        // Format date for display (e.g. Oct 15, 2023)
        const [y, m, d] = dateString.split('-');
        const dateObj = new Date(y, m - 1, d);
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        modalDateDisplay.textContent = dateObj.toLocaleDateString('en-US', options);
        
        renderNotesList();
        
        // Reset inputs to current time
        const now = new Date();
        noteTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        noteText.value = '';
        
        noteModal.classList.remove('hidden');
    }

    function closeNoteModal() {
        noteModal.classList.add('hidden');
        selectedDateString = null;
        renderCalendar(); // Re-render to update indicators
    }

    function formatTime(time24) {
        const [hours, minutes] = time24.split(':');
        let h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12; // the hour '0' should be '12'
        return `${String(h).padStart(2, '0')}:${minutes} ${ampm}`;
    }

    function renderNotesList() {
        notesList.innerHTML = '';
        
        if (!notesData[selectedDateString] || notesData[selectedDateString].length === 0) {
            notesList.innerHTML = '<p style="color: #666; font-style: italic; text-align: center; margin-top: 20px;">No notes for this day.</p>';
            return;
        }

        // Sort notes chronologically
        const dayNotes = [...notesData[selectedDateString]].sort((a, b) => a.time.localeCompare(b.time));

        dayNotes.forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.classList.add('note-item');
            
            const contentDiv = document.createElement('div');
            
            const timeEl = document.createElement('div');
            timeEl.classList.add('note-time');
            timeEl.textContent = formatTime(note.time);
            
            const textEl = document.createElement('div');
            textEl.classList.add('note-text');
            textEl.textContent = note.text;
            
            contentDiv.appendChild(timeEl);
            contentDiv.appendChild(textEl);
            
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('note-actions');
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => openEditModal(note));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Del';
            deleteBtn.addEventListener('click', () => deleteNote(note.id));
            
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            
            noteEl.appendChild(contentDiv);
            noteEl.appendChild(actionsDiv);
            
            notesList.appendChild(noteEl);
        });
    }

    function addNote() {
        const time = noteTime.value;
        const text = noteText.value.trim();
        
        if (!time || !text) return;
        
        if (!notesData[selectedDateString]) {
            notesData[selectedDateString] = [];
        }
        
        const newNote = {
            id: Date.now().toString(),
            time: time,
            text: text
        };
        
        notesData[selectedDateString].push(newNote);
        saveNotesData();
        
        noteText.value = '';
        renderNotesList();
    }

    function deleteNote(id) {
        if (confirm('Delete this note?')) {
            notesData[selectedDateString] = notesData[selectedDateString].filter(n => n.id !== id);
            saveNotesData();
            renderNotesList();
        }
    }

    function openEditModal(note) {
        editingNoteId = note.id;
        editNoteTime.value = note.time;
        editNoteText.value = note.text;
        editNoteModal.classList.remove('hidden');
    }

    function closeEditModal() {
        editNoteModal.classList.add('hidden');
        editingNoteId = null;
    }

    function saveEditedNote() {
        const time = editNoteTime.value;
        const text = editNoteText.value.trim();
        
        if (!time || !text || !editingNoteId) return;

        const noteIndex = notesData[selectedDateString].findIndex(n => n.id === editingNoteId);
        if (noteIndex > -1) {
            notesData[selectedDateString][noteIndex].time = time;
            notesData[selectedDateString][noteIndex].text = text;
            saveNotesData();
            renderNotesList();
            closeEditModal();
        }
    }

    // Event Listeners
    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    todayBtn.addEventListener('click', () => {
        currentDate = new Date();
        renderCalendar();
    });

    closeModalBtn.addEventListener('click', closeNoteModal);
    
    // Close modal when clicking outside
    noteModal.addEventListener('click', (e) => {
        if (e.target === noteModal) closeNoteModal();
    });

    addNoteBtn.addEventListener('click', addNote);
    
    noteText.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNote();
    });

    closeEditModalBtn.addEventListener('click', closeEditModal);

    editNoteModal.addEventListener('click', (e) => {
        if (e.target === editNoteModal) closeEditModal();
    });

    saveEditNoteBtn.addEventListener('click', saveEditedNote);
    
    editNoteText.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveEditedNote();
    });

    // Initialize calendar on load
    renderCalendar();
});
