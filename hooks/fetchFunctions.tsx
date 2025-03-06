export async function fetchClasses() {
    const res = await fetch('/api/classes');
    return res.json();
}
