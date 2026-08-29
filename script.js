const STORAGE_KEY = 'caresync.patient.records';

const defaultPatients = [
  {
    id: 1,
    patientIdCode: 'PT-1048',
    fullName: 'Emma Carter',
    age: 34,
    gender: 'Female',
    bloodType: 'A+',
    phone: '(555) 245-1786',
    email: 'emma.carter@email.com',
    insurance: 'BlueCross Health',
    lastVisit: '2026-08-20',
    condition: 'Hypertension',
    riskLevel: 'Moderate',
    allergies: 'Penicillin',
    medications: 'Lisinopril 10mg daily',
    medicalHistory: 'History of elevated blood pressure and mild sleep apnea. Follow-up on lifestyle modifications discussed.',
    carePlan: 'Maintain blood pressure logs and schedule quarterly review.',
    status: 'Monitoring'
  },
  {
    id: 2,
    patientIdCode: 'PT-2081',
    fullName: 'Daniel Brooks',
    age: 52,
    gender: 'Male',
    bloodType: 'O-',
    phone: '(555) 013-4672',
    email: 'daniel.brooks@email.com',
    insurance: 'HealthPrime',
    lastVisit: '2026-08-14',
    condition: 'Type 2 Diabetes',
    riskLevel: 'High',
    allergies: 'None',
    medications: 'Metformin 500mg twice daily',
    medicalHistory: 'Persistent elevated glucose levels with recent fasting blood sugar improvements after diet adjustments.',
    carePlan: 'Continue diabetic education and lab testing every 3 months.',
    status: 'Critical'
  },
  {
    id: 3,
    patientIdCode: 'PT-3129',
    fullName: 'Sophia Nguyen',
    age: 27,
    gender: 'Female',
    bloodType: 'B+',
    phone: '(555) 821-3348',
    email: 'sophia.nguyen@email.com',
    insurance: 'ApexCare',
    lastVisit: '2026-08-26',
    condition: 'Post-surgery recovery',
    riskLevel: 'Low',
    allergies: 'Latex',
    medications: 'Ibuprofen as needed',
    medicalHistory: 'Post-op recovery after appendectomy. Wound healing progressing well with no signs of infection.',
    carePlan: 'Monitor wound care and weekly physiotherapy sessions.',
    status: 'Recovered'
  }
];

const state = {
  patients: loadPatients(),
  selectedPatientId: null
};

const patientTableBody = document.getElementById('patientTableBody');
const patientForm = document.getElementById('patientForm');
const statusFilter = document.getElementById('statusFilter');
const globalSearch = document.getElementById('globalSearch');
const newPatientBtn = document.getElementById('newPatientBtn');
const resetFormBtn = document.getElementById('resetFormBtn');
const deletePatientBtn = document.getElementById('deletePatientBtn');
const appointmentList = document.getElementById('appointmentList');
const alertList = document.getElementById('alertList');

function loadPatients() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultPatients;
  } catch (error) {
    return defaultPatients;
  }
}

function savePatients() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.patients));
}

function getPatientById(id) {
  return state.patients.find((patient) => patient.id === Number(id));
}

function getStatusClass(status) {
  return status.toLowerCase().replace(/\s+/g, '');
}

function calculateRecordCompletion(patient) {
  const requiredFields = [
    patient.fullName,
    patient.patientIdCode,
    patient.age,
    patient.gender,
    patient.phone,
    patient.email,
    patient.insurance,
    patient.lastVisit,
    patient.condition,
    patient.riskLevel,
    patient.allergies,
    patient.medications,
    patient.medicalHistory,
    patient.carePlan,
    patient.status,
    patient.bloodType
  ];

  const filled = requiredFields.filter((value) => value && value.toString().trim() !== '').length;
  return Math.round((filled / requiredFields.length) * 100);
}

function renderStats() {
  const totalPatients = state.patients.length;
  const completeRecords = state.patients.filter((patient) => calculateRecordCompletion(patient) >= 80).length;
  const appointmentCount = state.patients.length + 4;
  const alertCount = state.patients.filter((patient) => patient.status === 'Critical').length + 2;

  document.getElementById('totalPatients').textContent = totalPatients;
  document.getElementById('completeRecords').textContent = `${completeRecords}/${totalPatients}`;
  document.getElementById('appointmentCount').textContent = appointmentCount;
  document.getElementById('alertCount').textContent = alertCount;
}

function renderAppointments() {
  const appointments = [
    { patient: 'Emma Carter', date: 'Today · 09:30 AM', reason: 'BP follow-up' },
    { patient: 'Daniel Brooks', date: 'Today · 11:00 AM', reason: 'Diabetes review' },
    { patient: 'Sophia Nguyen', date: 'Tomorrow · 02:15 PM', reason: 'Recovery check' },
    { patient: 'Lucas Patel', date: 'Thu · 08:45 AM', reason: 'Cardiac screening' }
  ];

  appointmentList.innerHTML = appointments
    .map(
      (item) => `
        <li>
          <div class="alert-meta">
            <h4>${item.patient}</h4>
            <p>${item.reason}</p>
          </div>
          <span class="alert-tag low">${item.date}</span>
        </li>
      `
    )
    .join('');
}

function renderAlerts() {
  const alerts = [
    { title: 'Critical diabetes case', detail: 'Daniel Brooks requires immediate medication review', level: 'high' },
    { title: 'Medication allergy update', detail: 'Add latex flag to Sophia Nguyen profile', level: 'medium' },
    { title: 'Annual screening due', detail: 'Three patients need preventive screening follow-ups', level: 'low' }
  ];

  alertList.innerHTML = alerts
    .map(
      (item) => `
        <li>
          <div class="alert-meta">
            <h4>${item.title}</h4>
            <p>${item.detail}</p>
          </div>
          <span class="alert-tag ${item.level}">${item.level}</span>
        </li>
      `
    )
    .join('');
}

function renderTable() {
  const searchText = globalSearch.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filteredPatients = state.patients.filter((patient) => {
    const matchesStatus = selectedStatus === 'all' || patient.status === selectedStatus;
    const haystack = [
      patient.fullName,
      patient.patientIdCode,
      patient.condition,
      patient.status,
      patient.email
    ]
      .join(' ')
      .toLowerCase();
    const matchesSearch = haystack.includes(searchText);
    return matchesStatus && matchesSearch;
  });

  if (!filteredPatients.length) {
    patientTableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">No patient records match the current filters.</div>
        </td>
      </tr>
    `;
    return;
  }

  patientTableBody.innerHTML = filteredPatients
    .map((patient) => {
      const completion = calculateRecordCompletion(patient);
      return `
        <tr>
          <td class="patient-name">
            <strong>${patient.fullName}</strong>
            <small>${patient.patientIdCode}</small>
          </td>
          <td>${patient.age}</td>
          <td>${patient.condition}</td>
          <td>${patient.lastVisit || '—'}</td>
          <td><span class="badge ${getStatusClass(patient.status)}">${patient.status}</span></td>
          <td>
            <div class="progress-chip">
              <div class="progress-bar"><span style="width: ${completion}%"></span></div>
              <small>${completion}%</small>
            </div>
          </td>
          <td>
            <button class="row-action" data-action="edit" data-id="${patient.id}">Edit</button>
            <button class="delete-btn" data-action="delete" data-id="${patient.id}">Delete</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function populateForm(patient) {
  const formEntries = patientForm.elements;
  for (const element of formEntries) {
    if (!element.name) continue;
    const value = patient[element.name];
    if (value !== undefined && value !== null) {
      element.value = value;
    }
  }
  state.selectedPatientId = patient.id;
}

function resetForm() {
  patientForm.reset();
  document.getElementById('patientId').value = '';
  state.selectedPatientId = null;
  deletePatientBtn.style.display = 'none';
}

function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(patientForm);
  const patientData = Object.fromEntries(formData.entries());

  const patientPayload = {
    ...patientData,
    id: state.selectedPatientId || Date.now(),
    age: Number(patientData.age || 0),
    status: patientData.status || 'Stable',
    riskLevel: patientData.riskLevel || 'Low'
  };

  if (state.selectedPatientId) {
    state.patients = state.patients.map((patient) =>
      patient.id === state.selectedPatientId ? { ...patient, ...patientPayload } : patient
    );
  } else {
    state.patients.unshift(patientPayload);
  }

  savePatients();
  renderAll();
  resetForm();
}

function handleTableActions(event) {
  const button = event.target.closest('button');
  if (!button) return;

  const patientId = Number(button.dataset.id);
  const action = button.dataset.action;
  const patient = getPatientById(patientId);

  if (!patient) return;

  if (action === 'edit') {
    populateForm(patient);
    deletePatientBtn.style.display = 'inline-flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (action === 'delete') {
    const shouldDelete = window.confirm(`Delete patient record for ${patient.fullName}?`);
    if (!shouldDelete) return;

    state.patients = state.patients.filter((item) => item.id !== patientId);
    savePatients();
    renderAll();
    resetForm();
  }
}

function renderAll() {
  renderStats();
  renderTable();
  renderAppointments();
  renderAlerts();
}

patientForm.addEventListener('submit', handleFormSubmit);
patientTableBody.addEventListener('click', handleTableActions);
statusFilter.addEventListener('change', renderTable);
globalSearch.addEventListener('input', renderTable);
newPatientBtn.addEventListener('click', resetForm);
resetFormBtn.addEventListener('click', resetForm);
deletePatientBtn.addEventListener('click', () => {
  if (!state.selectedPatientId) return;
  const patient = getPatientById(state.selectedPatientId);
  if (!patient) return;

  const confirmDelete = window.confirm(`Delete patient record for ${patient.fullName}?`);
  if (!confirmDelete) return;

  state.patients = state.patients.filter((item) => item.id !== state.selectedPatientId);
  savePatients();
  renderAll();
  resetForm();
});

resetForm();
renderAll();
