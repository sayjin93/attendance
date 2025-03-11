export async function fetchClasses() {
    const res = await fetch('/api/classes');
    return res.json();
}
export async function fetchSubjects() {
    const res = await fetch('/api/subjects');
    return res.json();
}
export async function fetchAssignments() {
    const res = await fetch('/api/assignments');
    return res.json();
}