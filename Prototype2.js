const STORAGE_KEY = 'syllabus-snap-data';

const defaultData = {
    profile: { name: '', bio: '' },
    courses: [],
    assignments: []
};

let appData = loadData();

function loadData() {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : defaultData;
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    renderAll();
}


const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.page-section');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        
        navBtns.forEach(b => b.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        sections.forEach(s => s.classList.add('hidden'));

        
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
    });
});



function getCourse(id) {
    return appData.courses.find(c => c.id === id);
}

function calculatePriority(assignment) {
    const now = new Date();
    const due = new Date(assignment.dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    
    if (diffDays <= 0) return 999;
    return assignment.weight / diffDays;
}

function getUrgencyColor(assignment) {
    const weight = parseInt(assignment.weight);
    if (weight >= 20) return 'red';
    if (weight >= 10) return 'orange';
    return 'blue';
}



function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        appData.assignments = appData.assignments.filter(t => t.id !== id);
        saveData();
    }
}

function deleteCourse(id) {
    if (confirm('Warning: Deleting this course will also delete all associated assignments. Are you sure?')) {
        appData.courses = appData.courses.filter(c => c.id !== id);
        
        appData.assignments = appData.assignments.filter(t => t.courseId !== id);
        saveData();
    }
}



function renderAll() {
    renderHeatmap();
    renderCountdown();
    renderCourseList();
    renderCourseSelect();
    renderProfile();
}

function renderHeatmap() {
    const grid = document.getElementById('heatmap-grid');
    if (!grid) return;
    grid.innerHTML = '';

    
    const sorted = [...appData.assignments].sort((a, b) => {
        return calculatePriority(b) - calculatePriority(a);
    });

    if (sorted.length === 0) {
        grid.innerHTML = '<p>No assignments yet. Go to Import to add some!</p>';
        return;
    }

    sorted.forEach(task => {
        const course = getCourse(task.courseId);
        const colorClass = getUrgencyColor(task);
        const borderColor = course ? course.color : '#ccc';
        
        const card = document.createElement('div');
        card.className = 'assignment-card';
        card.style.borderLeftColor = borderColor;
        
        const date = new Date(task.dueDate).toLocaleDateString();
        
        card.innerHTML = `
            <div class="header">
                <h4>${task.name}</h4>
                <button class="btn-delete" onclick="deleteTask('${task.id}')" title="Delete Task">🗑️</button>
            </div>
            <div class="meta">
                <span>${course ? course.code : 'Unknown Course'}</span> • 
                <span>${date}</span>
            </div>
            <span class="badge ${colorClass}">${task.category}</span>
            <span class="weight">Weight: ${task.weight}%</span>
        `;
        grid.appendChild(card);
    });
}

function renderCountdown() {
    const now = new Date();
    
    const heavyTasks = appData.assignments
        .filter(t => t.weight >= 10 && new Date(t.dueDate) > now)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const nextTask = heavyTasks[0];
    const label = document.getElementById('next-task-name');
    
    
    const daysEls = document.querySelectorAll('#days');
    const hoursEls = document.querySelectorAll('#hours');
    const minsEls = document.querySelectorAll('#minutes');
    const labels = document.querySelectorAll('.next-task-label');

    if (!nextTask) {
        daysEls.forEach(el => el.innerText = '00');
        hoursEls.forEach(el => el.innerText = '00');
        minsEls.forEach(el => el.innerText = '00');
        labels.forEach(el => el.innerText = "No upcoming heavyweight tasks!");
        return;
    }

    labels.forEach(el => el.innerText = `Next: ${nextTask.name} (${getCourse(nextTask.courseId)?.code})`);

    const due = new Date(nextTask.dueDate);
    const diff = due - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    daysEls.forEach(el => el.innerText = String(days).padStart(2, '0'));
    hoursEls.forEach(el => el.innerText = String(hours).padStart(2, '0'));
    minsEls.forEach(el => el.innerText = String(minutes).padStart(2, '0'));
}

function renderCourseList() {
    const list = document.getElementById('course-list');
    if (!list) return;

    list.innerHTML = '';
    
    appData.courses.forEach(c => {
        const div = document.createElement('div');
        div.className = 'assignment-card'; 
        div.style.borderLeftColor = c.color;
        div.innerHTML = `
            <div class="header">
                <h4>${c.name}</h4>
                <button class="btn-delete" onclick="deleteCourse('${c.id}')" title="Delete Course">🗑️</button>
            </div>
            <p>${c.code}</p>
        `;
        list.appendChild(div);
    });
}

function renderCourseSelect() {
    const select = document.getElementById('import-course-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose a Course --</option>';
    appData.courses.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.innerText = `${c.code} - ${c.name}`;
        select.appendChild(opt);
    });
}

function renderProfile() {
    const nameInput = document.getElementById('user-name');
    const bioInput = document.getElementById('user-bio');
    
    if (nameInput) nameInput.value = appData.profile.name || '';
    if (bioInput) bioInput.value = appData.profile.bio || '';
    
    if (appData.profile.name) {
        const welcomeMsg = document.getElementById('welcome-msg');
        if (welcomeMsg) welcomeMsg.innerText = `Welcome back, ${appData.profile.name}!`;
    }
}



const addCourseForm = document.getElementById('add-course-form');
if (addCourseForm) {
    addCourseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newCourse = {
            id: crypto.randomUUID(),
            name: document.getElementById('course-name').value,
            code: document.getElementById('course-code').value,
            color: document.getElementById('course-color').value
        };
        appData.courses.push(newCourse);
        saveData();
        e.target.reset();
        alert('Course added!');
    });
}

const syllabusForm = document.getElementById('syllabus-form');
if (syllabusForm) {
    syllabusForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const courseId = document.getElementById('import-course-select').value;
        if (!courseId) {
            alert('Please select a course first.');
            return;
        }

        const newAssign = {
            id: crypto.randomUUID(),
            courseId: courseId,
            name: document.getElementById('assign-name').value,
            category: document.getElementById('assign-category').value,
            dueDate: document.getElementById('assign-date').value,
            weight: parseFloat(document.getElementById('assign-weight').value),
            completed: false
        };
        appData.assignments.push(newAssign);
        saveData();
        e.target.reset();
        alert('Assignment added!');
    });
}

const profileForm = document.getElementById('profile-form');
if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        appData.profile.name = document.getElementById('user-name').value;
        appData.profile.bio = document.getElementById('user-bio').value;
        saveData();
        alert('Profile saved!');
    });
}

const btnExport = document.getElementById('btn-export');
if (btnExport) {
    btnExport.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "syllabus_snap_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });
}

const fileImport = document.getElementById('file-import');
if (fileImport) {
    fileImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                appData = parsed;
                saveData();
                alert('Data restored successfully!');
            } catch (err) {
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    });
}

const btnClear = document.getElementById('btn-clear-data');
if (btnClear) {
    btnClear.addEventListener('click', () => {
        if(confirm('Are you sure? This will delete all your data.')) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    });
}


setInterval(renderCountdown, 60000); 
renderAll();