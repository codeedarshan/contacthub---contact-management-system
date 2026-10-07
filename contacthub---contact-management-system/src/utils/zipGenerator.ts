import JSZip from 'jszip';
import { FLASK_PROJECT_FILES } from '../data/flaskProjectFiles';

export async function downloadProjectZip(): Promise<void> {
  const zip = new JSZip();
  const rootFolder = zip.folder('contact_management');

  if (!rootFolder) return;

  for (const file of FLASK_PROJECT_FILES) {
    // Relative path inside contact_management
    const relativePath = file.path.replace(/^contact_management\//, '');
    rootFolder.file(relativePath, file.content);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);

  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = 'contact_management_flask_sqlite.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
}

export function exportContactsToCsv(contacts: any[]): void {
  const headers = ['ID', 'Full Name', 'Phone', 'Email', 'Category', 'City', 'Address', 'Notes', 'Created At'];
  const rows = contacts.map(c => [
    c.id,
    `"${c.full_name.replace(/"/g, '""')}"`,
    `"${c.phone.replace(/"/g, '""')}"`,
    `"${(c.email || '').replace(/"/g, '""')}"`,
    `"${c.category}"`,
    `"${(c.city || '').replace(/"/g, '""')}"`,
    `"${(c.address || '').replace(/"/g, '""')}"`,
    `"${(c.notes || '').replace(/"/g, '""')}"`,
    `"${c.created_at}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `contacts_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportContactsToJson(contacts: any[]): void {
  const jsonContent = JSON.stringify(contacts, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `contacts_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportContactToVCard(contact: any): void {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.full_name}`,
    `TEL;TYPE=CELL:${contact.phone}`,
    contact.email ? `EMAIL;TYPE=INTERNET:${contact.email}` : '',
    contact.address || contact.city ? `ADR;TYPE=HOME:;;${contact.address || ''};${contact.city || ''};;;` : '',
    `CATEGORIES:${contact.category}`,
    contact.notes ? `NOTE:${contact.notes.replace(/\n/g, '\\n')}` : '',
    'END:VCARD'
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${contact.full_name.toLowerCase().replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
